import { NextResponse } from "next/server";
import { fetchMeals } from "@/lib/neis";
import { prisma } from "@/lib/prisma";
import { todayYmd, toYmd } from "@/lib/dates";
import { getGuestUser } from "@/lib/guest";

export async function GET(request: Request) {
  let user;
  try {
    user = await getGuestUser();
  } catch {
    return NextResponse.json({ error: "세션이 없습니다." }, { status: 400 });
  }

  if (!user.officeCode || !user.schoolCode) {
    return NextResponse.json(
      { error: "학교를 먼저 선택해 주세요." },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(request.url);
  const date = toYmd(searchParams.get("date") ?? todayYmd());

  try {
    const meals = await fetchMeals({
      officeCode: user.officeCode,
      schoolCode: user.schoolCode,
      date,
    });

    const review = await prisma.review.findUnique({
      where: {
        userId_schoolCode_mealDate: {
          userId: user.id,
          schoolCode: user.schoolCode,
          mealDate: date,
        },
      },
    });

    return NextResponse.json({
      date,
      schoolName: user.schoolName,
      meals,
      review,
      user: { xp: user.xp, level: user.level },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "급식 조회에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
