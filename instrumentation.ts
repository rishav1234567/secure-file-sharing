/**
 * Next.js Instrumentation Hook
 * This file is called once when the server starts (Node.js runtime only).
 * We use it to bootstrap OpenTelemetry before any requests are handled.
 */
export async function register() {
  // Only initialize OTel on the Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initTelemetry } = await import("./lib/telemetry");
    initTelemetry();
  }
}
