# Git Quest — Product Requirements Document (PRD)

**Version:** 1.0  
**Type:** VS Code Extension  
**Target:** Complete beginners learning Git in team environments  
**Build Style:** 2D, playful, HTML/CSS characters, no 3D

---

## 1. Product Overview

### 1.1 What It Is
Git Quest is a VS Code extension that transforms every Git operation into a guided, visual, gamified experience. Beginners see their repository as a living world — branches are lanes, commits are footsteps, teammates are characters. No Git knowledge required to start.

### 1.2 Problem It Solves
- GitLens and similar tools are built for experts — overwhelming for beginners
- Beginners don't know what to do next after making changes
- Team collaboration (who edited what, when, why) is invisible and scary
- Git concepts (rebase, stash, cherry-pick) are abstract with no visual mental model

### 1.3 Core Promise
> "Every Git action is visible, guided, and rewarded. You always know what to do next."

---

## 2. Target Users

**Primary:** Computer science students, bootcamp graduates, junior developers (0–1 year experience)  
**Secondary:** Self-taught developers joining their first team  
**Not for:** Senior developers (they have GitLens)

---

## 3. UI Architecture

### 3.1 Extension Layout
```
VS Code Window
├── Activity Bar Icon          ← Git Quest sword/shield icon
├── Primary Sidebar
│   ├── CHANGES panel          ← staged / unstaged files
│   ├── BRANCHES panel         ← local + remote branches
│   ├── STASHES panel          ← stash list
│   ├── TAGS panel             ← tags list
│   └── REMOTES panel          ← remote origins
├── Main Webview Panel         ← full game HUD (opens as tab)
│   ├── Repo Map               ← commit graph / branch lanes
│   ├── Staging Arena          ← drag-drop file staging
│   ├── Team Wall              ← team activity feed
│   └── Quest Log              ← guided next steps
└── Status Bar (bottom)
    ├── Left: branch name + sync arrows
    └── Right: XP counter + level badge + streak flame
```

### 3.2 Webview Panel Tabs
```
[ Repo Map ] [ Staging Arena ] [ Team Wall ] [ Quest Log ]
```

---

## 4. Feature Specifications

---

### Feature 1: REPO MAP (Visual Commit Graph)

**Purpose:** Show branch history as a clean horizontal lane system. Character walks the timeline.

**Visual Design:**
- Horizontal timeline, left = oldest, right = newest
- Each branch = horizontal lane (colored lane line)
- Each commit = circle node on lane
- Merge = lane connects with curve
- HEAD = character sprite standing on latest commit
- Remote tracking = dotted lane running parallel
- Tags = flag icons on commit nodes

**Interactions:**
- Click commit node → shows commit detail card (hash, message, author, date, files changed)
- Click branch lane → highlights all commits on that branch
- Hover commit → tooltip with short info
- Right-click commit → context menu (checkout, cherry-pick, rebase onto, create branch here, revert)
- Right-click branch lane → context menu (merge into current, rebase onto, delete, rename)

**Git commands powering it:**
```bash
git log --oneline --graph --all --decorate --format="%H|%an|%ae|%ar|%s|%D"
git branch -a -vv
git tag -l --sort=-version:refname
git rev-parse HEAD
git remote -v
```

**States to handle:**
- Empty repo (no commits yet) → show "Make your first commit!" prompt
- Detached HEAD → show warning card with explanation
- Merge conflict state → highlight conflicted commits in red

---

### Feature 2: STAGING ARENA

**Purpose:** Visual drag-and-drop interface for staging files. Makes `git add` tangible.

**Visual Design:**
- Left zone: "UNSTAGED" — files scattered like items on ground (file icons with names)
- Right zone: "STAGED" — files neatly stacked in a "backpack" / chest
- Bottom bar: commit message input + commit button
- Character stands in middle, reacts to actions

**Interactions:**
- Drag file from unstaged → staged zone = `git add <file>`
- Drag file from staged → unstaged = `git restore --staged <file>`
- Click file → shows diff preview inline (colored +/- lines)
- "Stage All" button = `git add .`
- "Unstage All" button = `git restore --staged .`
- "Discard Changes" button on file = `git restore <file>` (with confirmation warning)
- Commit button = `git commit -m "<message>"`
- Amend toggle = `git commit --amend --no-edit`

**Hunk Staging:**
- Click file → expand diff view
- Each hunk has "Stage this chunk" button = `git add -p` equivalent
- Visual: green = added lines, red = removed lines, grey = context

