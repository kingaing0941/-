import { redirect } from "next/navigation";
import { NicknameForm } from "@/components/nickname-form";
import { getGuestUser } from "@/lib/guest";
import { routes } from "@/lib/routes";
import { hasNickname } from "@/lib/user";

export default async function StartPage() {
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
}
