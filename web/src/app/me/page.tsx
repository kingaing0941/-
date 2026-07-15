import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProfilePanel } from "@/components/profile-panel";
import { getGuestUser } from "@/lib/guest";
import { routes } from "@/lib/routes";
import { hasNickname } from "@/lib/user";

export default async function MePage() {
  const user = await getGuestUser();
  if (!hasNickname(user.name)) redirect(routes.start);

  return (
    <AppShell schoolName={user.schoolName} level={user.level}>
      <ProfilePanel />
    </AppShell>
  );
}
