/* global setInterval, console */

import { clickhouse } from "./clickhouse";
import { env } from "./env";

type BufferedEvent = {
  type: "analytics" | "log";
  data: Record<string, unknown>;
};

class EventBuffer {
  private buffer: BufferedEvent[] = [];

  constructor() {
    setInterval(() => this.flush(), env.API.BUFFER.FLUSH_INTERVAL_MS);
  }

  async add(events: BufferedEvent[]) {
    this.buffer.push(...events);

    if (this.buffer.length >= env.API.BUFFER.BATCH_SIZE) {
      await this.flush();
    }
  }

  async flush() {
    if (!this.buffer.length) return;

    const batch = this.buffer.splice(0, this.buffer.length);

    try {
      await clickhouse.insert({
        table: "analytics_events",
        values: batch
          .filter(({ type }) => type === "analytics")
          .map(({ data }) => data),
        format: "JSONEachRow",
      });

      await clickhouse.insert({
        table: "logs",
        values: batch
          .filter(({ type }) => type === "log")
          .map(({ data }) => data),
        format: "JSONEachRow",
      });
    } catch (err) {
      console.error("ClickHouse insert failed", err);
    }
  }
}

export const eventBuffer = new EventBuffer();
