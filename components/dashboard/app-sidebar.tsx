"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  BookOpenIcon,
  BriefcaseIcon,
  CalendarIcon,
  ChartColumnIcon,
  ClipboardListIcon,
  DatabaseBackupIcon,
  HandshakeIcon,
  LayoutDashboardIcon,
  MailIcon,
  NewspaperIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TimerIcon,
  UserPlusIcon,
  UsersIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";

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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DASHBOARD_NAV_GROUPS,
  isDashboardNavActive,
} from "@/constants/dashboard-nav";
import { publicPath, ROUTES } from "@/constants/routes";

const NAV_ICONS: Record<string, LucideIcon> = {
  [ROUTES.dashboard]: LayoutDashboardIcon,
  [ROUTES.users]: UsersIcon,
  [ROUTES.registrations]: UserPlusIcon,
  [ROUTES.applications]: ClipboardListIcon,
  [ROUTES.portfolio]: BriefcaseIcon,
  [ROUTES.blogs]: NewspaperIcon,
  [ROUTES.cohorts]: UsersRoundIcon,
  [ROUTES.partners]: HandshakeIcon,
  [ROUTES.founderStories]: BookOpenIcon,
  [ROUTES.evidence]: ShieldCheckIcon,
  [ROUTES.impactMetrics]: ChartColumnIcon,
  [ROUTES.events]: CalendarIcon,
  [ROUTES.contactUs]: MailIcon,
  [ROUTES.analytics]: BarChart3Icon,
  [ROUTES.performance]: TimerIcon,
  [ROUTES.backup]: DatabaseBackupIcon,
  [ROUTES.settings]: SettingsIcon,
};

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  function closeMobileSidebar() {
    setOpenMobile(false);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Telecel"
              render={
                <Link href={publicPath("en")} onClick={closeMobileSidebar} />
              }
            >
              <span className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
                T
              </span>
              <span className="truncate font-heading font-medium group-data-[collapsible=icon]:hidden">
                Telecel
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {DASHBOARD_NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = NAV_ICONS[item.href];

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={
                          <Link href={item.href} onClick={closeMobileSidebar} />
                        }
                        isActive={isDashboardNavActive(pathname, item.href)}
                        tooltip={item.title}
                      >
                        {Icon ? <Icon /> : null}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
