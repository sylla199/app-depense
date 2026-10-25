import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import { SideNav } from "@/components/nav/SideNav";
import { TabBar } from "@/components/nav/TabBar";

// L'espace client est en noindex (section "Référencement et partage" du handoff).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/connexion");

  return (
    <div className="flex min-h-full">
      <SideNav />
      <main
        id="contenu"
        className="mx-auto w-full max-w-[1120px] px-4 sm:px-8 lg:px-6 py-6 pb-24 lg:pb-6"
      >
        {children}
      </main>
      <TabBar />
    </div>
  );
}
