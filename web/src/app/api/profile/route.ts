import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { xpProgress } from "@/lib/xp";
import { getGuestUser } from "@/lib/guest";
import { hasNickname } from "@/lib/user";

const updateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "닉네임은 2자 이상이어야 해요.")
    .max(12, "닉네임은 12자까지 가능해요.")
    .regex(/^[가-힣a-zA-Z0-9_]+$/, "한글, 영문, 숫자, _ 만 사용할 수 있어요."),
});

export async function GET() {
  let user;
  try {
    user = await getGuestUser();
  } catch {
    return NextResponse.json({ error: "세션이 없습니다." }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    orderBy: { mealDate: "desc" },
  });

  const averageRating =
    reviews.length === 0
      ? 0
      : Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10,
        ) / 10;

  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const monthlyMap = new Map<string, { sum: number; count: number }>();
  for (const review of reviews) {
    const key = review.mealDate.slice(0, 7);
    const prev = monthlyMap.get(key) ?? { sum: 0, count: 0 };
    monthlyMap.set(key, {
      sum: prev.sum + review.rating,
      count: prev.count + 1,
    });
  }

  const monthlyAverage = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, { sum, count }]) => ({
      month,
      average: Math.round((sum / count) * 10) / 10,
      count,
    }));

  return NextResponse.json({
    user: {
      name: user.name,
      image: user.image,
      schoolName: user.schoolName,
      xp: user.xp,
      level: user.level,
      hasNickname: hasNickname(user.name),
      progress: xpProgress(user.xp, user.level),
    },
    stats: {
      reviewCount: reviews.length,
      averageRating,
      ratingDistribution,
      monthlyAverage,
    },
    reviews,
  });
}

export async function PATCH(request: Request) {
  let user;
  try {
    user = await getGuestUser();
  } catch {
    return NextResponse.json({ error: "세션이 없습니다." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "닉네임을 확인해 주세요." },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name },
  });

  return NextResponse.json({
    user: {
      name: updated.name,
      schoolName: updated.schoolName,
      hasNickname: hasNickname(updated.name),
    },
  });
}
