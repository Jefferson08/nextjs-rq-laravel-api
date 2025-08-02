"use client";

import SidebarLayout from "@/layouts/sidebar-layout";
import { AuthGuard } from "@/components/auth-guard";

interface ProtectedPageWrapperProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function ProtectedPageWrapper({
  children,
  defaultOpen = false,
}: ProtectedPageWrapperProps) {
  return (
    <AuthGuard>
      <SidebarLayout defaultOpen={defaultOpen}>{children}</SidebarLayout>
    </AuthGuard>
  );
}
