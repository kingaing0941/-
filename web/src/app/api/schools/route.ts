import { NextResponse } from "next/server";
import { searchSchools } from "@/lib/neis";
import { getGuestUser } from "@/lib/guest";

export async function GET(request: Request) {
  try {
    await getGuestUser();
  } catch {
    return NextResponse.json({ error: "세션이 없습니다." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  try {
    const schools = await searchSchools(q);
    return NextResponse.json({ schools });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "학교 검색에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
