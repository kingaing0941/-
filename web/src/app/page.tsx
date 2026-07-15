import { redirect } from "next/navigation";
import { getGuestUser } from "@/lib/guest";
import { routes } from "@/lib/routes";
import { hasNickname } from "@/lib/user";

export default async function HomePage() {
  const user = await getGuestUser();

  if (!hasNickname(user.name)) {
    redirect(routes.start);
  }
  if (user.schoolCode) {
    redirect(routes.today);
  }
  redirect(routes.schools);
}
