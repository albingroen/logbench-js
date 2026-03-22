import type { LogbenchOptions, LogContent, LogOptions } from "./types";
import { LogLevel } from "./enums";
import { getCallerLocation, jsReplacer } from "./utils";

/**
 * Client for sending structured logs to a Logbench server.
 *
 * @example
 * ```ts
 * import { Logbench } from "logbench-js";
 *
 * const logger = new Logbench({
 *   projectId: "your-project-id",
 * });
 *
 * await logger.info("Server started", { port: 3000 });
 * ```
 *
 * @example Setup global `bench` helper
 * ```ts
 * const logger = new Logbench({ projectId: "my-project" });
 * logger.setupGlobals();
 *
 * // Now available everywhere:
 * bench.info("hello");  // logs to Logbench AND console.info
 * bench.warn("uh oh");  // logs to Logbench AND console.warn
 * bench.error("broken");  // logs to Logbench AND console.error
 * ```
 */
const DEFAULT_URL = "http://localhost:1447";

export class Logbench {
  private options: LogbenchOptions;
  private url: string;
  private cwd: string | undefined;
  private callerFrameOffset: number = 3;

  constructor(options: LogbenchOptions) {
    this.options = options;
    this.url = options.url ?? DEFAULT_URL;
    this.cwd = options.cwd?.replace(/\/$/, "");
  }

  /**
   * Registers `globalThis.bench` with `info`, `warn`, and `error` methods that
   * send logs to Logbench and forward the arguments to the corresponding
   * `console` method (`console.info`, `console.warn`, `console.error`).
   */
  setupGlobals() {
    this.callerFrameOffset = 4;

    globalThis.bench = {
      log: (...args) => {
        this.log(...args);
        console.log(...args);
      },
      info: (...args) => {
        this.info(...args);
        console.info(...args);
      },
      warn: (...args) => {
        this.warn(...args);
        console.warn(...args);
      },
      error: (...args) => {
        this.error(...args);
        console.error(...args);
      },
      logWith: (options, ...args) => {
        this.logWith(options, ...args);
        console.log(...args);
      },
      infoWith: (options, ...args) => {
        this.infoWith(options, ...args);
        console.info(...args);
      },
      warnWith: (options, ...args) => {
        this.warnWith(options, ...args);
        console.warn(...args);
      },
      errorWith: (options, ...args) => {
        this.errorWith(options, ...args);
        console.error(...args);
      },
    };
  }

  /**
   * Send a generic log-level log.
   * @param content - One or more values of any type to log.
   */
  async log(...content: LogContent) {
    return this.send(LogLevel.Log, content);
  }

  /**
   * Send an info-level log.
   * @param content - One or more values of any type to log.
   */
  async info(...content: LogContent) {
    return this.send(LogLevel.Info, content);
  }

  /**
   * Send a warning-level log.
   * @param content - One or more values of any type to log.
   */
  async warn(...content: LogContent) {
    return this.send(LogLevel.Warn, content);
  }

  /**
   * Send an error-level log.
   * @param content - One or more values of any type to log.
   */
  async error(...content: LogContent) {
    return this.send(LogLevel.Error, content);
  }

  /**
   * Send a generic log-level log with additional metadata.
   * @param options - Bookmark and annotation metadata.
   * @param content - One or more values of any type to log.
   */
  async logWith(options: LogOptions, ...content: LogContent) {
    return this.send(LogLevel.Log, content, options);
  }

  /**
   * Send an info-level log with additional metadata.
   * @param options - Bookmark and annotation metadata.
   * @param content - One or more values of any type to log.
   */
  async infoWith(options: LogOptions, ...content: LogContent) {
    return this.send(LogLevel.Info, content, options);
  }

  /**
   * Send a warning-level log with additional metadata.
   * @param options - Bookmark and annotation metadata.
   * @param content - One or more values of any type to log.
   */
  async warnWith(options: LogOptions, ...content: LogContent) {
    return this.send(LogLevel.Warn, content, options);
  }

  /**
   * Send an error-level log with additional metadata.
   * @param options - Bookmark and annotation metadata.
   * @param content - One or more values of any type to log.
   */
  async errorWith(options: LogOptions, ...content: LogContent) {
    return this.send(LogLevel.Error, content, options);
  }

  private async send(level: LogLevel, content: LogContent, options?: LogOptions) {
    try {
      const source =
        this.options.captureSource !== false
          ? getCallerLocation(this.callerFrameOffset)
          : undefined;

      // Replace URL origin with cwd to produce a real filesystem path
      if (source && this.cwd && source.fileName.startsWith("http")) {
        source.fileName = this.cwd + new URL(source.fileName).pathname;
      }

      return fetch(`${this.url}/api/projects/${this.options.projectId}/logs/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          {
            content: content.length === 1 ? content[0] : content,
            level,
            ...(source != null && { source }),
            ...(options?.isBookmarked != null && {
              isBookmarked: options.isBookmarked,
            }),
            ...(options?.annotation != null && {
              annotation: options.annotation,
            }),
          },
          jsReplacer,
        ),
      });
    } catch {
      /* ignore — logging should never crash the host application */
    }
  }
}
