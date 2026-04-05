# AGENTS.md

## Refactor Preferences

- Prefer arrow functions for new or touched code unless a `function` declaration is materially clearer.
- Prefer modern JavaScript and React patterns that reduce ceremony and keep the happy path obvious.
- Keep methods small and isolated. If a component grows multiple responsibilities, split page-local or component-local helpers into adjacent files.
- Move reused or duplicated logic into helper utilities instead of re-implementing it inline.
- Optimize for understandability before cleverness. Fewer branches, fewer nested conditionals, and better names beat abstraction for its own sake.

## Structure

- Keep feature-specific helpers close to the feature. Page-only helpers belong near that page, not in broad shared utility files.
- Shared helpers should only be introduced when at least two call sites benefit or when a component becomes materially easier to read.
- Prefer removing thin wrapper modules that hide intent without adding behavior.

## Verification

- After refactors, run the most relevant tests and type checks for the changed area.
- Avoid behavior changes unless they are intentional, easy to explain, and verified.
