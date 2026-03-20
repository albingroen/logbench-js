# logbench-js

A JavaScript/TypeScript SDK for [Logbench](https://github.com/albingroen/logbench)

## Install

```bash
bun add -D logbench-js
```

```bash
npm install -D logbench-js
```

## Quick start

```typescript
import { Logbench } from "logbench-js";

const logger = new Logbench({
  projectId: "your-project-id",
});

logger.log("Server started on port 3000");
logger.info("Server started on port 3000");
logger.warn("Disk usage above 80%");
logger.error("Failed to connect to database");
```

## API

### `new Logbench(options)`

Creates a new Logbench client.

| Option          | Type      | Required | Description                                                                                                                                                                                       |
| --------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`           | `string`  | No       | Base URL of your Logbench instance. Defaults to `"http://localhost:1447"`                                                                                                                         |
| `projectId`     | `string`  | Yes      | Project ID from your Logbench dashboard                                                                                                                                                           |
| `captureSource` | `boolean` | No       | Capture the source file and line number of each log. Defaults to `true`; set to `false` to disable.                                                                                               |
| `cwd`           | `string`  | No       | Project root directory. When set, replaces the URL origin in browser-captured filenames (e.g. `"http://localhost:3000"`) with the local path, producing real filesystem paths in the Logbench UI. |

### `logger.log(...content)`

Send a generic log-level log.

### `logger.info(...content)`

Send an info-level log.

### `logger.warn(...content)`

Send a warning-level log.

### `logger.error(...content)`

Send an error-level log.

All methods accept any number of arguments of any type.

```typescript
logger.info("User signed in", { userId: "abc123", at: new Date() });
logger.error("Request failed", { status: 500, headers: new Map([["x-request-id", "abc"]]) });
```

### `logger.setupGlobals()`

Registers a global `bench` object on `globalThis` with `log`, `info`, `warn`, `error`, and their `*With` variants. Each method sends the log to Logbench **and** forwards the arguments to the corresponding `console` method (`console.log`, `console.info`, `console.warn`, `console.error`).

```typescript
const logger = new Logbench({ projectId: "your-project-id" });
logger.setupGlobals();

// Available everywhere — no imports needed:
bench.log("Server started", { port: 3000 });
bench.info("Server started", { port: 3000 });
bench.warn("Disk usage above 80%");
bench.error("Failed to connect to database");
```

TypeScript users get type support automatically via the bundled `global.d.ts` declarations.

### `logger.logWith(options, ...content)`

### `logger.infoWith(options, ...content)`

### `logger.warnWith(options, ...content)`

### `logger.errorWith(options, ...content)`

Same as `log`, `info`, `warn`, and `error`, but with an additional `LogOptions` first argument for attaching metadata:

| Option         | Type      | Description                                 |
| -------------- | --------- | ------------------------------------------- |
| `isBookmarked` | `boolean` | Mark this log as bookmarked in the UI       |
| `annotation`   | `string`  | Free-text annotation to attach to the entry |

```typescript
logger.infoWith({ isBookmarked: true, annotation: "deploy v2.1.0" }, "Deployment started", {
  version: "2.1.0",
});
```

### `LogLevel`

Exported enum for the four log levels if you need to reference them directly.

```typescript
import { LogLevel } from "logbench-js";

LogLevel.Log; // "LOG"
LogLevel.Info; // "INFO"
LogLevel.Warn; // "WARNING"
LogLevel.Error; // "ERROR"
```

## How it works

Each log call sends a POST request to your Logbench instance:

```
POST {url}/api/projects/{projectId}/logs/ingest
```

Errors from the HTTP call are silently caught so logging never crashes your application.

## Project structure

```
src/
  index.ts    Barrel export
  types.ts    TypeScript type definitions
  enums.ts    LogLevel enum
  utils.ts    Internal helpers (source location capture)
  client.ts   Logbench client class
```

## License

MIT
