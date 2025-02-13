import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const template = `
    <div class="flex flex-row justify-between items-center">
      <span class="text-base text-secondary-900 font-medium">Direct</span>
      <fc-icon-button (onClick)="createDirectChannel()">
        <fc-icon icon="icon-add"></fc-icon>
      </fc-icon-button>
    </div>
`;

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
      const className = componentName
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");

      // Create component content
      const componentContent = `import { Component } from '@angular/core';

@Component({
	selector: 'app-${componentName}',
	template: \`
		${selectedText}
	\`,
	standalone: true
})
export class ${className}Component {
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

        // Open the new file
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);

        // Delete the selected text
        await editor.edit(editBuilder => {
          editBuilder.delete(selection);
        });

        vscode.window.showInformationMessage(
          `Component ${componentName} created successfully!`
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to create component: ${error}`);
      }
    }
  );
  context.subscriptions.push(extractComponent);
}

export function deactivate() {}
