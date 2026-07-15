import { NextResponse } from "next/server";
import { z } from "zod";
import { getGuestUser } from "@/lib/guest";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(200),
  isPublic: z.boolean(),
});

async function getOwnedReview(id: string) {
  const user = await getGuestUser();
  const review = await prisma.review.findFirst({
    where: { id, userId: user.id },
  });
  return { user, review };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  let owned;
  try {
    owned = await getOwnedReview(id);
  } catch {
    return NextResponse.json({ error: "세션이 없습니다." }, { status: 400 });
  }

  if (!owned.review) {
    return NextResponse.json({ error: "리뷰를 찾을 수 없습니다." }, { status: 404 });
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "별점과 한줄평을 확인해 주세요." },
      { status: 400 },
    );
  }

  const review = await prisma.review.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ review });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  let owned;
  try {
    owned = await getOwnedReview(id);
  } catch {
    return NextResponse.json({ error: "세션이 없습니다." }, { status: 400 });
  }

  if (!owned.review) {
    return NextResponse.json({ error: "리뷰를 찾을 수 없습니다." }, { status: 404 });
  }

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
