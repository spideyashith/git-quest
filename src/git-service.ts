import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

export interface GitRepositoryInfo {
  isGitRepository: boolean;
  rootPath: string | null;
  currentBranch: string | null;
  error?: string;
}

export class GitService {
  private rootPath: string | null;

  constructor() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    this.rootPath = workspaceFolders && workspaceFolders.length > 0
      ? workspaceFolders[0].uri.fsPath
      : null;
  }

  getRepositoryPath(): string | null {
    return this.rootPath;
  }

  async isGitRepository(): Promise<boolean> {
    if (!this.rootPath) {
      return false;
    }
    try {
      const gitDir = path.join(this.rootPath, '.git');
      await fs.promises.stat(gitDir);
      return true;
    } catch {
      return false;
    }
  }

  async getCurrentBranch(): Promise<string | null> {
    if (!this.rootPath) {
      return null;
    }
    return new Promise((resolve) => {
      exec('git branch --show-current', { cwd: this.rootPath! }, (error, stdout) => {
        if (error) {
          resolve(null);
          return;
        }
        const branch = stdout.trim();
        resolve(branch || null);
      });
    });
  }

  async getRepositoryInfo(): Promise<GitRepositoryInfo> {
    if (!this.rootPath) {
      return {
        isGitRepository: false,
        rootPath: null,
        currentBranch: null,
        error: 'No workspace folder is open',
      };
    }

    const isGitRepo = await this.isGitRepository();
    if (!isGitRepo) {
      return {
        isGitRepository: false,
        rootPath: this.rootPath,
        currentBranch: null,
      };
    }

    const currentBranch = await this.getCurrentBranch();
    return {
      isGitRepository: true,
      rootPath: this.rootPath,
      currentBranch,
    };
  }
}
