import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenIcon,
  BriefcaseIcon,
  ClipboardListIcon,
  HandshakeIcon,
  MailIcon,
  NewspaperIcon,
  SettingsIcon,
  UserPlusIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/data/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard | ASIP Admin",
};

const QUICK_LINKS: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Users",
    description: "Accounts and CMS roles",
    href: ROUTES.users,
    icon: UsersIcon,
  },
  {
    title: "Registrations",
    description: "Register Interest leads",
    href: ROUTES.registrations,
    icon: UserPlusIcon,
  },
  {
    title: "Applications",
    description: "Official Apply submissions",
    href: ROUTES.applications,
    icon: ClipboardListIcon,
  },
  {
    title: "Portfolio",
    description: "Startups on the public site",
    href: ROUTES.portfolio,
    icon: BriefcaseIcon,
  },
  {
    title: "Blogs",
    description: "Insights articles",
    href: ROUTES.blogs,
    icon: NewspaperIcon,
  },
  {
    title: "Partners",
    description: "Partners and mentors",
    href: ROUTES.partners,
    icon: HandshakeIcon,
  },
  {
    title: "Founder stories",
    description: "Narrative modules",
    href: ROUTES.founderStories,
    icon: BookOpenIcon,
  },
  {
    title: "Contact us",
    description: "Public contact messages",
    href: ROUTES.contactUs,
    icon: MailIcon,
  },
  {
    title: "Settings",
    description: "Site-wide switches",
    href: ROUTES.settings,
    icon: SettingsIcon,
  },
];

export default async function DashboardPage() {
  await requireAdmin();

  return (
    <AdminListPageShell
      title="Dashboard"
      description="Jump into a CMS section. Analytics and Backup live under System in the sidebar."
    >
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-auto min-h-11 w-full items-start justify-start gap-3 px-4 py-4 whitespace-normal",
                )}
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </AdminListPageShell>
  );
}