**Git commands powering it:**
```bash
git status --porcelain=v1
git diff <file>
git diff --staged <file>
git add <file>
git add .
git restore --staged <file>
git restore <file>
git commit -m ""
git commit --amend --no-edit
git commit --amend -m ""
```

**States to handle:**
- Nothing to stage → "Working tree clean" with resting character animation
- Merge conflict files → show in red with "CONFLICT" badge, separate resolution UI
- New untracked files → show with "NEW" badge

---

### Feature 3: QUEST LOG (Core Differentiator)

**Purpose:** State machine that always tells beginner exactly what to do next. Never leave them lost.

**Visual Design:**
- Scrollable quest card list, RPG quest log style
- Active quest = highlighted card with arrow
- Completed quest = greyed out with checkmark
- Each quest has: title, description in plain English, exact button/action to take

**Quest State Machine:**

```
STATE: clean working tree
  → Quest: "Push your work" (if commits ahead of remote)
  → Quest: "Pull latest" (if remote has new commits)
  → Quest: "Start new work" (create branch prompt)

STATE: unstaged changes exist
  → Quest: "Stage your changes" → points to Staging Arena

STATE: staged changes, no commit message
  → Quest: "Commit your work" → points to commit input

STATE: committed, not pushed
  → Quest: "Push to remote" → shows push button

STATE: merge conflict
  → Quest: "Resolve conflicts" → step-by-step conflict resolution guide

STATE: mid-rebase
  → Quest: "Continue rebase" → shows rebase controls (continue / abort / skip)

STATE: detached HEAD
  → Quest: "You're in detached HEAD!" → explain + guide to create branch or checkout

STATE: behind remote
  → Quest: "Pull latest changes" → shows pull options (merge vs rebase)
```

**Plain English explanations:**
Every quest card has a "What does this mean?" expandable section — no jargon, just analogy.  
Example: "Staging is like putting items in a box before shipping. Only staged files go into your commit."

**Git commands powering state detection:**
```bash
git status --porcelain=v1
git status -b --porcelain=v2
git rev-list HEAD..@{u} --count    # commits behind remote
git rev-list @{u}..HEAD --count    # commits ahead of remote
git rebase --show-current-patch    # detect mid-rebase
git merge HEAD                     # detect mid-merge
```

---

### Feature 4: TEAM WALL

**Purpose:** Show what teammates are doing — make collaboration visible and friendly, not intimidating.

**Visual Design:**
- Activity feed cards, newest on top
- Each card: avatar (generated from name initials, colored), name, action, time ago
- "WHO TOUCHED THIS?" inline blame on hover in editor

**Sub-features:**

**4a. Activity Feed**
- Shows all commits across all branches from all authors
- Filter by: author, branch, time range
- Each entry: avatar + name + "committed" + message + time ago + branch badge

**4b. Contributor Leaderboard**
- Shows all contributors ranked by commit count
- Current user highlighted
- Resets weekly option

**4c. Inline Blame (hover)**
- Hover any line in editor → small card appears
- Shows: author name, date, commit message, commit hash
- "See full commit" button → opens commit detail in Repo Map
- Friendly tone: "Priya wrote this 3 days ago"

**4d. File History**
- Right-click file → "Git Quest: Show File History"
- Timeline of all commits that touched this file
- Click commit → show full diff of that file at that commit

**Git commands powering it:**
```bash
git log --all --format="%H|%an|%ae|%ar|%s|%D" -n 50
git shortlog -sn --all
git blame -l -t -e <file>
git log --follow --oneline <file>
git show <hash>:<file>
git log -p <file>
```

---

### Feature 5: BRANCH MANAGER

**Purpose:** Visual branch operations — create, switch, merge, rebase, delete — all with guidance.

**Visual Design:**
- List of all branches (local + remote) in sidebar
- Current branch = highlighted with character icon
- Each branch shows: last commit message, author, time ago, ahead/behind remote
- Remote branches shown under collapsible "REMOTE" section

**Interactions:**
- Click branch → checkout (with unsaved changes warning)
- "+ New Branch" button → input name, creates + switches
- Right-click branch → context menu:
  - Merge into current
  - Rebase onto current
  - Cherry-pick latest commit
  - Delete branch
  - Rename branch
  - Push to remote
  - Set upstream

**Merge Flow (guided):**
1. User clicks "Merge into current"
2. Quest Log activates: "Merging feature/login into main"
3. Git runs merge
4. If clean: success animation + XP reward
5. If conflict: conflict resolution UI activates (Feature 6)

