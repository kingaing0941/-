import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MealBoard } from "@/components/meal-board";
import { getGuestUser } from "@/lib/guest";
import { routes } from "@/lib/routes";
import { hasNickname } from "@/lib/user";

export default async function TodayPage() {
  const user = await getGuestUser();
  if (!hasNickname(user.name)) redirect(routes.start);
  if (!user.schoolCode) redirect(routes.schools);

  return (
    <AppShell schoolName={user.schoolName} level={user.level}>
      <MealBoard />
    </AppShell>
  );
}
