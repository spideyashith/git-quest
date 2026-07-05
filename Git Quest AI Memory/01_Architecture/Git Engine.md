# Git Engine

## Purpose

Provide all Git-related functionality for Git Quest.

## Responsibilities

- Detect whether the current workspace is a Git repository.
- Read the current branch.
- Return repository information to the UI.

## Current Features

- Repository detection
- Current branch detection

## Future Features

- Modified files
- Staged files
- Commit history
- Branch switching
- Merge status


## Current Implementation

The Git Engine currently:

- Detects whether the opened workspace is a Git repository.
- Reads the current branch.
- Returns repository information through a single interface.

## Known Limitations

- Detects only the current workspace folder.
- Does not yet support nested repositories.
- Does not refresh automatically after Git changes.

## New Features

The Git Engine now provides:

- Current Branch
- Modified File Count
- Staged File Count
- Repository Status

The UI receives all repository information through GitRepositoryInfo.


## New Features

The Git Engine now returns:

- Modified file list
- Staged file list

The Repository tree can display and open changed files directly from the sidebar.


## New Feature

GitService now supports staging individual files.

Current Git operations:

- Detect repository
- Read branch
- Read status
- Read modified files
- Read staged files
- Stage a selected file

## New Feature

GitService now supports:

- Stage File
- Unstage File

Git Quest now supports both directions of the staging workflow.

## New Feature

GitService now supports:

- Stage File
- Unstage File
- Commit Changes

Git Quest now supports a complete local Git workflow.

## New Feature

GitService now supports Git commits.

Workflow supported:

- Stage File
- Unstage File
- Commit