"use client";

import Image from "next/image";
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DASHBOARD_NAV_GROUPS,
  isDashboardNavActive,
} from "@/constants/dashboard-nav";
import { ROUTES } from "@/constants/routes";

type DashboardNavCounts = Partial<Record<string, number>>;

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

function formatNavCount(count: number) {
  if (count > 999) return "999+";
  return String(count);
}

export function AppSidebar({
  counts = {},
}: {
  counts?: DashboardNavCounts;
}) {
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
              tooltip="ASIP"
              className="justify-start group-data-[collapsible=icon]:justify-center"
              render={
                <Link href={ROUTES.dashboard} onClick={closeMobileSidebar} />
              }
            >
              <Image
                src="/ASIP_LOGO.png"
                alt="Africa Startup Initiative Program"
                width={864}
                height={289}
                priority
                sizes="160px"
                className="h-8 w-auto max-w-[10rem] object-contain object-left group-data-[collapsible=icon]:hidden"
              />
              <Image
                src="/icon.png"
                alt="ASIP"
                width={64}
                height={64}
                priority
                sizes="32px"
                className="hidden size-7 rounded-full object-cover group-data-[collapsible=icon]:block"
              />
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
                  const count = counts[item.href];

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={
                          <Link href={item.href} onClick={closeMobileSidebar} />
                        }
                        isActive={isDashboardNavActive(pathname, item.href)}
                        tooltip={item.title}
                        className={
                          typeof count === "number" ? "pr-8" : undefined
                        }
                      >
                        {Icon ? <Icon /> : null}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      {typeof count === "number" ? (
                        <SidebarMenuBadge
                          className="rounded-full bg-sidebar-accent text-[10px] leading-none"
                          aria-label={`${count} records`}
                        >
                          {formatNavCount(count)}
                        </SidebarMenuBadge>
                      ) : null}
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
