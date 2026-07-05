import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec, execFile } from 'child_process';

export interface GitRepositoryInfo {
  isGitRepository: boolean;
  rootPath: string | null;
  currentBranch: string | null;
  modifiedFileCount: number;
  stagedFileCount: number;
  modifiedFiles: string[];
  stagedFiles: string[];
  repositoryStatus: 'clean' | 'dirty';
  error?: string;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
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

async stageFile(filePath: string): Promise<void> {
     if (!this.rootPath) {
       throw new Error('No workspace folder is open');
     }
     return new Promise((resolve, reject) => {
       execFile('git', ['add', filePath], { cwd: this.rootPath! }, (error) => {
         if (error) {
           reject(new Error(`Failed to stage file: ${error.message}`));
           return;
         }
         resolve();
       });
    });
   }

 async unstageFile(filePath: string): Promise<void> {
     if (!this.rootPath) {
       throw new Error('No workspace folder is open');
     }
     return new Promise((resolve, reject) => {
       execFile('git', ['reset', 'HEAD', filePath], { cwd: this.rootPath! }, (error) => {
         if (error) {
           reject(new Error(`Failed to unstage file: ${error.message}`));
           return;
         }
         resolve();
       });
      });
    }

  async commit(message: string): Promise<void> {
    if (!this.rootPath) {
      throw new Error('No workspace folder is open');
    }
    return new Promise((resolve, reject) => {
      execFile('git', ['commit', '-m', message], { cwd: this.rootPath! }, (error) => {
        if (error) {
          reject(new Error(`Failed to commit: ${error.message}`));
          return;
        }
        resolve();
      });
});
    }

  async getRecentCommits(limit: number = 10): Promise<GitCommit[]> {
    if (!this.rootPath) {
      throw new Error('No workspace folder is open');
    }
    return new Promise((resolve, reject) => {
      exec('git log --max-count=' + limit + ' --pretty=format:"%h|%s|%an|%ad"', { cwd: this.rootPath! }, (error, stdout) => {
        if (error) {
          reject(new Error(`Failed to get commit history: ${error.message}`));
          return;
        }
        const commits: GitCommit[] = [];
        const lines = stdout.split('\n').filter((line) => line.length > 0);
        for (const line of lines) {
          const [hash, message, author, date] = line.split('|');
          if (hash && message && author && date) {
            commits.push({ hash, message, author, date });
          }
        }
        resolve(commits);
      });
    });
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

  private async getGitStatus(): Promise<{
    modifiedFileCount: number;
    stagedFileCount: number;
    modifiedFiles: string[];
    stagedFiles: string[];
    repositoryStatus: 'clean' | 'dirty';
  }> {
    if (!this.rootPath) {
      return { modifiedFileCount: 0, stagedFileCount: 0, modifiedFiles: [], stagedFiles: [], repositoryStatus: 'clean' };
    }

    return new Promise((resolve) => {
      exec('git status --porcelain', { cwd: this.rootPath! }, (error, stdout) => {
        if (error) {
          resolve({ modifiedFileCount: 0, stagedFileCount: 0, modifiedFiles: [], stagedFiles: [], repositoryStatus: 'clean' });
          return;
        }

        let modifiedFileCount = 0;
        let stagedFileCount = 0;
        const modifiedFiles: string[] = [];
        const stagedFiles: string[] = [];

        const lines = stdout.split('\n').filter((line) => line.length > 0);

        for (const line of lines) {
          const x = line[0];
          const y = line[1];
          const filePath = line.substring(3);

          if (x !== ' ' && x !== '?') {
            stagedFileCount++;
            stagedFiles.push(filePath);
          }

          if (y !== ' ' && y !== '?') {
            modifiedFileCount++;
            modifiedFiles.push(filePath);
          }
        }

        const repositoryStatus = stagedFileCount > 0 || modifiedFileCount > 0 ? 'dirty' : 'clean';
        resolve({ modifiedFileCount, stagedFileCount, modifiedFiles, stagedFiles, repositoryStatus });
      });
    });
  }

  async getRepositoryInfo(): Promise<GitRepositoryInfo> {
    if (!this.rootPath) {
      return {
        isGitRepository: false,
        rootPath: null,
        currentBranch: null,
        modifiedFileCount: 0,
        stagedFileCount: 0,
        modifiedFiles: [],
        stagedFiles: [],
        repositoryStatus: 'clean',
        error: 'No workspace folder is open',
      };
    }

    const isGitRepo = await this.isGitRepository();
    if (!isGitRepo) {
      return {
        isGitRepository: false,
        rootPath: this.rootPath,
        currentBranch: null,
        modifiedFileCount: 0,
        stagedFileCount: 0,
        modifiedFiles: [],
        stagedFiles: [],
        repositoryStatus: 'clean',
      };
    }

    const currentBranch = await this.getCurrentBranch();
    const { modifiedFileCount, stagedFileCount, modifiedFiles, stagedFiles, repositoryStatus } = await this.getGitStatus();
    return {
      isGitRepository: true,
      rootPath: this.rootPath,
      currentBranch,
      modifiedFileCount,
      stagedFileCount,
      modifiedFiles,
      stagedFiles,
      repositoryStatus,
    };
  }
}
