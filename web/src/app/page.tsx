import Link from "next/link";
import { getGuestUser } from "@/lib/guest";
import { APP_NAME } from "@/lib/brand";
import { routes } from "@/lib/routes";
import { hasNickname } from "@/lib/user";

export default async function HomePage() {
  let nextPath: string = routes.start;
  try {
    const user = await getGuestUser();
    if (hasNickname(user.name)) {
      nextPath = user.schoolCode ? routes.today : routes.schools;
    }
  } catch {
    nextPath = routes.start;
  }

  return (
    <div className="landing">
      <section className="landing-card landing-card-compact">
        <h1 className="landing-brand">{APP_NAME}</h1>
        <Link href={nextPath} className="google-btn">
          시작하기
        </Link>
      </section>
    </div>
  );
}
