# UI prototype

Build a few variants, usually three. Change the layout, the order of information, or the steps in the task so each variant helps you learn something different. Different colors or text alone do not make a new variant.

Use the project's components and realistic data. If possible, show the variants on an existing page with its usual navigation and content. Leave the existing page unchanged when no variant is selected. Enable the variants only in development or preview, and exclude them from production. If no suitable page exists, create a clearly named prototype route using the project's routing conventions.

Use a URL parameter such as `?variant=A` to select a variant. Add a small switcher showing the current variant with previous and next controls. Opening a shared link or reloading the page should show the selected variant. Arrow keys can switch variants except when the user is entering or editing text.

Give the user the URL and ask what each variant helps them understand about the design. They may want to combine parts of different variants or may find that none of them fits. Use their reactions to revise the design. Implement the resulting design using the normal production checks and remove the variants, switcher, and any temporary route.
