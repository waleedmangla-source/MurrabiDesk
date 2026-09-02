# Auto Git Push Policy

After completing any code edit or file change that satisfies the user's request:
1. Always stage all changed files (`git add -A`).
2. Always commit with a clear, standard commit message (`git commit -m "..."`).
3. Always push directly to remote (`git push origin main` using `BypassSandbox: true` so network access succeeds) without waiting for or asking the user to ask for `git push`.
