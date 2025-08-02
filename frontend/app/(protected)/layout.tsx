// app/(protected)/layout.tsx
import { ProtectedPageWrapper } from "@/components/protected-page-wrapper";
import { cookies } from "next/headers";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lê o cookie para recuperar o estado inicial da sidebar
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <ProtectedPageWrapper defaultOpen={defaultOpen}>
      {children}
    </ProtectedPageWrapper>
  );
}
