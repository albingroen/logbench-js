export {};

import type { LogOptions } from "./types";

/**
 * Global logging interface registered by {@link Logbench.setupGlobals}.
 * Each method sends a log to Logbench and forwards to the corresponding
 * `console` method.
 */
interface Bench {
  /** Log at generic log level and forward to `console.log`. */
  log(...content: unknown[]): void;
  /** Log at info level and forward to `console.info`. */
  info(...content: unknown[]): void;
  /** Log at warn level and forward to `console.warn`. */
  warn(...content: unknown[]): void;
  /** Log at error level and forward to `console.error`. */
  error(...content: unknown[]): void;
  /** Log at generic log level with metadata and forward to `console.log`. */
  logWith(options: LogOptions, ...content: unknown[]): void;
  /** Log at info level with metadata and forward to `console.info`. */
  infoWith(options: LogOptions, ...content: unknown[]): void;
  /** Log at warn level with metadata and forward to `console.warn`. */
  warnWith(options: LogOptions, ...content: unknown[]): void;
  /** Log at error level with metadata and forward to `console.error`. */
  errorWith(options: LogOptions, ...content: unknown[]): void;
}

declare global {
  var bench: Bench;
}
