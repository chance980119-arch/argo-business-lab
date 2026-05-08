"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Users, LayoutDashboard, Package, FileText, Settings, GraduationCap, Lightbulb } from "lucide-react";

// 메뉴 항목 - 여기에 새 메뉴 추가하면 됨
const menuItems = [
  {
    title: "CRM",
    icon: Users,
    href: "/crm",
    description: "고객(셀러) 관리",
  },
  {
    title: "교육",
    icon: GraduationCap,
    href: "/training",
    description: "교육 현황 및 출석체크",
  },
  {
    title: "아이디어",
    icon: Lightbulb,
    href: "/ideas",
    description: "팀별 아이디어 제출",
  },
  // 새 메뉴 추가 예시:
  // {
  //   title: "재고 관리",
  //   icon: Package,
  //   href: "/inventory",
  //   description: "상품 재고 관리",
  // },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            A
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Argo Business Lab</span>
            <span className="text-xs text-muted-foreground">업무 도구 모음</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={<Link href={item.href} />}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          새 기능이 필요하면
          <br />
          Claude에게 요청하세요!
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
