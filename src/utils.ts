import ErrorStackParser from "error-stack-parser";
import type { SourceLocation } from "./types.ts";

/**
 * Walks the error stack to find the caller's source location.
 *
 * Stack frames skipped:
 * `getCallerLocation` (0) → `Logbench.log` (1) → `Logbench.{info|warn|...}` (2) → **caller** (3)
 *
 * @returns A `SourceLocation` object, or `undefined` if parsing fails.
 * @internal
 */
export function getCallerLocation(): SourceLocation | undefined {
  try {
    const frames = ErrorStackParser.parse(new Error());
    const caller = frames[3];
    if (!caller?.fileName || !caller.lineNumber) return undefined;
    const fileName = caller.fileName.split("?")[0]!;
    return {
      fileName,
      lineNumber: caller.lineNumber,
      ...(caller.columnNumber != null && { columnNumber: caller.columnNumber }),
    };
  } catch {
    return undefined;
  }
}
