# logbench-js

A JavaScript/TypeScript SDK for [Logbench](https://github.com/albingroen/logbench)

## Install

```bash
bun add logbench-js
```

```bash
npm install logbench-js
```

## Quick start

```typescript
import { Logbench } from "logbench-js";

const logger = new Logbench({
  url: "http://localhost:1447",
  projectId: "your-project-id",
});

logger.info("Server started on port 3000");
logger.warn("Disk usage above 80%");
logger.err("Failed to connect to database");
```

## API

### `new Logbench(options)`

Creates a new Logbench client.

| Option      | Type     | Description                          |
| ----------- | -------- | ------------------------------------ |
| `url`       | `string` | Base URL of your Logbench instance   |
| `projectId` | `string` | Project ID from your Logbench dashboard |

### `logger.info(...content)`

Send an info-level log.

### `logger.warn(...content)`

Send a warning-level log.

### `logger.err(...content)`

Send an error-level log.

All methods accept any number of arguments of any type. Values are serialized with [superjson](https://github.com/flightcontrolhq/superjson), so types like `Date`, `Set`, `Map`, `BigInt`, `undefined`, and `RegExp` are preserved.

```typescript
logger.info("User signed in", { userId: "abc123", at: new Date() });
logger.err("Request failed", { status: 500, headers: new Map([["x-request-id", "abc"]]) });
```

### `LogLevel`

Exported enum for the three log levels if you need to reference them directly.

```typescript
import { LogLevel } from "logbench-js";

LogLevel.Info  // "INFO"
LogLevel.Warn  // "WARNING"
LogLevel.Err   // "ERROR"
```

## How it works

Each log call sends a POST request to your Logbench instance:

```
POST {url}/api/projects/{projectId}/logs/ingest
```

Errors from the HTTP call are silently caught so logging never crashes your application.

## License

MIT
