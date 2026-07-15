import { NextResponse } from "next/server";
import { prisma, sanitizeDatabaseUrl } from "@/lib/prisma";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { ok: false, error: "DATABASE_URL 없음" },
        { status: 500 },
      );
    }
    if (!process.env.NEIS_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "NEIS_API_KEY 없음" },
        { status: 500 },
      );
    }

    // Validate URL shape early (throws if malformed)
    sanitizeDatabaseUrl(process.env.DATABASE_URL);

    const userCount = await prisma.user.count();

    return NextResponse.json({
      ok: true,
      db: "connected",
      userCount,
      neon: process.env.DATABASE_URL.includes("neon.tech"),
      pooler: process.env.DATABASE_URL.includes("-pooler"),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 },
    );
  }
}
