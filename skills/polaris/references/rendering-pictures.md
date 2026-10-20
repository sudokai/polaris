# Rendering pictures

- **Screenshots and videos:** embed each one inline and also link its file path.
- **Diagrams:** in a harness that renders Mermaid, draw a diagram as a Mermaid code block. In any other harness, draw it as plain text in a code block.
  - Render Mermaid: `pi`, `grok-build`, `codex`, and `cursor`.
  - Do not render Mermaid: `claude-code`, `hermes`, `dsh`, and any harness not listed here.
- To show an HTML file, use the harness's own way to publish or preview a page when it has one. Otherwise give the file's path and open it in the browser with the system opener: `open` on macOS, `xdg-open` on Linux, or `start` on Windows.
