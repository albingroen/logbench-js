import ErrorStackParser from "error-stack-parser";
import type { SourceLocation } from "./types";

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
    const s = v.toString();
    return s.startsWith("class ")
      ? { _type: "@js/Class", _value: s }
      : { _type: "@js/Function", _value: s };
  }

  if (v instanceof Error) {
    return {
      _type: "@js/Error",
      _value: {
        message: v.message,
        cause: v.cause,
        name: v.name,
        stack: v.stack,
      },
    };
  }

  if (v !== null && typeof v === "object" && v.constructor?.toString().startsWith("class ")) {
    const proto = Object.getPrototypeOf(v);
    const methods = Object.fromEntries(
      Object.getOwnPropertyNames(proto)
        .filter((k) => k !== "constructor")
        .map((k) => [k, proto[k]]),
    );

    return {
      _type: "@js/ClassInstance",
      _value: Object.assign({ className: v.constructor.name || "(anonymous)" }, v, methods),
    };
  }

  return v;
}

/**
 * Walks the error stack to find the caller's source location.
 *
 * @param frameOffset - Index of the caller frame in the stack. Direct calls
 *   use offset 3 (`getCallerLocation` → `log` → `info|warn|error` → **caller**).
 *   When called via the `setupGlobals()` wrapper, offset 4 accounts for the
 *   extra `bench.*` frame.
 *
 * @returns A `SourceLocation` object, or `undefined` if parsing fails.
 * @internal
 */
export function getCallerLocation(frameOffset: number): SourceLocation | undefined {
  try {
    const frames = ErrorStackParser.parse(new Error());
    const caller = frames[frameOffset];
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
