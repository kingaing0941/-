import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { GUEST_COOKIE } from "@/lib/guest-cookie";

export async function getGuestUser() {
  const jar = await cookies();
  const hdrs = await headers();
  const id = jar.get(GUEST_COOKIE)?.value ?? hdrs.get("x-guest-id");

  if (!id) {
    throw new Error("게스트 세션이 없습니다. 페이지를 새로고침해 주세요.");
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      id,
      name: null,
    },
  });
}
