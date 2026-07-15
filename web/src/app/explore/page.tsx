import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ExploreBoard } from "@/components/explore-board";
import { getGuestUser } from "@/lib/guest";
import { routes } from "@/lib/routes";
import { hasNickname } from "@/lib/user";

export default async function ExplorePage() {
  const user = await getGuestUser();
  if (!hasNickname(user.name)) redirect(routes.start);

  return (
    <AppShell schoolName={user.schoolName} level={user.level}>
      <ExploreBoard />
    </AppShell>
  );
}
