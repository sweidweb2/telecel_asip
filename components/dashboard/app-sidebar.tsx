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
  CircleAlertIcon,
  ClipboardListIcon,
  DatabaseBackupIcon,
  HandshakeIcon,
  LayoutDashboardIcon,
  MailIcon,
  MailsIcon,
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
  useSidebarMobile,
} from "@/components/ui/sidebar";
import {
  hasUnreflectedAdminPublicSurfaces,
  type AdminPublicReflectionId,
} from "@/constants/admin-public-reflections";
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
  [ROUTES.settings]: SettingsIcon,
  [ROUTES.adminSettings]: SettingsIcon,
};

/** Nav href → public-reflection guide (only CMS resources with a guide). */
const NAV_PUBLIC_REFLECTION_IDS: Partial<
  Record<string, AdminPublicReflectionId>
> = {
  [ROUTES.portfolio]: "portfolio",
  [ROUTES.partners]: "partners",
  [ROUTES.blogs]: "blogs",
  [ROUTES.founderStories]: "founderStories",
  [ROUTES.cohorts]: "cohorts",
  [ROUTES.events]: "events",
  [ROUTES.evidence]: "evidence",
  [ROUTES.impactMetrics]: "impactMetrics",
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
              className="justify-start group-data-[collapsible=icon]:justify-center"
              render={
                <Link href={homeHref} onClick={closeMobileSidebar} />
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
          <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
            <p className="truncate px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {brandLabel}
            </p>
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
                  const reflectionId = NAV_PUBLIC_REFLECTION_IDS[item.href];
                  const hasUnreflected = reflectionId
                    ? hasUnreflectedAdminPublicSurfaces(reflectionId)
                    : false;
                  const expectsCount =
                    Boolean(countsPromise) && isDashboardNavCountHref(item.href);
                  const resolvedCount = counts[item.href];
                  const hasResolvedCount = typeof resolvedCount === "number";
                  const showBadge =
                    hasResolvedCount || hasUnreflected || expectsCount;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={
                          <Link href={item.href} onClick={closeMobileSidebar} />
                        }
                        isActive={isNavActive(pathname, item.href, homeHref)}
                        tooltip={item.title}
                        className={
                          showBadge
                            ? (hasResolvedCount || expectsCount) &&
                              hasUnreflected
                              ? "pr-14"
                              : "pr-8"
                            : undefined
                        }
                      >
                        {Icon ? <Icon /> : null}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      {showBadge ? (
                        countsPromise && expectsCount ? (
                          <Suspense
                            fallback={
                              hasUnreflected ? (
                                <NavItemBadge
                                  count={undefined}
                                  hasUnreflected
                                />
                              ) : null
                            }
                          >
                            <NavItemBadgeFromPromise
                              href={item.href}
                              countsPromise={countsPromise}
                              hasUnreflected={hasUnreflected}
                            />
                          </Suspense>
                        ) : (
                          <NavItemBadge
                            count={
                              hasResolvedCount ? resolvedCount : undefined
                            }
                            hasUnreflected={hasUnreflected}
                          />
                        )
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
  hasUnreflected,
}: {
  href: string;
  countsPromise: Promise<DashboardNavCounts>;
  hasUnreflected: boolean;
}) {
  const counts = use(countsPromise);
  const count = counts[href];
  const hasCount = typeof count === "number";
  if (!hasCount && !hasUnreflected) return null;
  return (
    <NavItemBadge
      count={hasCount ? count : undefined}
      hasUnreflected={hasUnreflected}
    />
  );
}

function NavItemBadge({
  count,
  hasUnreflected,
}: {
  count: number | undefined;
  hasUnreflected: boolean;
}) {
  const hasCount = typeof count === "number";
  if (!hasCount && !hasUnreflected) return null;

  return (
    <SidebarMenuBadge
      className="gap-1 bg-transparent p-0"
      aria-label={
        [
          hasCount ? `${count} records` : null,
          hasUnreflected ? "some public surfaces are not reflected" : null,
        ]
          .filter(Boolean)
          .join("; ")
      }
    >
      {hasUnreflected ? (
        <span
          className="flex size-5 items-center justify-center rounded-full bg-destructive/15 text-destructive"
          aria-hidden
        >
          <CircleAlertIcon className="size-3" />
        </span>
      ) : null}
      {hasCount ? (
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-accent px-1 text-xs leading-none",
          )}
        >
          {formatNavCount(count)}
        </span>
      ) : null}
    </SidebarMenuBadge>
  );
}
