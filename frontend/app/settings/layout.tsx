import SidebarLayout from "@/layouts/sidebar-layout";

export default function Settings({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout breadcrumbs={[{ title: "Settings" }]}>
      {children}
    </SidebarLayout>
  );
}
