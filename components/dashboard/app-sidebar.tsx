"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, use } from "react";
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
  MailsIcon,
  MapPinnedIcon,
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
  useSidebarLayout,
  useSidebarMobile,
} from "@/components/ui/sidebar";
import {
  DASHBOARD_NAV_GROUPS,
  isDashboardNavActive,
  type DashboardNavGroup,
} from "@/constants/dashboard-nav";
import {
  isDashboardNavCountHref,
  type DashboardNavCounts,
} from "@/constants/dashboard-nav-counts";
import { isAdminNavActive } from "@/constants/admin-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  [ROUTES.dashboard]: LayoutDashboardIcon,
  [ROUTES.users]: UsersIcon,
  [ROUTES.adminUsers]: UsersIcon,
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
  [ROUTES.newsletter]: MailsIcon,
  [ROUTES.analytics]: BarChart3Icon,
  [ROUTES.adminPerformance]: TimerIcon,
  [ROUTES.adminBackup]: DatabaseBackupIcon,
  [ROUTES.adminCatalog]: MapPinnedIcon,
  [ROUTES.settings]: SettingsIcon,
  [ROUTES.adminSettings]: SettingsIcon,
};

function formatNavCount(count: number) {
  if (count > 999) return "999+";
  return String(count);
}

function isNavActive(pathname: string, href: string, homeHref: string) {
  if (homeHref.startsWith(ROUTES.admin)) {
    return isAdminNavActive(pathname, href);
  }
  return isDashboardNavActive(pathname, href);
}

export function AppSidebar({
  counts = {},
  countsPromise,
  homeHref = ROUTES.dashboard,
  brandLabel = "Editor panel",
  navGroups = DASHBOARD_NAV_GROUPS,
}: {
  counts?: DashboardNavCounts;
  countsPromise?: Promise<DashboardNavCounts>;
  homeHref?: string;
  brandLabel?: string;
  navGroups?: readonly DashboardNavGroup[];
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebarMobile();
  const { state, isMobile } = useSidebarLayout();
  const showWordmark = isMobile || state === "expanded";

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
              tooltip={brandLabel}
              className="justify-start hover:bg-transparent active:bg-transparent group-data-[collapsible=icon]:justify-center"
              render={
                <Link href={homeHref} onClick={closeMobileSidebar} />
              }
            >
              {showWordmark ? (
                <Image
                  src="/asip-logo-sidebar.webp"
                  alt="Africa Startup Initiative Program"
                  width={320}
                  height={107}
                  priority
                  quality={90}
                  sizes="168px"
                  className="h-9 w-auto max-w-[10.5rem] object-contain object-left"
                />
              ) : (
                <Image
                  src="/asip-icon-sidebar.webp"
                  alt="ASIP"
                  width={64}
                  height={64}
                  priority
                  quality={90}
                  sizes="32px"
                  className="size-8 object-contain"
                />
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = NAV_ICONS[item.href];
                  const expectsCount =
                    Boolean(countsPromise) && isDashboardNavCountHref(item.href);
                  const resolvedCount = counts[item.href];
                  const hasResolvedCount = typeof resolvedCount === "number";
                  const showBadge = hasResolvedCount || expectsCount;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={
                          <Link href={item.href} onClick={closeMobileSidebar} />
                        }
                        isActive={isNavActive(pathname, item.href, homeHref)}
                        tooltip={item.title}
                        className={showBadge ? "pr-8" : undefined}
                      >
                        {Icon ? <Icon /> : null}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      {showBadge ? (
                        countsPromise && expectsCount ? (
                          <Suspense fallback={null}>
                            <NavItemBadgeFromPromise
                              href={item.href}
                              countsPromise={countsPromise}
                            />
                          </Suspense>
                        ) : hasResolvedCount ? (
                          <NavItemBadge count={resolvedCount} />
                        ) : null
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

function NavItemBadgeFromPromise({
  href,
  countsPromise,
}: {
  href: string;
  countsPromise: Promise<DashboardNavCounts>;
}) {
  const counts = use(countsPromise);
  const count = counts[href];
  if (typeof count !== "number") return null;
  return <NavItemBadge count={count} />;
}

function NavItemBadge({ count }: { count: number }) {
  return (
    <SidebarMenuBadge
      className="gap-1 bg-transparent p-0"
      aria-label={`${count} records`}
    >
      <span
        className={cn(
          "flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-accent px-1 text-xs leading-none",
        )}
      >
        {formatNavCount(count)}
      </span>
    </SidebarMenuBadge>
  );
}
