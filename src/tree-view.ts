import * as vscode from 'vscode';
import { GitService, GitRepositoryInfo } from './git-service';

export class GitQuestTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.command = command;
  }
}

export class GitQuestTreeDataProvider implements vscode.TreeDataProvider<GitQuestTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<GitQuestTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private cachedInfo: GitRepositoryInfo | null = null;

  constructor(private gitService: GitService) {}

  getTreeItem(element: GitQuestTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: GitQuestTreeItem): Promise<GitQuestTreeItem[]> {
    if (element) {
      return [];
    }

    if (!this.cachedInfo) {
      this.cachedInfo = await this.gitService.getRepositoryInfo();
    }

    const items: GitQuestTreeItem[] = [];

    if (this.cachedInfo.isGitRepository) {
      const branch = this.cachedInfo.currentBranch || 'unknown';
      items.push(new GitQuestTreeItem(`Current Branch: ${branch}`, vscode.TreeItemCollapsibleState.None));
    } else {
      items.push(new GitQuestTreeItem('No Git repository found', vscode.TreeItemCollapsibleState.None));
    }

    items.push(new GitQuestTreeItem('Repository', vscode.TreeItemCollapsibleState.None, {
      command: 'git-quest.openRepository',
      title: 'Open Repository',
    }));

    items.push(new GitQuestTreeItem('Current Quest', vscode.TreeItemCollapsibleState.None, {
      command: 'git-quest.openCurrentQuest',
      title: 'Open Current Quest',
    }));

    items.push(new GitQuestTreeItem('Achievements', vscode.TreeItemCollapsibleState.None, {
      command: 'git-quest.openAchievements',
      title: 'Open Achievements',
    }));

    return items;
  }

  refresh(): void {
    this.cachedInfo = null;
    this._onDidChangeTreeData.fire();
  }
}
