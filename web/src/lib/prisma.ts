import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Prisma가 허용하는 Postgres URL 쿼리만 남깁니다. */
export function sanitizeDatabaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");
  const url = new URL(trimmed);

  const allowed = new Set([
    "sslmode",
    "connect_timeout",
    "connection_limit",
    "pool_timeout",
    "pgbouncer",
    "schema",
    "application_name",
    "channel_binding",
    "statement_cache_size",
  ]);

  const next = new URLSearchParams();
  for (const [key, value] of url.searchParams.entries()) {
    if (allowed.has(key)) {
      next.set(key, value);
    }
  }

  if (!next.has("sslmode")) next.set("sslmode", "require");
  if (!next.has("connect_timeout")) next.set("connect_timeout", "30");
  if (url.hostname.includes("-pooler") && !next.has("pgbouncer")) {
    next.set("pgbouncer", "true");
  }
  if (!next.has("connection_limit")) next.set("connection_limit", "1");

  url.search = next.toString();
  return url.toString();
}

function createPrismaClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL이 설정되지 않았습니다.");
  }

  const url = sanitizeDatabaseUrl(raw);
  // PrismaClient reads DATABASE_URL from env; override for this process.
  process.env.DATABASE_URL = url;
  if (process.env.DIRECT_URL) {
    process.env.DIRECT_URL = sanitizeDatabaseUrl(process.env.DIRECT_URL);
  }

  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