**Rebase Flow (guided):**
1. User clicks "Rebase onto"
2. Quest Log explains: "Rebase moves your commits on top of the latest main. Like replanting a tree."
3. Confirmation shown with visual diagram of before/after
4. Rebase runs
5. Each conflict = guided resolution step

**Interactive Rebase:**
- "Squash commits" wizard — shows last N commits, drag to reorder, click to squash/edit/drop
- Visual: commits as movable cards

**Git commands:**
```bash
git checkout -b <branch>
git checkout <branch>
git branch -d <branch>
git branch -D <branch>
git branch -m <old> <new>
git merge <branch>
git merge --abort
git rebase <branch>
git rebase -i HEAD~<n>
git rebase --continue
git rebase --abort
git rebase --skip
git cherry-pick <hash>
git push origin <branch>
git push --force-with-lease
git push --set-upstream origin <branch>
```

---

### Feature 6: CONFLICT RESOLVER

**Purpose:** Walk beginner through merge/rebase conflicts step by step. Never show raw conflict markers alone.

**Visual Design:**
- Dedicated conflict resolution panel
- Shows list of conflicted files with count of conflicts each
- Progress bar: "2 of 5 conflicts resolved"

**Per-conflict UI:**
- Split view: YOURS (left) vs THEIRS (right) vs RESULT (bottom)
- Each conflict highlighted clearly
- Three buttons per conflict:
  - "Keep Mine" = accept current
  - "Keep Theirs" = accept incoming  
  - "Keep Both" = accept both
  - "Edit Manually" = open in editor with markers

**After all conflicts resolved:**
- "Mark as resolved" button = `git add <file>`
- When all files resolved → "Complete merge/rebase" button

**Plain English guidance:**
- "YOURS = what you wrote. THEIRS = what your teammate wrote. Pick one, or combine them."

**Git commands:**
```bash
git diff --name-only --diff-filter=U    # list conflicted files
git checkout --ours <file>
git checkout --theirs <file>
git add <file>
git merge --continue
git rebase --continue
git merge --abort
git rebase --abort
```

---

### Feature 7: STASH MANAGER

**Purpose:** Visual stash operations — save, view, restore, delete.

**Visual Design:**
- Stash list in sidebar under STASHES section
- Each stash: label, branch it was stashed on, time ago, file count
- Character animation: packs items into bag (stash) or unpacks (pop)

**Interactions:**
- "Stash Changes" button (when unstaged/staged changes exist)
- Input: stash label (optional)
- Click stash → preview stash diff
- "Pop" button → restore and delete stash
- "Apply" button → restore but keep stash
- "Drop" button → delete stash (with confirmation)
- Drag stash onto branch → apply stash on that branch

**Git commands:**
```bash
git stash push -m "<label>"
git stash list
git stash show -p stash@{n}
git stash pop stash@{n}
git stash apply stash@{n}
git stash drop stash@{n}
git stash branch <branchname> stash@{n}
```

---

### Feature 8: DIFF VIEWER

**Purpose:** Show changes clearly — unstaged, staged, commit-to-commit, file history diffs.

**Visual Design:**
- Side-by-side or unified view toggle
- Green lines = added, red = removed, grey = context
- Line numbers shown
- "Stage this hunk" buttons inline

**Entry points:**
- Click file in Staging Arena → diff of that file
- Click commit in Repo Map → diff of that commit
- Right-click file in explorer → "Git Quest: Show Diff"
- Blame card "See full commit" → diff of that commit

**Git commands:**
```bash
git diff <file>
git diff --staged <file>
git diff <hash1> <hash2>
git diff <hash1> <hash2> -- <file>
git show <hash>
```

---

### Feature 9: REMOTE MANAGER

**Purpose:** Push, pull, fetch — visible and guided.

**Visual Design:**
- Remote status bar shows: "↑3 ↓2" (ahead/behind remote)
- Click status bar → opens remote panel
- Shows all remotes, their URLs, fetch/push status

**Operations:**
- Fetch All button = `git fetch --all --prune`
- Pull button with options: merge vs rebase
- Push button with conflict detection
- "Force Push" button → shows warning, requires confirmation, uses `--force-with-lease`
- Add Remote form
- Remove Remote button

**Pull Request awareness:**
- If GitHub remote detected → show "Open Pull Request" button
- Opens GitHub PR creation page in browser with correct branch pre-selected
- Uses `git remote get-url origin` to build URL

