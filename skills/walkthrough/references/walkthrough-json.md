# walkthrough.json and the simulator fragment

`scripts/render_walkthrough.py` turns two files into the walkthrough page:

```bash
python3 scripts/render_walkthrough.py walkthrough.json --simulator simulator.html --out walkthrough.html
```

To review the wording before rendering, run it with `--prose` instead of `--out`. It prints every piece of text the reader will see, as plain text, each line starting with its JSON path.

The script prints `Wrote <path>` on success. On failure it prints one line per problem, each starting with `walkthrough-render:` and the JSON path, and writes nothing. Fix every listed problem and run it again.

The page's styles and behavior live in `assets/walkthrough-template.html`. Don't edit the generated HTML; change the JSON or the simulator and render again.

## Field types

- **text:** plain text. The script escapes it.
- **html:** an HTML fragment, inserted as written. Use `<p>`, `<ul>`, `<code>`, `<strong>` and the classes below. A fragment must not contain `<script>`.

Classes you can use inside html fields:

| Class | Use |
|---|---|
| `<dl class="deflist">` with `<dt>`/`<dd>` | Orientation: one term per part of the system |
| `<div class="table-wrap"><table>…</table></div>` | Any table. On phones the rows stack, labelled by the column headers |
| `<span class="status ok">200</span>`, `bad`, `neutral` | A result, such as an HTTP status, an exit code or a validation verdict |
| `<span class="example">example data</span>` | A label on made-up values |

## Top-level fields

| Field | Type | Content |
|---|---|---|
| `title` | text | The change in a few words, as a heading. |
| `rail_title` | text | Short name shown above the chapter list. |
| `lede` | html | One sentence: what the change does and what that changes for the people or systems it affects. |
| `orientation`, `problem`, `solution` | html | Chapters 1 to 3. |
| `intuition.intro` | html | The idea in two or three sentences. The simulator follows it. |
| `decisions` | list | Key decisions, grouped. See below. |
| `tradeoffs` | list | `{ "name": text, "kind": "deliberate" \| "implicit", "text": html }` |
| `map` | list | Rows of the map. See below. |
| `changes_intro` | html | One sentence saying which section to read most closely. |
| `sections` | list | Chapter 6, most important first. See below. |
| `faq` | list | `{ "question": text, "answer": html }`. Answers start collapsed. |
| `quiz` | list | Up to 10 questions. See below. |

### decisions

```json
{ "group": "When to retry",
  "items": [ { "choice": "Retry only with an idempotency key",
               "instead": "instead of retrying every failed <code>POST</code>",
               "why": "The server can drop a duplicate order only when the retry carries the same key.",
               "section": "retry-policy" } ] }
```

Group decisions by the question they answer. `instead` names the rejected alternative. `section` is optional: the id of the section that implements the decision, which the page links to. Leave it out for a decision that no one section implements, such as "no data backfill".

### map

Each row is one of:

- `{ "type": "band", "label": text, "items": [html], "style": "edge" | "removed", "section": id }`: a wide box. `style` and `section` are optional. Use `edge` for systems outside the repo and `removed` for deleted code. With `section`, the band links to that section.
- `{ "type": "arrow", "label": text }`: a down arrow between rows. `label` is optional.
- `{ "type": "nodes", "nodes": [ { "section": id, "title": text, "text": html, "emphasis": true } ] }`: a row of boxes, each linking to its section. Two boxes sit side by side; more form a grid. `emphasis` marks the box to read first.

Each section gets at most one box, and every `section` must be the id of a section.

### sections

```json
{ "id": "retry-policy",
  "nav": "Retry policy",
  "title": "Deciding which requests to retry",
  "overview": "<p>…</p>",
  "callouts": [ { "kind": "warning", "label": "Warning", "text": "…" } ],
  "look_closer": [ "…" ],
  "files": [ { "path": "src/http/RetryPolicy.ts", "badge": "new",
               "summary": "Retries a request only when it carries an <code>Idempotency-Key</code>.",
               "hunk": "+export function shouldRetry(request: Request): boolean {\n…\n+}" } ] }
```

