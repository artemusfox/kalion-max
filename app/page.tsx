import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import HomeHero from "@/components/HomeHero";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return <HomeHero />;
}