**Git commands:**
```bash
git fetch --all --prune
git pull
git pull --rebase
git push
git push --force-with-lease
git push --set-upstream origin <branch>
git remote -v
git remote add <name> <url>
git remote remove <name>
git rev-list HEAD..@{u} --count
git rev-list @{u}..HEAD --count
```

---

### Feature 10: REFLOG VIEWER

**Purpose:** Show beginners they can always undo — reflog as a safety net, not a scary tool.

**Visual Design:**
- Timeline of all HEAD movements
- Each entry: action, branch, commit message, time ago
- "Undo" button on each entry (with confirmation + explanation)

**Framing:** "Git never loses your work. This is your full history — you can always go back."

**Git commands:**
```bash
git reflog --format="%H|%gd|%gs|%ar"
git checkout <hash>
git reset --hard <hash>    # with confirmation warning
```

---

### Feature 11: TAG MANAGER

**Purpose:** Create and manage version tags visually.

**Visual Design:**
- Tags shown as flag icons on Repo Map
- TAGS panel in sidebar shows all tags with commit and date

**Interactions:**
- "New Tag" button → input name + message, creates annotated tag
- Click tag → shows tagged commit in Repo Map
- Delete tag button
- Push tags to remote button

**Git commands:**
```bash
git tag -a <name> -m "<message>"
git tag -l --sort=-version:refname
git push origin <tagname>
git push origin --tags
git tag -d <tagname>
git push origin --delete <tagname>
```

---

### Feature 12: GAME LAYER

**Purpose:** XP, levels, streaks, badges — make learning Git feel like progress.

**XP System:**
```
Action                  XP Earned
─────────────────────────────────
First commit            +50 XP
Each commit             +10 XP
Push to remote          +15 XP
Create branch           +10 XP
Merge branch            +25 XP
Rebase                  +30 XP
Resolve conflict        +40 XP
Cherry-pick             +20 XP
First stash             +15 XP
Tag a release           +20 XP
Daily streak (commit)   +25 XP bonus
```

**Level System:**
```
Level   XP Required   Title
──────────────────────────────
1       0             Cave Coder
2       100           Git Newbie
3       300           Branch Walker
4       600           Merge Master
5       1000          Rebase Wizard
6       1500          Cherry Picker
7       2100          Reflog Ranger
8       3000          Git Sensei
9       4000          Open Source Hero
10      6000          Git Legend
```

**Badges:**
```
Badge               Trigger
──────────────────────────────────────────
First Blood         First ever commit
Branching Out       Create first branch
Team Player         First commit to shared branch
Conflict Survivor   Resolve first merge conflict
Time Traveler       First use of reflog
Tagger              Create first tag
Stasher             First stash
Rebaser             First successful rebase
Streak x7           7-day commit streak
Streak x30          30-day commit streak
100 Commits         100th commit
```

**Character:**
- Simple HTML/CSS pixel-style character in game panels
- Idles when nothing happening
- Jumps + sparkle on commit/XP
- Runs when push/pull happening
- Shakes head on error
- Waves when teammate commits (Team Wall update)

**Storage:** VS Code `globalState` (Memento API) — XP and badges persist across workspaces

---

## 5. Technical Specification

### 5.1 Extension Entry Point
```
src/extension.ts
  activate(context: vscode.ExtensionContext)
    → register all commands
    → register all providers
    → register status bar
    → initialize GitEngine
    → initialize GameEngine
    → watch .git folder for changes
```

