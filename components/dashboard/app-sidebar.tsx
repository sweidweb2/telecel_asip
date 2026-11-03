"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, use } from "react";
import { usePathname } from "next/navigation";

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
  type DashboardNavGroup,
} from "@/constants/dashboard-nav";
import {
  isDashboardNavCountHref,
  type DashboardNavCounts,
} from "@/constants/dashboard-nav-counts";
import { ROUTES } from "@/constants/routes";
import { isStaffNavActive } from "@/constants/staff-nav";
import { cn } from "@/lib/utils";

function formatNavCount(count: number) {
  if (count > 999) return "999+";
  return String(count);
}

export function AppSidebar({
  countsPromise,
  homeHref = ROUTES.dashboard,
  brandLabel = "Editor panel",
  navGroups = DASHBOARD_NAV_GROUPS,
}: {
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
                  src="/ASIP_LOGO_MARK_WHITE.png"
                  alt="Africa Startup Initiative, a Telecel Group Program"
                  width={768}
                  height={768}
                  priority
                  quality={90}
                  sizes="56px"
                  className="h-12 w-auto object-contain object-left"
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
                  const Icon = item.icon;
                  const expectsCount =
                    Boolean(countsPromise) && isDashboardNavCountHref(item.href);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={
                          <Link href={item.href} onClick={closeMobileSidebar} />
                        }
                        isActive={isStaffNavActive(
                          pathname,
                          item.href,
                          homeHref,
                        )}
                        tooltip={item.title}
                        className={expectsCount ? "pr-8" : undefined}
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      {expectsCount && countsPromise ? (
                        <Suspense fallback={null}>
                          <NavItemBadgeFromPromise
                            href={item.href}
                            countsPromise={countsPromise}
                          />
                        </Suspense>
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
