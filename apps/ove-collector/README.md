# ove-collector

A lightweight public ingestion service for browser analytics and client-side
logs, designed to store high-volume events in ClickHouse.

This service acts as a public collector (similar to PostHog, Segment, etc.)
that accepts events from unauthenticated clients using **public API keys** and
buffers them before inserting into ClickHouse.

---

## Features

- Public ingestion endpoint (`/capture`)
- Supports:
    - Custom analytics events
    - Browser / frontend logs
- Project isolation via public API keys
- Request-level rate limiting
- Event batching + timed buffer flush
- ClickHouse storage (JSONEachRow)
- Zod-based request validation

---

## Architecture Overview

Client (browser / frontend SDK)  
→ `POST /capture`  
→ Validate + enrich events  
→ Buffer in memory  
→ Flush to ClickHouse in batches

Events are:

- Validated using `zod`
- Enriched with project + request metadata
- Buffered in memory
- Inserted in batches into:
    - `analytics_events`
    - `logs`

---

## Configuration

Configuration is provided via `config.json`.

Example:

```json
{
  "SERVER": {
    "PORT": 8080
  },
  "CLICKHOUSE": {
    "CA_PATH": "/private-ca.crt",
    "URL": "http://localhost:8123",
    "USER": "clickhouse",
    "PASSWORD": "example",
    "DATABASE": "observability",
    "TIMEOUT": 60000
  },
  "PROJECTS": [
    {
      "publicKey": "public api key",
      "projectId": "ove-core-ui"
    }
  ],
  "API": {
    "BUFFER": {
      "FLUSH_INTERVAL_MS": 30000,
      "BATCH_SIZE": 50
    },
    "RATE_LIMIT": {
      "MAX_EVENTS_PER_REQUEST": 100,
      "WINDOW_MS": 60000,
      "LIMIT": 1000,
      "STANDARD_HEADERS": "draft-7",
      "LEGACY_HEADERS": false
    }
  }
}
```

---

## Configuration Options

### SERVER

| Key  | Description                        |
|------|------------------------------------|
| PORT | Port the Express server listens on |

---

### CLICKHOUSE

| Key      | Description                                |
|----------|--------------------------------------------|
| CA_PATH  | Path to CA certificate (optional, for TLS) |
| URL      | ClickHouse HTTP endpoint                   |
| USER     | ClickHouse user                            |
| PASSWORD | ClickHouse password                        |
| DATABASE | Target database                            |
| TIMEOUT  | Request timeout (ms)                       |

---

### PROJECTS

Defines allowed public API keys.

Each project:

```json
{
  "publicKey": "public api key",
  "projectId": "internal-project-id"
}
```

- `publicKey` → used by frontend clients
- `projectId` → stored internally in ClickHouse

---

### API.BUFFER

| Key               | Description                                      |
|-------------------|--------------------------------------------------|
| FLUSH_INTERVAL_MS | Time-based flush interval                        |
| BATCH_SIZE        | Number of buffered events before immediate flush |

Events are flushed when:

- Batch size is reached, OR
- Flush interval timer fires

---

### API.RATE_LIMIT

| Key                    | Description                    |
|------------------------|--------------------------------|
| MAX_EVENTS_PER_REQUEST | Max events allowed per request |
| WINDOW_MS              | Rate limit window              |
| LIMIT                  | Max requests per window per IP |
| STANDARD_HEADERS       | Rate-limit header spec         |
| LEGACY_HEADERS         | Enable legacy headers          |

---

## API

### Health Check

```
GET /
```

Response:

```json
{
  "status": "ok"
}
```

---

### Capture Events

```
POST /capture
```

Rate-limited endpoint.

### Request Body

```json
{
  "api_key": "public api key",
  "events": []
}
```

- `api_key` must match a configured project
- `events` must contain at least 1 event
- Maximum events per request is configurable

---

## Analytics Event Schema

```json
{
  "type": "analytics",
  "event": "Button Clicked",
  "timestamp": "2026-02-13T12:00:00Z",
  "anonymous_id": "anon-123",
  "user_id": "user-456",
  "properties": {
    "plan": "pro"
  },
  "context": {
    "url": "https://app.example.com",
    "path": "/dashboard",
    "user_agent": "Mozilla/5.0",
    "referrer": "https://google.com"
  }
}
```

### Enriched Fields

The server automatically adds:

- `project_id`
- `ip`
- Normalized `properties` (stringified values)
- Parsed `timestamp` (Date)

---

## Log Event Schema

```json
{
  "type": "log",
  "timestamp": "2026-02-13T12:00:00Z",
  "source": "browser",
  "service": "frontend",
  "level": "error",
  "message": "Something went wrong",
  "trace_id": "abc",
  "span_id": "def",
  "host": "user-machine",
  "attributes": {
    "component": "checkout"
  }
}
```

Currently stored fields:

- `level`
- `message`

(Extend in buffer enrichment if needed.)

---

## ClickHouse Tables

The service writes to:

- `analytics_events`
- `logs`

Both inserts use `JSONEachRow`.

You must create the tables yourself. Example:

```sql
CREATE TABLE analytics_events
(
    timestamp    DateTime,
    project_id   String,
    event        String,
    anonymous_id String,
    user_id      String,
    url          String,
    path         String,
    user_agent   String,
    referrer     String,
    ip           String,
    properties   Map(String, String)
) ENGINE = MergeTree
ORDER BY (project_id, timestamp);
```

```sql
CREATE TABLE logs
(
    level   String,
    message String
) ENGINE = MergeTree
ORDER BY level;
```

Adjust schema to your needs.

---

## Running the Server

Install dependencies:

```bash
npm install
```

Start:

```bash
npm run start
```

Server will run on:

```
http://localhost:8080
```

---

## Security Considerations

- Public API keys are **not secrets**
- Designed for usage in both authenticated and unauthenticated environments
- Rate limiting protects from abuse
- Need to validate and monitor traffic
- Consider:
    - IP filtering
    - WAF
    - Request body size limits (already set to 1mb)

---

## Scaling Considerations

Current implementation:

- In-memory buffer
- Single process
- No persistence if process crashes or ClickHouse query fails

---

## Design Philosophy

This collector is:

- Simple
- Fast
- Append-only
- ClickHouse-native
- Compatible with public browser ingestion

It is intentionally minimal and meant to serve as a lightweight PostHog-style ingestion layer

---