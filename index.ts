import superjson from "superjson";
import axios from "axios";

type LogbenchOptions = { url: string; projectId: string };

type LogContent = Array<unknown>;

export type LogOptions = {
  isBookmarked?: boolean
  annotation?: string
}

export enum LogLevel {
  Info = "INFO",
  Warn = "WARNING",
  Err = "ERROR",
}

export class Logbench {
  private options: LogbenchOptions;

  constructor(options: LogbenchOptions) {
    this.options = options;
  }

  async info(...content: LogContent) {
    return this.log(LogLevel.Info, content);
  }

  async warn(...content: LogContent) {
    return this.log(LogLevel.Warn, content);
  }

  async err(...content: LogContent) {
    return this.log(LogLevel.Err, content);
  }

  async infoWith(options: LogOptions, ...content: LogContent) {
    return this.log(LogLevel.Info, content, options);
  }

  async warnWith(options: LogOptions, ...content: LogContent) {
    return this.log(LogLevel.Warn, content, options);
  }

  async errWith(options: LogOptions, ...content: LogContent) {
    return this.log(LogLevel.Err, content, options);
  }

  private async log(level: LogLevel, content: LogContent, options?: LogOptions) {
    try {
      return axios.post(
        `/api/projects/${this.options.projectId}/logs/ingest`,
        {
          content: superjson.serialize(
            content.length === 1 ? content[0] : content,
          ).json,
          level,
          isBookmarked: options?.isBookmarked,
          annotation: options?.annotation,
        },
        {
          headers: { "Content-Type": "application/json" },
          baseURL: this.options.url,
        },
      );
    } catch {
      /* ignore error */
    }
  }
}

