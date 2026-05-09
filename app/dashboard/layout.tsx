import AppNav from "@/components/AppNav";
import LegalFooter from "@/components/LegalFooter";
import PresenceHeartbeat from "@/components/PresenceHeartbeat";
import GeoCapture from "@/components/GeoCapture";
import PageTransition from "@/components/PageTransition";
import OnboardingTour from "@/components/OnboardingTour";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_admin, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <>
      <PresenceHeartbeat />
      <GeoCapture />
      <AppNav userName={profile?.display_name} isAdmin={profile?.is_admin} avatarUrl={profile?.avatar_url} />
      <div className="container page-content">
        <PageTransition>{children}</PageTransition>
      </div>
      <LegalFooter />
      <OnboardingTour />
    </>
  );
}
