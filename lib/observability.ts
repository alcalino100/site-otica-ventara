/**
 * Observability & Telemetry Client
 * Pluggable for Sentry, OpenTelemetry, Datadog or New Relic
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface EventContext {
  [key: string]: unknown;
}

class ObservabilityManager {
  private isDevelopment = process.env.NODE_ENV === "development";

  public captureException(error: Error, context?: EventContext) {
    if (this.isDevelopment) {
      console.error("[Observability Error Captured]", error, context);
    }

    // Window / Sentry integration if available
    if (typeof window !== "undefined" && (window as unknown as { Sentry?: { captureException: (e: Error, ctx?: unknown) => void } }).Sentry) {
      (window as unknown as { Sentry: { captureException: (e: Error, ctx?: unknown) => void } }).Sentry.captureException(error, { extra: context });
    }
  }

  public trackEvent(name: string, properties?: EventContext) {
    if (this.isDevelopment) {
      console.log(`[Telemetry Event: ${name}]`, properties);
    }
  }

  public log(level: LogLevel, message: string, context?: EventContext) {
    if (this.isDevelopment) {
      console[level](`[Ventara Log - ${level.toUpperCase()}] ${message}`, context || "");
    }
  }
}

export const logger = new ObservabilityManager();
