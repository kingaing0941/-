import { NextResponse } from "next/server";
import { getGuestUser } from "@/lib/guest";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    await getGuestUser();
  } catch {
    return NextResponse.json({ error: "세션이 없습니다." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const schoolCode = searchParams.get("schoolCode")?.trim() ?? "";

  if (!q && !schoolCode) {
    return NextResponse.json({ reviews: [], schools: [] });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: {
        isPublic: true,
        AND: [
          schoolCode ? { schoolCode } : {},
          q
            ? {
                OR: [
                  { schoolName: { contains: q } },
                  { comment: { contains: q } },
                  { user: { name: { contains: q } } },
                ],
              }
            : {},
        ],
      },
      orderBy: { mealDate: "desc" },
      take: 40,
      include: {
        user: { select: { name: true, level: true } },
      },
    });

    const schoolStatsRaw =
      q.length >= 2
        ? await prisma.review.groupBy({
            by: ["schoolCode", "schoolName"],
            where: {
              isPublic: true,
              schoolName: { contains: q },
            },
            _avg: { rating: true },
            _count: { _all: true },
          })
        : [];

    const schoolStats = schoolStatsRaw
      .sort((a, b) => b._count._all - a._count._all)
      .slice(0, 10);

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        schoolName: r.schoolName,
        schoolCode: r.schoolCode,
        mealDate: r.mealDate,
        rating: r.rating,
        comment: r.comment,
        authorName: r.user.name ?? "익명",
        authorLevel: r.user.level,
      })),
      schools: schoolStats.map((row) => ({
        schoolCode: row.schoolCode,
        schoolName: row.schoolName,
        averageRating:
          row._avg.rating == null
            ? null
            : Math.round(row._avg.rating * 10) / 10,
        reviewCount: row._count._all,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "리뷰 검색에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
