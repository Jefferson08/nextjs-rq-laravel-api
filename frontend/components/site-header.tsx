"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { sidebarData, NavItem, NavSubItem } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";

export function SiteHeader() {
  const pathname = usePathname();

  // Divide o caminho em segmentos e remove vazios
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <ModeToggle />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <Breadcrumb>
          <BreadcrumbList>
            {segments.map((segment, index) => {
              const href = "/" + segments.slice(0, index + 1).join("/");
              const isLast = index === segments.length - 1;

              // Busca o título amigável no sidebarData
              const title =
                getTitleForPath(href, sidebarData.navMain) ||
                formatSegment(segment);

              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{title}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}

// 🔥 Tipado com NavItem e NavSubItem
function getTitleForPath(
  path: string,
  navItems: (NavItem | NavSubItem)[],
): string | null {
  for (const item of navItems) {
    if (item.url === path) return item.title;
    if ("items" in item && item.items) {
      const childTitle = getTitleForPath(path, item.items);
      if (childTitle) return childTitle;
    }
  }
  return null;
}

// Fallback: formata slug como "my-page" → "My Page"
function formatSegment(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
