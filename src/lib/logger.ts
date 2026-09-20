type LogContext = Record<string, unknown>;

function serializeError(error: unknown): LogContext {
  if (error instanceof Error) {
    // `message` and `stack` are non-enumerable own properties on Error
    // instances, so JSON.stringify(error) alone silently produces "{}" --
    // they have to be pulled out explicitly.
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { message: String(error) };
}

/**
 * The one place `console.error` gets called from. Every entry is a single
 * JSON line tagged with an `event` name and whatever context caused it, so
 * it reads the same whether it lands in a hosting platform's server logs
 * or a browser's devtools, and could be forwarded to a real log sink later
 * without touching every call site.
 */
export function logError(
  event: string,
  context: LogContext = {},
  error?: unknown,
) {
  console.error(
    JSON.stringify({
      level: "error",
      event,
      time: new Date().toISOString(),
      ...context,
      ...(error !== undefined ? { error: serializeError(error) } : {}),
    }),
  );
}
