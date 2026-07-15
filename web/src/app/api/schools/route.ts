import { NextResponse } from "next/server";
import { searchSchools } from "@/lib/neis";
import { getGuestUser } from "@/lib/guest";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    await getGuestUser();
  } catch {
    return NextResponse.json({ error: "세션이 없습니다." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  try {
    const schools = await searchSchools(q);
    const codes = schools.map((s) => s.schoolCode);

    const stats =
      codes.length === 0
        ? []
        : await prisma.review.groupBy({
            by: ["schoolCode"],
            where: {
              isPublic: true,
              schoolCode: { in: codes },
            },
            _avg: { rating: true },
            _count: { _all: true },
          });

    const statsMap = new Map(
      stats.map((row) => [
        row.schoolCode,
        {
          averageRating:
            row._avg.rating == null
              ? null
              : Math.round(row._avg.rating * 10) / 10,
          reviewCount: row._count._all,
        },
      ]),
    );

    return NextResponse.json({
      schools: schools.map((school) => ({
        ...school,
        averageRating: statsMap.get(school.schoolCode)?.averageRating ?? null,
        reviewCount: statsMap.get(school.schoolCode)?.reviewCount ?? 0,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "학교 검색에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
