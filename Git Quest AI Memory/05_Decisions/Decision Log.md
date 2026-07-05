## Day 1

### Decision
Use the official VS Code Extension Generator.

### Reason
Provides the standard structure used by most VS Code extensions.

### Impact
Reduces setup time and follows Microsoft's recommended project structure.

## Day 2

### Decision

Separate UI and Git logic.

### Reason

Keeps the extension maintainable and easier to test.

### Impact

Future Git features can be added without changing the UI layer.

## Day 3

### Decision

Introduce a dedicated GitService.

### Reason

Separate Git operations from UI logic.

### Impact

Future Git features can be added without modifying the Tree View.

## Day 4

### Decision

Parse repository information inside GitService.

### Reason

Keeps parsing logic out of the UI.

### Impact

Future Git features can reuse the same service.


## Day 4

### Decision

Use GitService as the single source of repository information.

### Reason

Prevents the UI from needing to know Git commands.

### Impact

Future Git features can reuse the same service and keep the UI simple.

## Day 5

### Decision

Represent repository data as a hierarchical tree.

### Reason

Improves readability and allows future actions on individual files.

### Impact

Each file node can later expose Git actions such as Stage, Unstage and Discard.

## Day 6

### Decision

Implement staging through GitService instead of directly in the Tree View.

### Reason

Keeps business logic separate from UI.

### Impact

Future Git operations (Unstage, Commit, Discard) can reuse the same service pattern.

## Day 7

### Decision

Reuse the existing GitService pattern for unstaging.

### Reason

Keeps all Git write operations in one service.

### Impact

Future operations like Stage All and Discard Changes will follow the same architecture.
## Day 8

### Decision

Use VS Code InputBox for commit messages.

### Reason

Provides a native user experience and avoids building a custom UI.

### Impact

Future Git commands can reuse the same interaction pattern.