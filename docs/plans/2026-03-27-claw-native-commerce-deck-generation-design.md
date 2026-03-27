# Claw Native Fundraising Deck Generation Design

**Date:** 2026-03-27  
**Goal:** Generate a polished `.pptx` fundraising deck directly from the approved fundraising narrative materials in this repository.

## Scope

Produce three artifacts:

1. a reusable deck generation script
2. a generated `.pptx` file under `docs/presentations/`
3. lightweight verification that the output exists and contains the expected slide structure

## Chosen Approach

Use `PptxGenJS` to generate the deck from scratch.

### Why this approach

- the repo already contains approved content in markdown
- the output should stay editable in PowerPoint / Keynote
- a code-generated deck is reproducible and easier to refine than manual slide editing

## Visual Direction

Use a warm executive palette rather than generic AI blue or purple:

- dark navy for title / closing slides
- sand / cream for content slides
- terracotta as the main accent
- muted sage for secondary shapes

The deck should follow a dark-light-dark rhythm:

- Slide 1 and Slide 10 dark
- Core content slides mostly light
- High-signal process slides can switch to dark for contrast

## Layout Principles

- 16:9 widescreen deck
- every slide gets at least one visual structure element beyond text
- no text-only slides
- no decorative underline under titles
- one dominant point per slide

## Content Source

Primary source:

- `docs/2026-03-27-claw-native-commerce-deck-copy.zh-CN.md`

Secondary references:

- `docs/2026-03-27-claw-native-commerce-deck-outline.zh-CN.md`
- `docs/2026-03-27-claw-native-commerce-fundraising-bp-skeleton.zh-CN.md`
- `docs/2026-03-27-claw-native-commerce-roadshow-narrative.zh-CN.md`

## Output

- script: `scripts/generate-fundraising-deck.mjs`
- deck: `docs/presentations/2026-03-27-claw-native-commerce-fundraising-deck.pptx`

## Verification

Minimum verification:

- run the generation script successfully
- verify the pptx file exists
- inspect the OpenXML package to confirm slide count and expected title text

Stretch verification:

- generate a macOS Quick Look thumbnail for a visual smoke check when available

## Known Limits

- full slide-by-slide visual QA is constrained by the local toolchain because LibreOffice is not available in this environment
- first-pass visual validation will rely on generated output structure and limited system preview support
