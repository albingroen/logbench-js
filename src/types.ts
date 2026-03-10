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
