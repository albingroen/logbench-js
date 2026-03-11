import ErrorStackParser from "error-stack-parser";
import type { SourceLocation } from "./types.ts";

/**
 * JSON.stringify replacer that encodes JS-specific types that have no JSON
 * equivalent into a `{ _type, _value? }` envelope so they survive the wire.
 * @internal
 */
export function jsReplacer(_: string, v: unknown): unknown {
  if (v === undefined) {
    return { _type: "@js/undefined" };
  }

  if (typeof v === "number" && Number.isNaN(v)) {
    return { _type: "@js/NaN" };
  }

  if (typeof v === "number" && !Number.isFinite(v)) {
    return { _type: "@js/Infinity", _value: v > 0 ? 1 : -1 };
  }

  if (v instanceof Map) {
    return { _type: "@js/Map", _value: [...v.entries()] };
  }

  if (v instanceof Set) {
    return { _type: "@js/Set", _value: [...v.values()] };
  }

  if (typeof v === "bigint") {
    return { _type: "@js/BigInt", _value: v.toString() };
  }

  if (v instanceof RegExp) {
    return { _type: "@js/RegExp", _value: v.toString() };
  }

  if (typeof v === "function") {
    return { _type: "@js/Function", _value: v.toString() };
  }

  if (v instanceof Error) {
    return {
      _type: "@js/Error",
      _value: { message: v.message, cause: v.cause, name: v.name, stack: v.stack },
    };
  }

  return v;
}

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
