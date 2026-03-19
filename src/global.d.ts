export {};

/**
 * Global logging interface registered by {@link Logbench.setupGlobals}.
 * Each method sends a log to Logbench and forwards to the corresponding
 * `console` method.
 */
interface Bench {
  /** Log at info level and forward to `console.info`. */
  info(...content: unknown[]): void;
  /** Log at warn level and forward to `console.warn`. */
  warn(...content: unknown[]): void;
  /** Log at error level and forward to `console.error`. */
  error(...content: unknown[]): void;
}

declare global {
  var bench: Bench;
}
