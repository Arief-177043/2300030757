# AffordMed Campus Hiring — Notification System Design

---

## Stage 1 — REST API Design

### Overview

The notification system exposes a JSON REST API secured with JWT Bearer tokens. All protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication Endpoints

#### POST /api/auth/register

Request:
```json
{
  "name": "Jane Doe",
  "email": "jane@college.edu",
  "password": "secret123",
  "studentId": "STU-2024-001"
}
```

Response 201:
```json
{
  "token": "<jwt>",
  "user": {
    "id": "uuid",
    "email": "jane@college.edu",
    "name": "Jane Doe",
    "studentId": "STU-2024-001"
  }
}
```

#### POST /api/auth/login

Request:
```json
{ "email": "jane@college.edu", "password": "secret123" }
```

Response 200:
```json
{
  "token": "<jwt>",
  "user": { "id": "uuid", "email": "jane@college.edu", "name": "Jane Doe", "studentId": "STU-2024-001" }
}
```

### Notification Endpoints

#### GET /api/notifications

Query params: `page`, `limit`, `type` (Placement|Result|Event), `isRead` (true|false), `search`, `sortOrder` (asc|desc)

Response 200:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "studentId": "STU-2024-001",
      "type": "Placement",
      "message": "Interview scheduled with Acme Corp",
      "isRead": false,
      "createdAt": "2024-03-01T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

#### GET /api/notifications/unread

Same shape as above, pre-filtered to `isRead = false`.

#### POST /api/notifications

Request:
```json
{
  "studentId": "STU-2024-001",
  "type": "Result",
  "message": "Your aptitude test result is available."
}
```

Response 201: returns the created notification object.

#### PATCH /api/notifications/:id/read

Response 200: returns updated notification with `isRead: true`.

#### GET /api/notifications/priority

Response 200:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "Placement",
      "message": "...",
      "priorityScore": 45,
      "source": "local"
    }
  ]
}
```

### JSON Schema — Notification

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "object",
  "required": ["id", "studentId", "type", "message", "isRead", "createdAt"],
  "properties": {
    "id":        { "type": "string", "format": "uuid" },
    "studentId": { "type": "string" },
    "type":      { "type": "string", "enum": ["Placement", "Result", "Event"] },
    "message":   { "type": "string", "minLength": 1 },
    "isRead":    { "type": "boolean" },
    "createdAt": { "type": "string", "format": "date-time" }
  }
}
```

---

## Stage 2 — PostgreSQL Schema Design

### Tables

```sql
CREATE TABLE "User" (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  name       TEXT NOT NULL,
  studentId  TEXT UNIQUE NOT NULL,
  createdAt  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Notification" (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studentId  TEXT NOT NULL REFERENCES "User"(studentId),
  type       TEXT NOT NULL CHECK (type IN ('Placement','Result','Event')),
  message    TEXT NOT NULL,
  isRead     BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Indexing Strategy

```sql
CREATE INDEX idx_notif_student_read       ON "Notification" (studentId, isRead);
CREATE INDEX idx_notif_student_read_time  ON "Notification" (studentId, isRead, createdAt DESC);
CREATE INDEX idx_notif_created_at         ON "Notification" (createdAt DESC);
```

**Rationale:**

- `(studentId, isRead)` — covers all "fetch my unread" queries with zero table scan.
- `(studentId, isRead, createdAt DESC)` — the composite covering index satisfies ORDER BY without a filesort, critical at scale.
- `(createdAt DESC)` — supports admin/global listing and the priority inbox recency computation.

### Scaling Considerations

- Partition `Notification` by `createdAt` range (monthly) once rows exceed 50 M.
- Archive notifications older than 180 days to a cold-storage table or object store.
- Use `UUID` primary keys to enable horizontal shard distribution by `studentId` without key collisions.
- Add a partial index `WHERE isRead = FALSE` to keep the unread query index tight.

---

## Stage 3 — Query Optimization for Unread Notifications

### Baseline Query

```sql
SELECT * FROM "Notification"
WHERE studentId = $1 AND isRead = FALSE
ORDER BY createdAt DESC
LIMIT 10 OFFSET 20;
```

### EXPLAIN Analysis (simulated)

Without index: Sequential scan → O(n) per student.

With `(studentId, isRead, createdAt DESC)` index:
```
Index Scan using idx_notif_student_read_time on "Notification"
  Index Cond: (studentId = $1 AND isRead = FALSE)
  Rows Removed by Filter: 0
  Actual rows: 10, loops: 1
```

All three clauses (filter + sort + limit) are resolved at the index level — no heap access needed for the paginated slice.

### Count Optimization

Avoid `SELECT COUNT(*)` on every page load. Instead:
- Cache count in Redis with a 30-second TTL keyed by `studentId:unread:count`.
- Invalidate on `INSERT` and `PATCH /read`.

### Cursor-Based Pagination (preferred over OFFSET at scale)

```sql
SELECT * FROM "Notification"
WHERE studentId = $1 AND isRead = FALSE
  AND createdAt < $2
