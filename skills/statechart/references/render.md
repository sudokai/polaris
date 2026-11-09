# Render a chart

Render each `.mmd` file with the npm package `pele@1.9.0`, installed once outside the repository, and give the user the SVG. Write each SVG next to its `.mmd` file, with the same name. The API is at https://pele.run/api. Pass `{ limit: 1_000_000, outputLimit: 8_000_000, maxEdges: 10_000 }` as the options of `render`, because Pele's defaults are too small for a chart of 500 states. If Pele throws a `PeleError`, show the user the Mermaid text and the error. Use another renderer only when the user asks.

## Colors

Pele ignores Mermaid `theme` and `themeVariables`. Instead, set its `--pele-*` CSS variables on `.pele`; https://pele.run/theming lists them.

The command gives each state class names that Pele puts on its node: the group color (such as `teal`), `breaks` or `mayBreak` for a bad state, `bugPath` for a state on the shortest path to a bug, and `repeats` for a state that a PROPERTY counterexample repeats forever. The `.mmd` file defines colors only for `breaks` and `mayBreak`, so that any Mermaid viewer shows the bug marks. Pele writes those definitions as `style` attributes, which beat normal CSS rules, so the mark rules below use `!important`; without it, a dark theme keeps the light colors. Put the mark rules after the group colors, so a mark shows over its group color.

Put these suggested colors in a `<style>` element at the start of each SVG, so it follows the viewer's light or dark setting:

```css
.pele {
  --pele-bg: #ffffff;
  --pele-fg: #1c1c1c;
  --pele-muted: #656565;
  --pele-line: #808080;
  --pele-surface: #fcfcfc;
  --pele-surface-alt: #f1f1f1;
  --pele-border: #c9c9c9;
}
.pele .blue rect { fill: #c3e0ff; }
.pele .orange rect { fill: #f0d3bf; }
.pele .purple rect { fill: #e3d5ff; }
.pele .yellow rect { fill: #f0dcbf; }
.pele .teal rect { fill: #bfe3df; }
.pele .tan rect { fill: #e5d9ce; }
.pele .pink rect { fill: #ffcbe6; }
.pele .breaks rect {
  fill: #ffecee !important;
  stroke: #e72e3b !important;
  stroke-width: 2.5px !important;
}
.pele .breaks text {
  fill: #cd2834 !important;
}
.pele .mayBreak rect {
  fill: #fff3e6 !important;
  stroke: #e8730c !important;
  stroke-width: 2.5px !important;
}
.pele .mayBreak text {
  fill: #b85a06 !important;
}
.pele .bugPath rect {
  stroke: #1680f3 !important;
  stroke-width: 2.5px !important;
}
.pele .repeats rect {
  stroke: #9b35d6 !important;
  stroke-width: 2.5px !important;
  stroke-dasharray: 6 3;
}
@media (prefers-color-scheme: dark) {
  .pele {
    --pele-bg: #1f1f1f;
    --pele-fg: #f5f5f5;
    --pele-muted: #acacac;
    --pele-line: #939393;
    --pele-surface: #121212;
    --pele-surface-alt: #2c2c2c;
    --pele-border: #4e4e4e;
  }
  .pele .blue rect { fill: #1b3857; }
  .pele .orange rect { fill: #573117; }
  .pele .purple rect { fill: #3c2e57; }
  .pele .yellow rect { fill: #573d17; }
  .pele .teal rect { fill: #174641; }
  .pele .tan rect { fill: #3d3127; }
  .pele .pink rect { fill: #57233e; }
  .pele .breaks rect {
    fill: #2e2021 !important;
    stroke: #cf2b35 !important;
  }
  .pele .breaks text {
    fill: #ff6463 !important;
  }
  .pele .mayBreak rect {
    fill: #2e2619 !important;
    stroke: #d0700f !important;
  }
  .pele .mayBreak text {
    fill: #ffa257 !important;
  }
  .pele .bugPath rect {
    stroke: #116dd2 !important;
  }
  .pele .repeats rect {
    stroke: #9a3fcf !important;
  }
}
```
