# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

UXUI Guide Page for Alpha/Abbg — a design system specification project using the `@google/design.md` format. The primary artifact to create/maintain is a `DESIGN.md` file that describes the visual identity for AI coding agents.

## Key Commands

```bash
# Validate DESIGN.md for structural correctness and WCAG contrast ratios
npx @google/design.md lint DESIGN.md

# Compare two versions of DESIGN.md for token-level regressions
npx @google/design.md diff DESIGN.md DESIGN-v2.md

# Export tokens to Tailwind theme config
npx @google/design.md export --format tailwind DESIGN.md > tailwind.theme.json

# Export tokens to W3C DTCG format
npx @google/design.md export --format dtcg DESIGN.md > tokens.json

# View the full DESIGN.md format specification
npx @google/design.md spec
```

## DESIGN.md Format

Files follow this structure:

```md
---
name: <design system name>
colors:
  primary: "#hex"
  secondary: "#hex"
typography:
  h1:
    fontFamily: <name>
    fontSize: <value>
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#fff"
    rounded: "{rounded.sm}"
---

## Overview
## Colors
## Typography
## Layout
## Components
```

Token references use `{path.to.token}` syntax (e.g. `{colors.primary}`). Sections must appear in canonical order: Overview → Colors → Typography → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts.

## Linting Rules

The linter enforces: no broken token refs (`broken-ref`, error), WCAG AA contrast ≥ 4.5:1 (`contrast-ratio`, warning), a `primary` color must exist (`missing-primary`, warning), and sections must be in canonical order (`section-order`, warning). Exit code `1` means errors found.
