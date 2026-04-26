import AppNav from "@/components/AppNav";
import LegalFooter from "@/components/LegalFooter";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <>
      <AppNav userName={profile?.display_name} />
      <div className="container page-content">{children}</div>
      <LegalFooter />
    </>
  );
}
