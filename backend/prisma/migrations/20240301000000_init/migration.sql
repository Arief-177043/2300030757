CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "NotificationType" AS ENUM ('Placement', 'Result', 'Event');

CREATE TABLE "User" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "email"     TEXT NOT NULL,
    "password"  TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "studentId" TEXT NOT NULL,
    "type"      "NotificationType" NOT NULL,
    "message"   TEXT NOT NULL,
    "isRead"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key"     ON "User"("email");
CREATE UNIQUE INDEX "User_studentId_key" ON "User"("studentId");

CREATE INDEX "Notification_studentId_isRead_idx"           ON "Notification"("studentId", "isRead");
CREATE INDEX "Notification_studentId_isRead_createdAt_idx" ON "Notification"("studentId", "isRead", "createdAt");
CREATE INDEX "Notification_createdAt_idx"                   ON "Notification"("createdAt");

ALTER TABLE "Notification"
    ADD CONSTRAINT "Notification_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "User"("studentId")
    ON DELETE RESTRICT ON UPDATE CASCADE;
