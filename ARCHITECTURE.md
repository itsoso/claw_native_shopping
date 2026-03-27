# Claw Native Architecture

This repository now contains three complementary architecture documents that explain the same system for different readers.

## Recommended Reading Order

### 1. Canonical Current-State Architecture

Start here if you want the most accurate description of what is actually implemented today.

- [当前系统架构说明](./docs/2026-03-26-claw-native-commerce-current-architecture.zh-CN.md)

This document explains:

- what Claw Native is right now
- how the browser extension, buyer API, orchestrator, seller protocol, and seller-sim fit together
- what is implemented vs what remains aspirational

### 2. Investor / Partner Brief

Read this when you need a concise external explanation of why the architecture matters.

- [投资人简版说明](./docs/2026-03-26-claw-native-commerce-investor-brief.zh-CN.md)

This version focuses on:

- why Claw Native is not a traditional ecommerce frontend
- why buyer-agent-first commerce is strategically important
- what the current MVP already proves

### 3. Team System Breakdown

Read this when you need to work on the system, extend it, or reason about boundaries.

- [团队系统拆解版](./docs/2026-03-26-claw-native-commerce-system-breakdown.zh-CN.md)

This version focuses on:

- subsystem responsibilities
- runtime flow
- domain package boundaries
- architecture guardrails
- the next engineering steps

### 4. Roadshow Narrative

Read this when you need to explain the architecture verbally in a pitch or partner meeting.

- [路演口径版](./docs/2026-03-27-claw-native-commerce-roadshow-narrative.zh-CN.md)

This version focuses on:

- how to tell the story in 30 seconds, 3 minutes, and 10 minutes
- what to emphasize to investors
- what objections to expect

## System In One Paragraph

Claw Native is currently a buyer-agent-first commerce system with two connected product surfaces:

- a JD shopping copilot browser extension that helps users decide how to buy
- a Native Commerce backend that turns structured purchase requests into orchestrated sourcing, seller selection, policy evaluation, hold, commit, and explanation

The current live architecture is not yet a production marketplace, but it already proves the key shape of the system:

- user-facing shopping assistance
- buyer API as a structured entrypoint
- an orchestrator as the single transaction brain
- seller protocol as the boundary to the seller network
- auditability as a first-class requirement

## Current Repository Shape

The main runtime layers live here:

- `apps/browser-extension`
- `apps/api`
- `apps/seller-sim`
- `apps/web`
- `packages/orchestrator`
- `packages/seller-protocol`
- `packages/demand-planner`
- `packages/policy-engine`
- `packages/offer-evaluator`
- `packages/checkout`
- `packages/memory`

## What This Repository Is Not

To avoid architectural drift, keep these distinctions explicit:

- This is not just a browser extension project.
- This is not just a seller simulator demo.
- This is not yet a production ecommerce platform.
- This is not a chat UI wrapped around model calls.

It is a working baseline for an agent commerce stack.
