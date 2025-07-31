// app/(protected)/layout.tsx
"use client";

import SidebarLayout from "@/layouts/sidebar-layout";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  posts: "Posts",
  settings: "Configurações",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Quebra a URL em segmentos, ex.: "/posts/123" → ["posts", "123"]
  const segments = pathname.split("/").filter(Boolean);

  // Gera breadcrumbs automaticamente
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");

    return {
      title: titles[segment] ?? segment, // Pega do map ou usa o nome cru
      href: index < segments.length - 1 ? href : undefined, // Último não tem link
    };
  });

  return <SidebarLayout breadcrumbs={breadcrumbs}>{children}</SidebarLayout>;
}