### 5.2 Full Folder Structure
```
git-quest/
├── src/
│   ├── extension.ts                    ← activate / deactivate
│   │
│   ├── gitEngine/
│   │   ├── index.ts                    ← GitEngine class
│   │   ├── status.ts                   ← git status parsing
│   │   ├── log.ts                      ← git log / graph parsing
│   │   ├── branch.ts                   ← branch operations
│   │   ├── staging.ts                  ← add / restore / diff
│   │   ├── commit.ts                   ← commit / amend
│   │   ├── remote.ts                   ← fetch / push / pull
│   │   ├── stash.ts                    ← stash operations
│   │   ├── rebase.ts                   ← rebase / interactive
│   │   ├── merge.ts                    ← merge / conflict detect
│   │   ├── blame.ts                    ← blame parsing
│   │   ├── diff.ts                     ← diff parsing
│   │   ├── tag.ts                      ← tag operations
│   │   ├── reflog.ts                   ← reflog parsing
│   │   └── types.ts                    ← all Git TypeScript types
│   │
│   ├── panels/
│   │   ├── MainPanel.ts                ← WebviewPanel host
│   │   ├── RepoMapPanel.ts             ← commit graph webview
│   │   ├── StagingArenaPanel.ts        ← staging drag-drop webview
│   │   ├── TeamWallPanel.ts            ← team activity webview
│   │   └── QuestLogPanel.ts            ← quest guidance webview
│   │
│   ├── providers/
│   │   ├── ChangesProvider.ts          ← TreeDataProvider: staged/unstaged
│   │   ├── BranchesProvider.ts         ← TreeDataProvider: branches
│   │   ├── StashesProvider.ts          ← TreeDataProvider: stashes
│   │   ├── TagsProvider.ts             ← TreeDataProvider: tags
│   │   ├── RemotesProvider.ts          ← TreeDataProvider: remotes
│   │   └── BlameHoverProvider.ts       ← HoverProvider: inline blame
│   │
│   ├── gameEngine/
│   │   ├── index.ts                    ← GameEngine class
│   │   ├── xp.ts                       ← XP calculation + storage
│   │   ├── levels.ts                   ← level definitions
│   │   ├── badges.ts                   ← badge definitions + triggers
│   │   ├── streak.ts                   ← daily streak tracking
│   │   └── types.ts                    ← game TypeScript types
│   │
│   ├── questLog/
│   │   ├── index.ts                    ← QuestEngine class
│   │   ├── stateMachine.ts             ← repo state detection
│   │   ├── quests.ts                   ← all quest definitions
│   │   └── types.ts                    ← quest TypeScript types
│   │
│   ├── statusBar/
│   │   └── StatusBarManager.ts         ← XP + branch + sync status bar
│   │
│   └── utils/
│       ├── exec.ts                     ← child_process wrapper
│       ├── parse.ts                    ← shared git output parsers
│       └── constants.ts                ← extension constants
│
├── webview-ui/
│   ├── repoMap/
│   │   ├── index.html
│   │   ├── repoMap.js                  ← Canvas-based graph renderer
│   │   └── repoMap.css
│   │
│   ├── stagingArena/
│   │   ├── index.html
│   │   ├── stagingArena.js             ← drag-drop logic
│   │   └── stagingArena.css
│   │
│   ├── teamWall/
│   │   ├── index.html
│   │   ├── teamWall.js
│   │   └── teamWall.css
│   │
│   ├── questLog/
│   │   ├── index.html
│   │   ├── questLog.js
│   │   └── questLog.css
│   │
│   └── shared/
│       ├── character.css               ← CSS character animations
│       ├── character.js                ← character state controller
│       ├── xpPopup.js                  ← XP burst animation
│       ├── theme.css                   ← VS Code CSS variables
│       └── vscode.js                   ← acquireVsCodeApi wrapper
│
├── assets/
│   ├── icon.png                        ← extension marketplace icon
│   ├── sprites/                        ← pixel art sprites (kenney.nl)
│   └── sounds/                         ← optional commit sounds (off by default)
│
├── package.json                        ← extension manifest + commands
├── tsconfig.json
├── .vscodeignore
├── .eslintrc.json
└── README.md
```

### 5.3 package.json — Commands to Register
```json
"commands": [
  "gitQuest.openPanel",
  "gitQuest.stageFile",
  "gitQuest.unstageFile",
  "gitQuest.stageAll",
  "gitQuest.unstageAll",
  "gitQuest.commit",
  "gitQuest.amendCommit",
  "gitQuest.push",
  "gitQuest.pull",
  "gitQuest.fetch",
  "gitQuest.createBranch",
  "gitQuest.switchBranch",
  "gitQuest.deleteBranch",
  "gitQuest.mergeBranch",
  "gitQuest.rebaseBranch",
  "gitQuest.stashPush",
  "gitQuest.stashPop",
  "gitQuest.stashDrop",
  "gitQuest.cherryPick",
  "gitQuest.openReflog",
  "gitQuest.createTag",
  "gitQuest.showFileHistory",
  "gitQuest.showBlame",
  "gitQuest.openQuestLog",
  "gitQuest.openTeamWall",
  "gitQuest.openRepoMap",
  "gitQuest.openStagingArena"
]
```

### 5.4 package.json — Views to Register
```json
"views": {
  "gitQuest": [
    { "id": "gitQuest.changes",  "name": "Changes" },
    { "id": "gitQuest.branches", "name": "Branches" },
    { "id": "gitQuest.stashes",  "name": "Stashes" },
    { "id": "gitQuest.tags",     "name": "Tags" },
    { "id": "gitQuest.remotes",  "name": "Remotes" }
  ]
}
```

