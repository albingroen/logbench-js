import type { LogbenchOptions, LogContent, LogOptions } from "./types.ts";
import { LogLevel } from "./enums.ts";
import { getCallerLocation, jsReplacer } from "./utils.ts";

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
 * bench.err("broken");  // logs to Logbench AND console.error
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
   * Registers `globalThis.bench` with `info`, `warn`, and `err` methods that
   * send logs to Logbench and forward the arguments to the corresponding
   * `console` method (`console.info`, `console.warn`, `console.error`).
   */
  setupGlobals() {
    this.callerFrameOffset = 4;

    globalThis.bench = {
      info: (...args) => {
        this.info(...args);
        console.info(...args);
      },
      warn: (...args) => {
        this.warn(...args);
        console.warn(...args);
      },
      err: (...args) => {
        this.err(...args);
        console.error(...args);
      },
    };
  }

  /**
   * Send an info-level log.
   * @param content - One or more values of any type to log.
   */
  async info(...content: LogContent) {
    return this.log(LogLevel.Info, content);
  }

  /**
   * Send a warning-level log.
   * @param content - One or more values of any type to log.
   */
  async warn(...content: LogContent) {
    return this.log(LogLevel.Warn, content);
  }

  /**
   * Send an error-level log.
   * @param content - One or more values of any type to log.
   */
  async err(...content: LogContent) {
    return this.log(LogLevel.Err, content);
  }

  /**
   * Send an info-level log with additional metadata.
   * @param options - Bookmark and annotation metadata.
   * @param content - One or more values of any type to log.
   */
  async infoWith(options: LogOptions, ...content: LogContent) {
    return this.log(LogLevel.Info, content, options);
  }

  /**
   * Send a warning-level log with additional metadata.
   * @param options - Bookmark and annotation metadata.
   * @param content - One or more values of any type to log.
   */
  async warnWith(options: LogOptions, ...content: LogContent) {
    return this.log(LogLevel.Warn, content, options);
  }

  /**
   * Send an error-level log with additional metadata.
   * @param options - Bookmark and annotation metadata.
   * @param content - One or more values of any type to log.
   */
  async errWith(options: LogOptions, ...content: LogContent) {
    return this.log(LogLevel.Err, content, options);
  }

  private async log(level: LogLevel, content: LogContent, options?: LogOptions) {
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
