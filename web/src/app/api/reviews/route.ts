import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { REVIEW_XP, levelFromXp } from "@/lib/xp";
import { toYmd } from "@/lib/dates";
import { getGuestUser } from "@/lib/guest";

const bodySchema = z.object({
  mealDate: z.string().min(8),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(200),
  isPublic: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  let user;
  try {
    user = await getGuestUser();
  } catch {
    return NextResponse.json({ error: "세션이 없습니다." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "별점과 한줄평을 확인해 주세요." },
      { status: 400 },
    );
  }

  if (!user.officeCode || !user.schoolCode || !user.schoolName) {
    return NextResponse.json(
      { error: "학교를 먼저 선택해 주세요." },
      { status: 400 },
    );
  }

  const mealDate = toYmd(parsed.data.mealDate);

  const existing = await prisma.review.findUnique({
    where: {
      userId_schoolCode_mealDate: {
        userId: user.id,
        schoolCode: user.schoolCode,
        mealDate,
      },
    },
  });

  if (existing) {
    const review = await prisma.review.update({
      where: { id: existing.id },
      data: {
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        isPublic: parsed.data.isPublic,
      },
    });

    return NextResponse.json({
      review,
      xpGained: 0,
      leveledUp: false,
      user: { xp: user.xp, level: user.level },
    });
  }

  const newXp = user.xp + REVIEW_XP;
  const newLevel = levelFromXp(newXp);
  const leveledUp = newLevel > user.level;

  const [review, updatedUser] = await prisma.$transaction([
    prisma.review.create({
      data: {
        userId: user.id,
        officeCode: user.officeCode,
        schoolCode: user.schoolCode,
        schoolName: user.schoolName,
        mealDate,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        isPublic: parsed.data.isPublic,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { xp: newXp, level: newLevel },
    }),
  ]);

  return NextResponse.json({
    review,
    xpGained: REVIEW_XP,
    leveledUp,
    user: { xp: updatedUser.xp, level: updatedUser.level },
  });
}
