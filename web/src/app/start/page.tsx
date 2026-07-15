import { NicknameForm } from "@/components/nickname-form";
import { getGuestUser } from "@/lib/guest";
import { routes } from "@/lib/routes";
import { hasNickname } from "@/lib/user";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StartPage() {
  try {
    const user = await getGuestUser();

    if (hasNickname(user.name)) {
      if (user.schoolCode) redirect(routes.today);
      redirect(routes.schools);
    }

    return (
      <div className="landing">
        <NicknameForm
          mode="welcome"
          nextPath={user.schoolCode ? routes.today : routes.schools}
        />
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했어요.";

    return (
      <div className="landing">
        <section className="landing-card">
          <h1 className="page-title">시작에 실패했어요</h1>
          <p className="page-lead">{message}</p>
          <p className="muted">
            Vercel의 DATABASE_URL이 Neon pooled 주소인지 확인해 주세요.
          </p>
          <Link href={routes.home} className="google-btn">
            처음으로
          </Link>
        </section>
      </div>
    );
  }
}
