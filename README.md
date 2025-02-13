# Angular Extractor

A Visual Studio Code extension that helps extract and manage Angular components, services, and modules.

## Features

This extension provides tools to:
- Extract Angular components from existing templates
- Generate standalone components
- Refactor Angular modules
- Simplify component extraction workflows

## Requirements

- Visual Studio Code 1.8.0 or higher
- Angular project (version 8.0 or higher)

## Extension Settings

This extension contributes the following settings:

* `angularExtractor.autoImport`: Enable/disable automatic import statements after extraction
* `angularExtractor.styleFormat`: Set the default style format for extracted components (`css`, `scss`, or `less`)
* `angularExtractor.templateFormat`: Set the default template format (`inline` or `file`)

## Usage

1. Right-click on any Angular template code
2. Select "Extract to Component" from the context menu
3. Choose your extraction options
4. The extension will automatically create the new component with proper imports

## Known Issues

None at the moment.

## Release Notes

### 0.0.1

Initial release of Angular Extractor:
- Basic component extraction
- Module management
- Template separation

---

## Contributing

Feel free to contribute to this project on our [GitHub repository](your-repo-link-here).

## License

This extension is licensed under the [MIT License](LICENSE).
