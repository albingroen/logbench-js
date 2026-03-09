# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

logbench-js is a JavaScript/TypeScript SDK for [Logbench](https://github.com/albingroen/logbench). It provides a simple client (`Logbench` class) that sends structured logs to a Logbench server via HTTP POST requests. Content is serialized with superjson to preserve rich types (Date, Map, Set, etc.).

## Development

- **Runtime**: Bun
- **Install deps**: `bun install`
- **Type check**: `bun run tsc --noEmit` (noEmit is configured in tsconfig; there is no build step)
- **No test suite currently exists**

## Architecture

This is a single-file SDK (`index.ts`). It exports:
- `Logbench` class — instantiated with `{ url, projectId }`, exposes `info()`, `warn()`, `err()` methods
- `LogLevel` enum — `Info`, `Warn`, `Err`

All log methods POST to `{url}/api/projects/{projectId}/logs/ingest` using axios. Errors are silently caught so logging never crashes the host application.
