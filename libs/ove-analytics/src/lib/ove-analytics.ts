export type AnalyticsEvent = {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
};

export type AnalyticsOptions = {
  flushIntervalMs?: number;
  maxBatchSize?: number;
  getAnonymousId?: () => string;
};

type QueuedEvent = {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: string;
  anonymous_id?: string;
  user_id?: string;
  context: Record<string, unknown>;
};

export class Analytics {
  private queue: QueuedEvent[] = [];
  private readonly flushInterval: number;
  private readonly isBrowser: boolean;

  constructor(
    private apiHost: string,
    private publicKey: string,
    private options: AnalyticsOptions = {},
  ) {
    if (!fetch) {
      throw new Error(
        "No fetch implementation available. Provide one in options.",
      );
    }

    this.isBrowser =
      typeof window !== "undefined" && typeof document !== "undefined";

    const interval = options.flushIntervalMs ?? 2000;

    this.flushInterval = setInterval(() => {
      this.flush().catch(() => {});
    }, interval) as unknown as number;

    if (this.isBrowser) {
      window.addEventListener("beforeunload", () => {
        this.flush(true).catch(() => {});
      });
    }
  }

  capture(input: AnalyticsEvent) {
    const event: QueuedEvent = {
      event: input.event,
      properties: input.properties,
      timestamp: new Date().toISOString(),
      anonymous_id: input.userId ? undefined : this.getAnonymousId(),
      user_id: input.userId,
      context: this.buildContext(),
    };

    this.queue.push(event);

    if (this.queue.length >= (this.options.maxBatchSize ?? 20)) {
      this.flush().catch(() => {});
    }
  }

  async flush(sync = false) {
    if (!this.queue.length) return;

    const batch = this.queue.splice(0);

    const payload = JSON.stringify({
      api_key: this.publicKey,
      events: batch,
    });

    // Browser sendBeacon optimization
    if (
      sync &&
      this.isBrowser &&
      typeof navigator !== "undefined" &&
      "sendBeacon" in navigator
    ) {
      navigator.sendBeacon(`${this.apiHost}/capture`, payload);
      return;
    }

    try {
      await fetch(`${this.apiHost}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
        keepalive: true,
      });
    } catch {
      // swallow errors
    }
  }

  shutdown() {
    clearInterval(this.flushInterval);
    return this.flush(true);
  }

  private buildContext(): Record<string, unknown> {
    if (!this.isBrowser) {
      return {
        runtime: "node",
      };
    }

    return {
      runtime: "browser",
      url: window.location.href,
      path: window.location.pathname,
      user_agent: navigator.userAgent,
      referrer: document.referrer,
    };
  }

  private getAnonymousId(): string | undefined {
    if (!this.isBrowser) {
      return undefined;
    }

    if (this.options.getAnonymousId) {
      return this.options.getAnonymousId();
    }

    const key = "analytics_anonymous_id";

    try {
      let id = localStorage.getItem(key);

      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(key, id);
      }

      return id;
    } catch {
      return undefined;
    }
  }
}