- `id`: lowercase letters, digits and hyphens. It can't be a chapter id (`orientation`, `problem`, `solution`, `intuition`, `map`, `changes`, `faq`, `quiz`). It also can't be `settings`, `sidebar`, `customize`, `upgrade` or `downloads`, or start with `comment-`, because some page hosts use those anchors for their own panels. The page numbers sections 6.1, 6.2… in list order.
- `nav`: two or three words for the chapter list.
- `callouts`: optional. `kind` is `warning` or `important`. `label` is a short word such as `Warning`, `Important` or `Feature flag`.
- `look_closer`: optional list of html items.
- `files[].summary`: html, one sentence.
- `files[].badge`: optional, `new` or `deleted`.
- `files[].hunk`: optional simplified diff text. Lines starting with `+` render as added, `-` as removed, `…` as a cut, anything else as context. To show two hunks of one file, put a `…` line between them. Without `hunk` the file shows as a plain row with its summary.

### quiz

```json
{ "topic": "Edge cases",
  "question": "A payment request times out twice. What does the customer see?",
  "options": [ "…", "…", "…", "…" ],
  "correct": 2,
  "why": "One or two sentences on why the right answer is right." }
```

Exactly 4 options. `correct` is the index of the right option. The script rejects a quiz of three or more questions where every right answer is in the same position.

## The simulator fragment

`simulator.html` holds the changeset's simulator, when it has one: its markup, then one `<script>`. Without a simulator, leave out `--simulator`. The render script places the markup after the Core intuition intro, and the fragment's script runs after the page's own script.

Build the markup from these classes. Use the ones the change needs:

| Class | Use |
|---|---|
| `div.sim` > `div.sim-head` (with `h3` and a `span` note) | The frame and its title |
| `div.sim-controls` > `div.ctl-label`, `div.seg` | A labelled group of option buttons: `<input type="radio">` followed by its `<label>` |
| `div.toggles` > `label` with a checkbox | On/off inputs |
| `div.sim-out` | The area for results, below the controls |
| `div.pipeline` > `div.stage` (`.k` label, `.v` value), `div.arrow` | Steps from input to result. Add `result` to the last stage |
| `div.chips` > `span.chip.yes` / `span.chip.no` | Yes/no facts about the result, such as which permissions a role has |
| `div.table-wrap` with an empty `tbody` | A results table with whatever columns the change needs |
| `div.sim-compare` > `div.sim-pane` (each with a `div.ctl-label`) | Panes side by side, such as a record before and after. They stack on phones |
| `pre.json`, `pre.logline` | A data record or other output, and a log line: add `warn` for a warning, or `quiet` for a muted line such as "nothing logged" |
| `div.sim-preview` | A frame for a hand-drawn sketch of a screen or component |

A fragment may include a `<style>` block for a UI sketch. Its rules apply to the whole page, so prefix every class it defines (`.sk-button`, not `.button`), and use the page's colour variables, such as `var(--line)`, only for the frame around the sketch.

The page script provides `window.walkthrough`:

- `fillResultRows(tbody, rows)`: each row is a list of cell html, one per column. Cells that changed since the last call are tinted briefly, or until the next change for readers who prefer reduced motion.
- `codeList(names)`: one name or a list of names as code, one per line. Use it to show several things that get the same result in one row.
- `statusPill(kind, text)`: a result label. `kind` is `ok`, `bad` or `neutral`.
- `detailLines(lines)`: small muted lines under a result, such as response headers or log fields.
- `escapeHtml(text)` and `labelTable(table)`.

### Example: logic

A retry rule: the reader picks a failure and sees what happens to the request.

