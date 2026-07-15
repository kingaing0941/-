import { NextResponse } from "next/server";
import { z } from "zod";
import { getGuestUser } from "@/lib/guest";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  officeCode: z.string().min(1),
  schoolCode: z.string().min(1),
  schoolName: z.string().min(1),
});

export async function POST(request: Request) {
  let guest;
  try {
    guest = await getGuestUser();
  } catch {
    return NextResponse.json({ error: "세션이 없습니다." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: guest.id },
    data: parsed.data,
  });

  return NextResponse.json({
    officeCode: user.officeCode,
    schoolCode: user.schoolCode,
    schoolName: user.schoolName,
  });
}
