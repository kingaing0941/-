import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { GUEST_COOKIE } from "@/lib/guest-cookie";

export async function getGuestUser() {
  const jar = await cookies();
  const hdrs = await headers();
  let id = jar.get(GUEST_COOKIE)?.value ?? hdrs.get("x-guest-id");

  if (!id) {
    id = crypto.randomUUID();
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (existing) return existing;

    return await prisma.user.create({
      data: {
        id,
        name: null,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "데이터베이스 오류";
    throw new Error(
      `회원 정보를 불러오지 못했어요. DB 연결을 확인해 주세요. (${message})`,
    );
  }
}
