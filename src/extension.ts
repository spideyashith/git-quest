import * as vscode from 'vscode';
import { GitQuestTreeDataProvider } from './tree-view';
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
}

export function deactivate() {}