ORDER BY createdAt DESC
LIMIT 10;
```

`$2` = last `createdAt` from previous page. Eliminates OFFSET penalty at large pages.

---

## Stage 4 — Performance Improvement Strategies

### Caching Layer (Redis)

| Cache Key                        | TTL    | Invalidation Trigger          |
|----------------------------------|--------|-------------------------------|
| `notif:unread:{studentId}`       | 30s    | INSERT, PATCH read            |
| `notif:count:{studentId}:{type}` | 60s    | INSERT                        |
| `notif:priority:{studentId}`     | 120s   | INSERT                        |

Use write-through cache for counts. Use cache-aside for notification lists.

### Pagination

Switch from OFFSET to cursor-based pagination using `createdAt` as the cursor for O(log n) seek rather than O(n) skip.

### Read Replicas

Route all `SELECT` queries (GET /notifications, GET /unread, GET /priority) to a read replica. Route writes (INSERT, UPDATE) to the primary.

In Prisma:
```typescript
const readPrisma = new PrismaClient({ datasourceUrl: process.env.READ_REPLICA_URL });
```

### Connection Pooling

Use PgBouncer in transaction mode with pool_size = 20 per application instance.

### Compression

Enable gzip on Express for API responses, reducing payload size ~70% for notification lists.

---

## Stage 5 — Architecture for 50,000 Students

### Problem

Sending notifications to 50,000 students simultaneously is a throughput and reliability problem. Naive synchronous database inserts will exhaust connection pools.

### Architecture

```
Producer (Event Source)
        │
        ▼
  Message Queue (RabbitMQ / SQS)
        │
   ┌────┴────┐
   ▼         ▼
Worker 1   Worker 2  ...  Worker N
   │         │
   ▼         ▼
PostgreSQL (via PgBouncer)
   │
   ▼
Redis (cache invalidation)
   │
   ▼
WebSocket Server → Browser Push
```

### Queue Design

- **Exchange**: `notifications` (fanout for broadcast, direct for targeted)
- **Queue**: `notification.delivery` with dead-letter queue `notification.dlq`
- **Message TTL**: 24 hours
- **Prefetch**: 50 messages per worker

### Worker Logic

```javascript
channel.consume('notification.delivery', async (msg) => {
  const { studentId, type, message } = JSON.parse(msg.content);
  try {
    await prisma.notification.create({ data: { studentId, type, message } });
    await redis.del(`notif:unread:${studentId}`);
    channel.ack(msg);
  } catch (err) {
    if (msg.fields.deliveryTag < 3) {
      channel.nack(msg, false, true);  // requeue up to 3 times
    } else {
      channel.nack(msg, false, false); // send to DLQ
    }
  }
});
```

### Retry Mechanism

- Exponential backoff: 1s → 5s → 30s between retries.
- Max 3 retries, then route to Dead Letter Queue for manual inspection.
- DLQ alerting via CloudWatch / PagerDuty.

### Throughput Estimate

- 10 workers × 500 inserts/s = 5,000 notifications/s
- 50,000 students × 1 notification = ~10 seconds end-to-end
- Horizontal scaling: add workers to reduce time linearly.

---

## Stage 6 — Priority Inbox Algorithm

### Objective

Return the top 10 most important notifications for a student, combining local database records with real-time data from an external evaluation service.

### Priority Score Formula

```
priorityScore = typeWeight + recencyScore
```

### Type Weight

| Type      | Weight |
|-----------|--------|
| Placement | 30     |
| Result    | 20     |
| Event     | 10     |

**Rationale**: Placement notifications directly affect a student's career, so they receive the highest weight. Results affect academic standing. Events are informational.

### Recency Score

| Age of Notification | Score |
|---------------------|-------|
| < 1 hour            | 20    |
| < 24 hours          | 15    |
| < 7 days            | 10    |
| ≥ 7 days            | 5     |

**Rationale**: A Placement notification from 2 weeks ago (score = 35) ranks below a Result notification from 30 minutes ago (score = 35 too), but an Event from right now (30) beats an old Placement (35). The dual-axis scoring ensures both topic importance and timeliness are rewarded.

### Maximum Score

`MAX = 30 (Placement) + 20 (< 1 hour) = 50`

### Algorithm Steps

1. Fetch up to 50 local notifications from PostgreSQL for the student.
2. Attempt to fetch external notifications from `http://20.244.56.144/evaluation-service/notifications` with a 5-second timeout.
3. Merge both lists (external source tagged `source: "external"`).
4. Compute `priorityScore` for each notification.
5. Sort descending by `priorityScore`.
6. Return top 10.

### Tie-Breaking

When two notifications share the same `priorityScore`, the one with a more recent `createdAt` is ranked higher (stable sort on timestamp descending).

### Failure Handling

If the external service is unreachable, the algorithm gracefully falls back to local-only notifications. The student always receives a response; external data is treated as an enhancement, not a dependency.
