# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

logbench-js is a JavaScript/TypeScript SDK for [Logbench](https://github.com/albingroen/logbench). It provides a simple client (`Logbench` class) that sends structured logs to a Logbench server via HTTP POST requests.

## Development

- **Runtime**: Bun
- **Install deps**: `bun install`
- **Type check**: `bun run tsc --noEmit` (noEmit is configured in tsconfig; there is no build step)
- **No test suite currently exists**

## Architecture

The SDK lives under `src/` and is split by concern:

- `src/index.ts` — Barrel re-exports all public API
- `src/types.ts` — `LogbenchOptions`, `LogContent`, `LogOptions` type definitions
- `src/enums.ts` — `LogLevel` enum (`Info`, `Warn`, `Err`)
- `src/utils.ts` — Internal helpers: `getCallerLocation` for source capture, `jsReplacer` for encoding JS-specific types (Map, Set, BigInt, Error, etc.) into a `{ _type, _value? }` envelope over the wire
- `src/client.ts` — `Logbench` class with `info()`, `warn()`, `err()`, `infoWith()`, `warnWith()`, `errWith()` methods

All log methods POST to `{url}/api/projects/{projectId}/logs/ingest` using fetch. Errors are silently caught so logging never crashes the host application.

## Code Style

- Always use curly braces for `if` statements, even single-line ones
- Add a blank line after each `if` block
