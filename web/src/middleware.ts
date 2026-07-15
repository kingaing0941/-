import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GUEST_COOKIE } from "@/lib/guest-cookie";

export function middleware(request: NextRequest) {
  const existing = request.cookies.get(GUEST_COOKIE)?.value;
  const guestId = existing ?? crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-guest-id", guestId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (!existing) {
    response.cookies.set(GUEST_COOKIE, guestId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
