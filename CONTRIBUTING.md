# Contributing to Inkify

Thank you for your interest! This document will be expanded as the project matures. For now:

## Quick start

1. Fork the repo, branch from `develop` (not `main`).
2. Use `feature/`, `fix/`, `docs/`, `chore/`, `refactor/` prefixes.
3. Follow [Conventional Commits](https://www.conventionalcommits.org/).
4. Ensure `npm run lint`, `npm run typecheck`, and `npm run build` pass.
5. Run `npm run test` and `npm run test:e2e` for full coverage.

## Code style

- TypeScript strict mode, no `any` without justification.
- ESLint + Prettier enforced — run `npm run lint:fix`.
- Path aliases: `@/...` maps to `src/...`.
- Feature-first folder structure. No circular dependencies (`import/no-cycle` rule).

## Target hardware gate

Every change is validated against the HP 15s-fm0058TU performance budgets in `docs/BUDGETS.md`. If a PR regresses typing latency >100ms or sketch framerate below 60fps on the target device, it will be flagged.

## Questions?

Open a [Discussion](https://github.com/jaiswalkanishk07/inkified/discussions) or [Issue](https://github.com/jaiswalkanishk07/inkified/issues).
