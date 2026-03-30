#!/usr/bin/env bash
set -euo pipefail

pnpm lint
pnpm typecheck:release
pnpm test:release
