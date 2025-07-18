"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Icon,
  IconBomb,
  IconList,
  IconInnerShadowTop,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// 🔥 Tipos para navMain e sidebarData
export type NavSubItem = {
  title: string;
  url: string;
  isActive?: boolean;
};

export type NavItem = {
  title: string;
  url: string;
  icon?: Icon;
  isActive?: boolean;
  items?: NavSubItem[];
};

export type SidebarData = {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  navMain: NavItem[];
};

// 📦 Dados do sidebar tipados
export const sidebarData: SidebarData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Posts",
      url: "/posts",
      icon: IconList,
    },
    // {
    //   title: "Models",
    //   url: "/models",
    //   icon: IconBomb,
    //   items: [
    //     { title: "Genesis", url: "/models/genesis" },
    //     { title: "Explorer", url: "/models/explorer" },
    //     { title: "Quantum", url: "/models/quantum" },
    //   ],
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Calcula isActive para itens e subitens
  const navMain = sidebarData.navMain.map((item) => {
    const subItems = item.items?.map((sub) => ({
      ...sub,
      isActive: pathname === sub.url,
    }));

    const isParentActive =
      pathname === item.url || subItems?.some((sub) => sub.isActive);

    return {
      ...item,
      isActive: isParentActive,
      items: subItems,
    };
  });

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
