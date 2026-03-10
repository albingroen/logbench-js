import superjson from "superjson";
import axios from "axios";
import type { LogbenchOptions, LogContent, LogOptions } from "./types.ts";
import { LogLevel } from "./enums.ts";
import { getCallerLocation } from "./utils.ts";

/**
 * Client for sending structured logs to a Logbench server.
 *
 * @example
 * ```ts
 * import { Logbench } from "logbench-js";
 *
 * const logger = new Logbench({
 *   url: "http://localhost:1447",
 *   projectId: "your-project-id",
 * });
 *
 * await logger.info("Server started", { port: 3000 });
 * ```
 */
export class Logbench {
  private options: LogbenchOptions;

  constructor(options: LogbenchOptions) {
    this.options = options;
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

  private async log(
    level: LogLevel,
    content: LogContent,
    options?: LogOptions,
  ) {
    try {
      const source = this.options.captureSource !== false
        ? getCallerLocation()
        : undefined;

      return axios.post(
        `/api/projects/${this.options.projectId}/logs/ingest`,
        {
          content: superjson.serialize(
            content.length === 1 ? content[0] : content,
          ).json,
          level,
          ...(source != null && { source }),
          ...(options?.isBookmarked != null && {
            isBookmarked: options.isBookmarked,
          }),
          ...(options?.annotation != null && {
            annotation: options.annotation,
          }),
        },
        {
          headers: { "Content-Type": "application/json" },
          baseURL: this.options.url,
        },
      );
    } catch {
      /* ignore — logging should never crash the host application */
    }
  }
}
