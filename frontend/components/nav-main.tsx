"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type NavSubItem = {
  title: string;
  url: string;
};

type NavMainItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean; // opcional se calcularmos automaticamente
  items?: NavSubItem[];
};

export function NavMain({ items }: { items: NavMainItem[] }) {
  const pathname = usePathname();

  // Marca ativos dinamicamente
  const navItems = items.map((item) => {
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
    <SidebarGroup>
      <SidebarGroupLabel>Management</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={item.isActive ? "bg-muted" : ""}
                  asChild
                >
                  {item.items ? (
                    // Item pai com subitens (não clicável)
                    <div className="flex items-center w-full">
                      {item.icon && <item.icon className="mr-2" />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </div>
                  ) : (
                    // Item pai sem subitens (clicável)
                    <Link href={item.url} className="flex items-center w-full">
                      {item.icon && <item.icon className="mr-2" />}
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>

              {item.items && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={subItem.isActive ? "bg-muted" : ""}
                        >
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
