import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  let extractComponent = vscode.commands.registerCommand(
    "angularextractor.extractComponent",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor");
        return;
      }

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);

      if (!selectedText) {
        vscode.window.showErrorMessage("No text selected");
        return;
      }

      // Ask for component name
      const componentName = await vscode.window.showInputBox({
        prompt: "Enter component name (in kebab-case)",
        placeHolder: "my-new-component",
      });

      if (!componentName) {
        return;
      }

      // Convert kebab-case to PascalCase for the class name
      const className =
        componentName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("") + "Component"; // Ensure "Component" suffix

      // Create component content
      const componentContent = `import { Component } from '@angular/core';

@Component({
	selector: 'app-${componentName}',
	template: \`
		${selectedText}
	\`,
	standalone: true
})
export class ${className} {
}
`;

      // Get the current file's directory
      const currentDir = path.dirname(editor.document.uri.fsPath);
      const newFilePath = path.join(
        currentDir,
        `${componentName}.component.ts`
      );

      try {
        // Create the new file
        const uri = vscode.Uri.file(newFilePath);
        const writeData = Buffer.from(componentContent, "utf8");
        await vscode.workspace.fs.writeFile(uri, writeData);

        // Delete the selected text and insert the new component selector
        await editor.edit((editBuilder) => {
          editBuilder.replace(selection, `<app-${componentName}></app-${componentName}>`);
        });

        // Update the original component to import and include the new component
        await updateOriginalComponent(editor, componentName, className);

        // Open the new file
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);

        vscode.window.showInformationMessage(
          `Component ${componentName} created and imported successfully!`
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to create component: ${error}`);
      }
    }
  );
  context.subscriptions.push(extractComponent);
}

async function extractInnerComponentImports(){
	// todo: extract inner component imports
}

async function addImportsAndOutputs(){
	// todo: add imports and outputs to the component
}

async function updateOriginalComponent(
  editor: vscode.TextEditor,
  componentName: string,
  className: string
) {
  const document = editor.document;
  const originalComponentContent = document.getText();

  // 1. Add import statement
  const importStatement = `import { ${className} } from './${componentName}.component';\n`;
  const updatedContentWithImport = importStatement + originalComponentContent;

  // 2. Find @Component decorator and add to imports array
  const componentDecoratorRegex = /@Component\(\s*\{/;
  const importsRegex = /imports\s*:\s*\[([^\]]*)\]/;
  const match = originalComponentContent.match(componentDecoratorRegex);

  if (match) {
    let updatedComponentContent = updatedContentWithImport;
    const decoratorStartIndex = match.index!;
    const decoratorEndIndex =
      originalComponentContent.indexOf("})", decoratorStartIndex) + 2;
    let decoratorContent = originalComponentContent.slice(
      decoratorStartIndex,
      decoratorEndIndex
    );

    const importsMatch = decoratorContent.match(importsRegex);
    if (importsMatch) {
      // Imports array exists, add the new component
      const existingImports = importsMatch[1].trim();
      const newImportsArray = existingImports
        ? `imports: [${className},${existingImports}]`
        : `imports: [${className}]`;

      decoratorContent = decoratorContent.replace(
        importsRegex,
        newImportsArray
      );
    } else {
      // Imports array does not exist, add it
      decoratorContent = decoratorContent.replace(
        "}",
        `,\n  imports: [${className}]\n}`
      );
    }
    updatedComponentContent = updatedContentWithImport.replace(
      originalComponentContent.slice(decoratorStartIndex, decoratorEndIndex),
      decoratorContent
    );

    // Write the updated content back to the original component file
    await editor.edit((editBuilder) => {
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(originalComponentContent.length)
      );
      editBuilder.replace(fullRange, updatedComponentContent);
    });
  } else {
    vscode.window.showErrorMessage(
      "Could not find @Component decorator in the original file."
    );
  }
}

export function deactivate() {}
