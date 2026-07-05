import * as vscode from 'vscode';
import * as path from 'path';
import { GitService, GitRepositoryInfo, GitCommit } from './git-service';

export class GitQuestTreeItem extends vscode.TreeItem {
  public children?: GitQuestTreeItem[];

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
  private cachedCommits: GitCommit[] | null = null;

  constructor(private gitService: GitService) {}

  getTreeItem(element: GitQuestTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: GitQuestTreeItem): Promise<GitQuestTreeItem[]> {
    if (element) {
      return element.children || [];
    }

    if (!this.cachedInfo) {
      this.cachedInfo = await this.gitService.getRepositoryInfo();
    }

    if (!this.cachedInfo.isGitRepository) {
      return [new GitQuestTreeItem('No Git repository found', vscode.TreeItemCollapsibleState.None)];
    }

    // Fetch commits if not cached
    if (!this.cachedCommits) {
      this.cachedCommits = await this.gitService.getRecentCommits(10);
    }

    const repoNode = new GitQuestTreeItem('Repository', vscode.TreeItemCollapsibleState.Expanded);
    const repoChildren: GitQuestTreeItem[] = [];

    // Current Branch
    const branch = this.cachedInfo.currentBranch || 'unknown';
    repoChildren.push(new GitQuestTreeItem(`Current Branch: ${branch}`, vscode.TreeItemCollapsibleState.None));

    // Modified Files (collapsible)
    const modifiedNode = new GitQuestTreeItem(
      `Modified Files (${this.cachedInfo.modifiedFileCount})`,
      vscode.TreeItemCollapsibleState.Collapsed
    );
    modifiedNode.children = this.cachedInfo.modifiedFiles.map((filePath) => {
      const item = new GitQuestTreeItem(filePath, vscode.TreeItemCollapsibleState.None, {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [vscode.Uri.file(path.join(this.cachedInfo!.rootPath!, filePath))],
      });
      item.contextValue = 'modifiedFile';
      return item;
    });
    repoChildren.push(modifiedNode);

    // Staged Files (collapsible)
    const stagedNode = new GitQuestTreeItem(
      `Staged Files (${this.cachedInfo.stagedFileCount})`,
      vscode.TreeItemCollapsibleState.Collapsed
    );
    stagedNode.children = this.cachedInfo.stagedFiles.map((filePath) => {
      const item = new GitQuestTreeItem(filePath, vscode.TreeItemCollapsibleState.None, {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [vscode.Uri.file(path.join(this.cachedInfo!.rootPath!, filePath))],
      });
      item.contextValue = 'stagedFile';
      return item;
    });
    repoChildren.push(stagedNode);

    // Repository Status
    repoChildren.push(new GitQuestTreeItem(`Repository Status: ${this.cachedInfo.repositoryStatus}`, vscode.TreeItemCollapsibleState.None));

    // History (collapsible)
    const historyNode = new GitQuestTreeItem(
      `History (${this.cachedCommits.length})`,
      vscode.TreeItemCollapsibleState.Collapsed
    );
    historyNode.children = this.cachedCommits.map((commit) => {
      const label = `${commit.hash} - ${commit.message} (${commit.author}, ${commit.date})`;
      return new GitQuestTreeItem(label, vscode.TreeItemCollapsibleState.None);
    });
    repoChildren.push(historyNode);

    repoNode.children = repoChildren;

    return [repoNode];
  }

  refresh(): void {
    this.cachedInfo = null;
    this.cachedCommits = null;
    this._onDidChangeTreeData.fire();
  }
}
