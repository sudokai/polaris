#!/usr/bin/env bash
# Rebuild the vendored Lantern bundle from a pinned commit of github.com/ivarvong/lantern.
#   scripts/build-lantern-bundle.sh [commit]
# Writes vendor/lantern.mjs (for the render script), vendor/player.html (the player page, with no
# scene yet), vendor/LICENSE, vendor/DOC-FORMAT.md, vendor/ring-buffer.doc.json and vendor/VERSION.
# To update Lantern, pass the new commit and review the diff.
set -euo pipefail

commit="${1:-2c7bad533be25fbd56d26a9a2b6c5651743f011e}"
esbuild_version="0.25.12"
skill_dir="$(cd "$(dirname "$0")/.." && pwd)"
vendor_dir="$skill_dir/vendor"
checkout="$(mktemp -d)"
trap 'rm -rf "$checkout"' EXIT

git -C "$checkout" init -q
git -C "$checkout" fetch -q --depth 1 https://github.com/ivarvong/lantern "$commit"
git -C "$checkout" checkout -q FETCH_HEAD
# Fixes for upstream bugs; each patch file explains its bug in its header.
for patch in "$skill_dir"/patches/*.patch; do
  git -C "$checkout" apply "$patch"
done

mkdir -p "$vendor_dir"
npx --yes "esbuild@$esbuild_version" "$checkout/src/index.ts" \
  --bundle --format=esm --platform=neutral --target=es2022 \
  --legal-comments=inline --outfile="$vendor_dir/lantern.mjs" --log-level=warning

# The player: Lantern's app/player.ts, with player/scenes.ts in place of the built-in
# scene list, so it plays the scene embedded in its page.
cp "$skill_dir/player/main.ts" "$checkout/app/polaris-main.ts"
cp "$skill_dir/player/scenes.ts" "$checkout/scenes/index.ts"
npx --yes "esbuild@$esbuild_version" "$checkout/app/polaris-main.ts" \
  --bundle --format=esm --platform=browser --target=es2022 --minify \
  --tsconfig="$checkout/tsconfig.app.json" --legal-comments=none --outfile="$checkout/player.js" --log-level=warning
python3 - "$skill_dir/player/page.html" "$checkout/app/player.css" "$checkout/player.js" "$vendor_dir/player.html" <<'PY'
import sys
page, css, js, out = sys.argv[1:]
page = open(page).read().replace("__LANTERN_CSS__", open(css).read())
page = page.replace("__LANTERN_JS__", open(js).read().replace("</script", "<\\/script"))
open(out, "w").write(page)
PY

cp "$checkout/LICENSE" "$vendor_dir/LICENSE"
# The upstream links point into the Lantern repo; point them at the vendored copies.
perl -0pe 's{\[src/doc\.ts\]\(\.\./src/doc\.ts\)}{`src/doc.ts`}; s{\[scenes/ring-buffer\.doc\.json\]\(\.\./scenes/ring-buffer\.doc\.json\)}{[ring-buffer.doc.json](ring-buffer.doc.json)}; s{\[scenes/ring-buffer\.doc\.ts\]\(\.\./scenes/ring-buffer\.doc\.ts\)}{`scenes/ring-buffer.doc.ts`}' \
  "$checkout/docs/DOC-FORMAT.md" > "$vendor_dir/DOC-FORMAT.md"
cp "$checkout/scenes/ring-buffer.doc.json" "$vendor_dir/ring-buffer.doc.json"
{
  printf 'github.com/ivarvong/lantern %s\nbuilt with esbuild %s\n' "$(git -C "$checkout" rev-parse HEAD)" "$esbuild_version"
  for patch in "$skill_dir"/patches/*.patch; do printf 'patched with patches/%s\n' "$(basename "$patch")"; done
} > "$vendor_dir/VERSION"
echo "wrote $vendor_dir"
