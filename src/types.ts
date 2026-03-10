export type SourceLocation = {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
};

/**
 * Configuration options for the Logbench client.
 */
export type LogbenchOptions = {
  /** Base URL of your Logbench instance. Defaults to `"http://localhost:1447"` if omitted. */
  url?: string;
  /** Project ID from your Logbench dashboard. */
  projectId: string;
  /** When `false`, disables capturing the source file and line number of each log call. Defaults to `true`. */
  captureSource?: boolean;
  /** Project root directory or base URL. Used to convert absolute file paths/URLs
   *  in source capture to relative paths. Useful for browser environments where
   *  filenames are full URLs (e.g. `"http://localhost:3000"`). */
  cwd?: string;
};

/**
 * Variadic log content — any number of values of any type.
 */
export type LogContent = Array<unknown>;

/**
 * Optional metadata to attach to a log entry via the `*With` methods.
 */
export type LogOptions = {
  /** Mark this log as bookmarked in the Logbench UI. */
  isBookmarked?: boolean;
  /** Free-text annotation to attach to the log entry. */
  annotation?: string;
};
