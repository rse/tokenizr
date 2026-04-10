
CHANGES
=======

2.2.0 (2026-04-10)
------------------

- IMPROVEMENT: make alternatives() more robust by using an explicit flag internally
- BUGFIX: ensure that "type" parameter exists when checking in consume()
- BUGFIX: when all alternatives fail, throw the exception of the alternative which went furthest (deepest)
- BUGFIX: be more robust and check alsofor end-of-file situation in peek()
- CLEANUP: remove RegExp "y" flag runtime-check as it exists since 2015
- CLEANUP: simplify strip() method

2.1.2 (2026-04-10)
------------------

- UPGRADE: upgrade NPM dependencies
- CLEANUP: cleanup source code

2.1.1 (2025-11-20)
------------------

- UPGRADE: upgrade NPM dependencies
- CLEANUP: cleanup source code

2.1.0 (2025-10-20)
------------------

- IMPROVEMENT: export more types (#22)
- CLEANUP: make linting more happy by sorting in-place
- UPGRADE: upgrade NPM dependencies

2.0.3 (2025-09-17)
------------------

- UPGRADE: upgrade NPM dependencies
- CLEANUP: switch from any to unknown for the unknown values
- CLEANUP: remove duplicate entries from OxLint config

2.0.2 (2025-09-10)
------------------

- UPGRADE: upgrade NPM dependencies

2.0.1 (2025-08-25)
------------------

- CLEANUP: make OxLint more happy by additional code cleanups

2.0.0 (2025-08-24)
------------------

- IMPROVEMENT: new build infrastructure based on STX, TypeScript, OXLint, Biome, ESLint and Vite
- IMPROVEMENT: converted Tokenizr library source code from JavaScript to TypeScript

1.x.x (2015-XX-XX)
------------------

(see Git history)

