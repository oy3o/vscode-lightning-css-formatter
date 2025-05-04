# Lightning CSS Simple Formatter for VS Code

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/oy3o.lightning-css-formatter?style=flat-square&label=Marketplace)](https://marketplace.visualstudio.com/items?itemName=oy3o.lightning-css-formatter)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/oy3o.lightning-css-formatter?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=oy3o.lightning-css-formatter)

A simple Visual Studio Code extension that utilizes the blazing fast [Lightning CSS](https://lightningcss.dev/) engine to format your CSS files and automatically merge shorthand properties.

## Features

*   **CSS Formatting:** Formats your entire CSS file according to Lightning CSS's default pretty-print rules (when `minify` is `false`).
*   **Shorthand Merging:** Automatically merges compatible longhand properties into their shorthand equivalents (e.g., `margin-top`, `margin-right`, `margin-bottom`, `margin-left` into `margin`). This is a default optimization behavior of Lightning CSS.
*   **Fast Processing:** Leverages the performance of the Rust-based Lightning CSS parser and transformer.
*   **Simple Usage:** Provides a single command to format the currently active CSS file.
*   **Error Reporting:** Displays detailed errors from Lightning CSS directly in VS Code notifications, including line and column numbers when available.

## How it Works

This extension takes the entire content of your active CSS file, passes it to the `lightningcss.transform` function with `minify: false`. Lightning CSS then parses, processes (including merging shorthands and applying other non-minifying optimizations), and pretty-prints the CSS. The resulting formatted code then replaces the original content of your editor.

**Note:** This extension does *not* minify your code. It focuses on formatting and applying safe optimizations like shorthand merging.

## Requirements

*   Visual Studio Code (version 1.60 or newer recommended)

## Installation

1.  Open Visual Studio Code.
2.  Go to the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3.  Search for `Lightning CSS Simple Formatter`.
4.  Click **Install**.

Alternatively, you can install it from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=oy3o.lightning-css-formatter) (link will work after publishing).

## Usage

1.  Open a CSS file (`.css`) in VS Code.
2.  Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
3.  Type or select the command: `Lightning CSS: Format and Merge Shorthands`.
4.  The extension will process the file using Lightning CSS and replace the editor's content with the formatted result.

You will receive notifications for:
*   Successful formatting.
*   Cases where the CSS is already formatted/optimized (no changes made).
*   Errors encountered during processing (e.g., CSS syntax errors).
*   Warnings if the command is run on a non-CSS file or an empty file.

## Configuration

Currently, this extension does not offer any specific configuration options. It uses the default formatting and optimization behavior of Lightning CSS (with `minify: false` and `drafts.customMedia: true`).

## Known Issues & Limitations

*   **Whole File Replacement:** The command always processes and replaces the *entire* content of the file. It does not support formatting selected ranges.
*   **No VS Code Formatter Integration:** This extension provides a command but does *not* integrate with VS Code's built-in "Format Document" (`Shift+Alt+F`) or format-on-save features. You must run the command manually.
*   **Formatting Style:** The output format is determined by Lightning CSS's pretty-printing and cannot be customized through this extension.
*   **Potential Conflicts:** If you have other CSS formatters enabled, ensure they don't interfere or configure them appropriately.

## Contributing

Contributions, issues, and feature requests are welcome! Please check the [GitHub repository](https://github.com/oy3o/vscode-lightning-css-formatter)

## License

[MIT](LICENSE)
