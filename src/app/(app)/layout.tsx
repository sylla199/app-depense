import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import { SideNav } from "@/components/nav/SideNav";
import { TabBarWrap } from "@/components/nav/TabBarWrap";
import { FabProvider } from "@/components/nav/FabContext";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { InstallManager } from "@/components/pwa/InstallManager";

// L'espace client est en noindex (section "Référencement et partage" du handoff).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Coquille de l'espace client — structure fidèle au canvas de design
 * (`.app` > `.sidenav` + `.main > .content` + `.tabbar-wrap` > `.tabbar`).
 * Bureau (≥1024 px) : menu latéral. Mobile/tablette : barre d'onglets en
 * bas — bascule gérée par app-shell.css, pas de JS ni de media query ici.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/connexion");

  return (
    <FabProvider>
      <div className="app" style={{ minHeight: "100vh" }}>
        <ServiceWorkerRegister />
        <InstallManager />
        <SideNav />
        <main className="main">
          <div className="content" id="contenu">
            {children}
          </div>
        </main>
        <TabBarWrap />
      </div>
    </FabProvider>
  );
}
