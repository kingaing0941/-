import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GUEST_COOKIE } from "@/lib/guest-cookie";

export async function POST() {
  const jar = await cookies();
  jar.delete(GUEST_COOKIE);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(GUEST_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
