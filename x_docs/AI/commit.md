# Git Commit Guide

## Branching Rules

* **Never work directly on `main`.**
* **Every new feature must have its own branch.**
* Branch names should clearly describe the work being done.

### Examples

```bash
feature/user-authentication
feature/payment-api
feature/dashboard-ui
fix/login-validation
fix/mobile-navbar
hotfix/security-patch
refactor/database-service
docs/api-documentation
```

---

## Commit Message Rules

Every commit **must contain at least one descriptive line** explaining what was changed.

### Format

```text
<type>(<scope>): <short summary>

<description of the changes made>
```

---

## Common Commit Types

### New Feature

```text
feat(backend): implement user authentication

Added JWT authentication middleware and login endpoint.
```

```text
feat(ui): create dashboard analytics page

Implemented the dashboard layout and connected API endpoints.
```

---

### Bug Fix

```text
fix(ui): resolve navbar overflow issue

Fixed responsive navigation on small screen devices.
```

```text
fix(backend): prevent duplicate email registration

Added email uniqueness validation before user creation.
```

---

### Refactoring

```text
refactor(api): simplify authentication service

Reduced duplicate logic and improved code readability.
```

---

### Documentation

```text
docs(api): update authentication guide

Added examples for login and token refresh endpoints.
```

---

### Performance

```text
perf(database): optimize campaign queries

Added indexes and reduced unnecessary database lookups.
```

---

### Testing

```text
test(auth): add login integration tests

Added tests for successful and failed authentication scenarios.
```

---

### Styling

```text
style(ui): improve dashboard spacing

Updated component spacing and typography without changing functionality.
```

---

### Chore

```text
chore(project): update project dependencies

Updated npm packages and removed unused libraries.
```

---

## Recommended Workflow

```bash
# Update local repository
git checkout main
git pull origin main

# Create a new branch
git checkout -b feature/new-feature

# Work on the feature
git add .
git commit

# Push branch
git push origin feature/new-feature

# Open a Pull Request (PR)
# Review
# Merge into main
```

---

## Good Commit Examples

```text
feat(backend): add campaign approval endpoint

Implemented the API endpoint for approving campaigns and added validation.
```

```text
fix(ui): correct campaign statistics display

Fixed incorrect percentage calculations in dashboard charts.
```

```text
feat(api): implement referral service

Created referral endpoints, service layer, and database migration.
```

```text
refactor(auth): separate JWT utilities

Moved token generation into reusable helper functions.
```

---

## Avoid These Commit Messages

❌

```text
update
```

```text
fixed
```

```text
changes
```

```text
work
```

```text
done
```

```text
final
```

These messages do not explain what changed.

---

## Team Standards

* One feature per branch.
* One logical change per commit.
* Use meaningful branch names.
* Write clear commit messages following the Conventional Commits format.
* Every commit must include a descriptive summary and at least one explanatory line.
* Pull the latest changes before creating a new branch.
* Submit work through a Pull Request before merging into `main`.
