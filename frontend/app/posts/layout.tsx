import SidebarLayout from "@/layouts/sidebar-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout breadcrumbs={[{ title: "Posts" }]}>{children}</SidebarLayout>
  );
}