### 5.5 Key Dependencies
```json
"dependencies": {
  "simple-git": "^3.x"
},
"devDependencies": {
  "@types/vscode": "^1.85.0",
  "typescript": "^5.x",
  "@vscode/vsce": "^2.x",
  "esbuild": "^0.x"
}
```

### 5.6 Extension Activation Events
```json
"activationEvents": [
  "workspaceContains:.git"
]
```
Extension only activates when a `.git` folder is present in workspace.

### 5.7 Webview ↔ Extension Messaging Protocol
```typescript
// Extension → Webview
{ type: "updateRepoMap",     data: RepoMapData     }
{ type: "updateStaging",     data: StagingData     }
{ type: "updateTeamWall",    data: TeamWallData    }
{ type: "updateQuestLog",    data: QuestData       }
{ type: "xpGained",          data: { amount, reason, total } }
{ type: "badgeUnlocked",     data: Badge           }

// Webview → Extension
{ type: "stageFile",         file: string          }
{ type: "unstageFile",       file: string          }
{ type: "commit",            message: string       }
{ type: "checkoutBranch",    branch: string        }
{ type: "cherryPick",        hash: string          }
{ type: "requestDiff",       file: string          }
```

---

## 6. Git State Machine (Quest Log Core)

```typescript
enum RepoState {
  NO_REPO,
  EMPTY_REPO,              // no commits yet
  CLEAN,                   // nothing to do
  HAS_UNSTAGED,            // unstaged changes exist
  HAS_STAGED,              // staged, no commit
  AHEAD_OF_REMOTE,         // committed, not pushed
  BEHIND_REMOTE,           // remote has new commits
  DIVERGED,                // both ahead and behind
  MID_MERGE,               // merge in progress
  MID_REBASE,              // rebase in progress
  MERGE_CONFLICT,          // conflict markers present
  DETACHED_HEAD,           // not on a branch
  BISECTING,               // git bisect in progress
}
```

---

## 7. Character Design

**Style:** Simple CSS/HTML. No external image dependency needed for base character.

```
Idle:     (^_^)  standing still, slight bob animation
Working:  (>_<)  arms up, running animation  
Happy:    (★_★)  star eyes, jump animation on XP gain
Error:    (x_x)  X eyes, shake animation
Sleeping: (-_-)  zz bubble, when no git repo found
```

CSS animations handle all transitions. Optional: replace with pixel sprite from kenney.nl later.

---

## 8. Error Handling

Every Git error must:
1. Show plain English explanation (not raw Git error)
2. Show what went wrong
3. Show how to fix it
4. Never show scary terminal output directly

```typescript
// Example error card
{
  title: "Push was rejected",
  plain: "Your teammate pushed changes before you. Pull their changes first, then push again.",
  action: "Pull and merge",
  command: "git pull --rebase"
}
```

---

## 9. Build Phases

### Phase 1 — MVP (Working Git Core)
- Extension scaffolding (TypeScript, package.json, tsconfig)
- GitEngine: status, add, commit, push, pull, branch list
- Sidebar: Changes panel, Branches panel
- Status bar: branch name + sync indicator
- Basic Quest Log: 5 core states (clean, unstaged, staged, ahead, behind)
- No game layer yet

### Phase 2 — Visual Panels
- Repo Map webview (commit graph, branch lanes)
- Staging Arena webview (drag-drop files)
- CSS character (idle + jump + run)
- Team Wall (activity feed)

### Phase 3 — Quest Log Full
- All 10 repo states
- Plain English cards
- "What does this mean?" expandable explanations
- Conflict resolver UI

### Phase 4 — Game Layer
- XP system + storage
- Level system
- Streak tracker
- Badges
- XP popup animation
- Status bar XP counter

### Phase 5 — Power Features
- Interactive rebase wizard
- Stash manager
- Inline blame hover
- Diff viewer
- File history
- Reflog viewer
- Tag manager

---

## 10. Out of Scope (v1)

- Git submodules
- Git LFS
- GitHub/GitLab API integration (PR creation is link-only)
- Multi-root workspaces
- Windows Subsystem for Linux (WSL) git path resolution (v2)
- SSH key management

---

## 11. Success Metrics

- Beginner can stage + commit + push without opening terminal
- Beginner understands what to do next at every step (Quest Log coverage = 100% of common states)
- Extension installs on VS Code Marketplace
- README has GIF demo of full flow

---

*PRD Version 1.0 — Git Quest VS Code Extension*