```html
<div class="sim" id="sim">
  <div class="sim-head"><h3>Retry simulator</h3><span>Choose a failure. The requests are example data.</span></div>
  <div class="sim-controls">
    <div class="ctl-label">Failure</div>
    <div class="seg" role="radiogroup" aria-label="Failure">
      <input type="radio" name="failure" id="f-timeout" value="timeout" checked><label for="f-timeout">timeout</label>
      <input type="radio" name="failure" id="f-500" value="500"><label for="f-500">500</label>
    </div>
  </div>
  <div class="sim-out"><div class="table-wrap"><table>
    <thead><tr><th>Request</th><th>Result</th><th>What happens</th></tr></thead><tbody id="sim-rows"></tbody>
  </table></div></div>
</div>
<script>
(function () {
  var w = window.walkthrough;
  function render() {
    var failure = document.querySelector('input[name="failure"]:checked').value;
    w.fillResultRows(document.getElementById("sim-rows"), [
      [w.codeList("POST /orders"), w.statusPill(failure === "timeout" ? "ok" : "bad", failure === "timeout" ? "200 after retry" : "500"),
       failure === "timeout" ? "Retried once with the same idempotency key." : "Not retried." + w.detailLines(["Retry-After: 30"])]
    ]);
  }
  document.getElementById("sim").addEventListener("change", render);
  render();
})();
</script>
```

### Example: data

A migration that splits `full_name`: the reader picks a sample row and sees it before and after.

```html
<div class="sim" id="sim">
  <div class="sim-head"><h3>Name split</h3><span>Pick a row. The rows are example data.</span></div>
  <div class="sim-controls">
    <div class="ctl-label">Row</div>
    <div class="seg" role="radiogroup" aria-label="Row">
      <input type="radio" name="row" id="r-two" value="Ada Lovelace" checked><label for="r-two">two words</label>
      <input type="radio" name="row" id="r-one" value="Prince"><label for="r-one">one word</label>
      <input type="radio" name="row" id="r-three" value="Mary Ann Evans"><label for="r-three">three words</label>
    </div>
  </div>
  <div class="sim-out"><div class="sim-compare">
    <div class="sim-pane"><div class="ctl-label">Before</div><pre class="json" id="before"></pre></div>
    <div class="sim-pane"><div class="ctl-label">After</div><pre class="json" id="after"></pre></div>
  </div></div>
</div>
<script>
(function () {
  function render() {
    var fullName = document.querySelector('input[name="row"]:checked').value;
    var cut = fullName.lastIndexOf(" ");
    document.getElementById("before").textContent = JSON.stringify({ id: 7, full_name: fullName }, null, 2);
    document.getElementById("after").textContent = JSON.stringify({ id: 7,
      first_name: cut < 0 ? fullName : fullName.slice(0, cut), last_name: cut < 0 ? null : fullName.slice(cut + 1) }, null, 2);
  }
  document.getElementById("sim").addEventListener("change", render);
  render();
})();
</script>
```

### Example: UI

A new disabled state for a checkout button: the reader switches between before and after, and between states.

```html
<div class="sim" id="sim">
  <div class="sim-head"><h3>Checkout button</h3><span>A sketch of the button, not the real component.</span></div>
  <div class="sim-controls">
    <div class="ctl-label">Version</div>
    <div class="seg" role="radiogroup" aria-label="Version">
      <input type="radio" name="version" id="v-before" value="before"><label for="v-before">before</label>
      <input type="radio" name="version" id="v-after" value="after" checked><label for="v-after">after</label>
    </div>
    <div class="ctl-label">Cart</div>
    <div class="seg" role="radiogroup" aria-label="Cart">
      <input type="radio" name="cart" id="c-items" value="items" checked><label for="c-items">has items</label>
      <input type="radio" name="cart" id="c-empty" value="empty"><label for="c-empty">empty</label>
    </div>
  </div>
  <div class="sim-out">
    <style>
      .sk-pay { font: inherit; width: 100%; padding: 10px 16px; border: 0; border-radius: 8px; background: #1f6feb; color: #fff; }
      .sk-pay:disabled { background: #8c959f; }
    </style>
    <div class="sim-preview"><button class="sk-pay" id="sk-pay" type="button">Pay</button></div>
  </div>
</div>
<script>
(function () {
  function render() {
    var after = document.querySelector('input[name="version"]:checked').value === "after";
    var empty = document.querySelector('input[name="cart"]:checked').value === "empty";
    var button = document.getElementById("sk-pay");
    button.disabled = after && empty;
    button.textContent = after && empty ? "Your cart is empty" : "Pay";
  }
  document.getElementById("sim").addEventListener("change", render);
  render();
})();
</script>
```
