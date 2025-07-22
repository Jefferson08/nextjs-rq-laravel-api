"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { QueryProvider } from "@/components/providers/query-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import * as React from "react";

interface SidebarLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: { title: string; href?: string }[];
}

export default function SidebarLayout({
  children,
  breadcrumbs = [],
}: SidebarLayoutProps) {
  return (
    <NuqsAdapter>
      <QueryProvider>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar />

          <SidebarInset>
            {/* Header com Breadcrumbs */}
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                {breadcrumbs.length > 0 && (
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                          <BreadcrumbItem className="hidden md:block">
                            {crumb.href ? (
                              <BreadcrumbLink href={crumb.href}>
                                {crumb.title}
                              </BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                          {index < breadcrumbs.length - 1 && (
                            <BreadcrumbSeparator className="hidden md:block" />
                          )}
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                )}
              </div>
            </header>

            {/* Conteúdo principal */}
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </QueryProvider>
    </NuqsAdapter>
  );
}
