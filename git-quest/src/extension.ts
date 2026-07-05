import * as vscode from 'vscode';
import { GitQuestTreeDataProvider, GitQuestTreeItem } from './tree-view';
import { GitService } from './git-service';

export function activate(context: vscode.ExtensionContext) {
  const gitService = new GitService();
  const treeDataProvider = new GitQuestTreeDataProvider(gitService);

  const treeView = vscode.window.createTreeView('git-quest-view', {
    treeDataProvider,
    showCollapseAll: false,
  });
  context.subscriptions.push(treeView);

  context.subscriptions.push(
    vscode.commands.registerCommand('git-quest.openRepository', () => {
      vscode.window.showInformationMessage('Repository view coming soon!');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('git-quest.openCurrentQuest', () => {
      vscode.window.showInformationMessage('Current Quest view coming soon!');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('git-quest.openAchievements', () => {
      vscode.window.showInformationMessage('Achievements view coming soon!');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('git-quest.stageFile', async () => {
      const item = treeView.selection[0];
      if (!item) {
        vscode.window.showWarningMessage('No file selected to stage.');
        return;
      }
      // Ensure it's a file item (has label that is a file path)
      const fileItem = item as GitQuestTreeItem;
      const filePath = fileItem.label;
      try {
        await gitService.stageFile(filePath);
        treeDataProvider.refresh();
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to stage file: ${error}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('git-quest.unstageFile', async () => {
      const item = treeView.selection[0];
      if (!item) {
        vscode.window.showWarningMessage('No file selected to unstage.');
        return;
 }
      const fileItem = item as GitQuestTreeItem;
      const filePath = fileItem.label;
      try {
        await gitService.unstageFile(filePath);
        treeDataProvider.refresh();
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to unstage file: ${error}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('git-quest.commit', async () => {
      const message = await vscode.window.showInputBox({
        prompt: 'Enter commit message',
        validateInput: (value) => {
          if (!value || !value.trim()) {
            return 'Commit message cannot be empty';
          }
          return null;
        },
      });

      if (!message) {
        return;
      }

      try {
        await gitService.commit(message.trim());
        treeDataProvider.refresh();
        vscode.window.showInformationMessage('Commit succeeded');
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to commit: ${error}`);
      }
    })
  );
}

export function deactivate() {}
