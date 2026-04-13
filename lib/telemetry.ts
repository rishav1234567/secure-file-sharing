/**
 * OpenTelemetry instrumentation for the secure-file-sharing app.
 *
 * This file is loaded by Next.js via the `instrumentation.ts` convention
 * (server-side only, Node.js runtime). It initializes the OTel SDK with:
 *  - Auto-instrumentation for HTTP, MongoDB, and other libraries
 *  - OTLP HTTP exporter (pointing to Jaeger or any OTel collector)
 *  - Console span exporter in development
 */
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { trace, SpanStatusCode } from "@opentelemetry/api";

const SERVICE_NAME =
  process.env.OTEL_SERVICE_NAME ?? "secure-file-sharing";

const exporterUrl =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318";

let sdk: NodeSDK | null = null;

/**
 * Initializes the OpenTelemetry SDK. Called once at server startup.
 */
export function initTelemetry(): void {
  if (sdk) return; // Already initialized

  const exporter = new OTLPTraceExporter({
    url: `${exporterUrl}/v1/traces`,
  });

  sdk = new NodeSDK({
    traceExporter: exporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false }, // too noisy
      }),
    ],
  });

  sdk.start();
  console.log(`[OTel] Telemetry initialized → ${exporterUrl}`);

  // Graceful shutdown
  process.on("SIGTERM", () => {
    sdk?.shutdown().finally(() => process.exit(0));
  });
}

/** Returns the named tracer for manual instrumentation */
export function getTracer() {
  return trace.getTracer(SERVICE_NAME, "1.0.0");
}

/**
 * Wraps an async function in an OTel span.
 * Records duration and captures errors automatically.
 *
 * @param spanName - Name shown in Jaeger / OTel UI
 * @param fn - The async function to trace
 * @param attributes - Optional key-value attributes added to the span
 */
export async function withSpan<T>(
  spanName: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const tracer = getTracer();
  return tracer.startActiveSpan(spanName, async (span) => {
    if (attributes) {
      span.setAttributes(attributes);
    }
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : String(err),
      });
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}
