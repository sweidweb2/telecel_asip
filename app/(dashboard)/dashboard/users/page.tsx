import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  CalendarDaysIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";

import { CreateUserDialog } from "@/components/users/user-dialogs";
import { UsersFilters } from "@/components/users/users-filters";
import { UsersPagination } from "@/components/users/users-pagination";
import { UsersTable } from "@/components/users/users-table";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { isCurrentUserAdmin } from "@/data/auth";
import { getUsers, getUserStats } from "@/data/users";
import { parseUserListQuery } from "@/validations/users";

export const metadata: Metadata = {
  title: "Users | ASIP Admin",
};

type UsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) redirect(ROUTES.dashboard);

  const query = parseUserListQuery(await searchParams);
  const [list, stats] = await Promise.all([getUsers(query), getUserStats()]);

  if (query.page > list.totalPages) {
    const params = new URLSearchParams({
      page: String(list.totalPages),
      pageSize: String(query.pageSize),
    });
    if (query.search) params.set("search", query.search);
    if (query.role !== "all") params.set("role", query.role);
    redirect(`${ROUTES.users}?${params.toString()}`);
  }

  const statCards = [
    {
      label: "Total users",
      value: stats.total,
      detail: `${stats.editors} editors · ${stats.viewers} viewers`,
      icon: UsersIcon,
    },
    {
      label: "Administrators",
      value: stats.admins,
      detail: "Full user management access",
      icon: ShieldCheckIcon,
    },
    {
      label: "New this week",
      value: stats.newThisWeek,
      detail: "Since Monday",
      icon: UserPlusIcon,
    },
    {
      label: "New this month",
      value: stats.newThisMonth,
      detail: "Created profiles",
      icon: CalendarDaysIcon,
    },
  ];

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Users
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create accounts and manage profile access across the CMS.
          </p>
        </div>
        <CreateUserDialog />
      </div>

      <section
        aria-label="User statistics"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {statCards.map(({ label, value, detail, icon: Icon }) => (
          <Card key={label} size="sm">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {label}
              </CardTitle>
              <CardAction>
                <Icon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <UsersFilters query={query} />
      <UsersTable users={list.users} total={list.total} />
      <UsersPagination query={query} totalPages={list.totalPages} />
    </main>
  );
}
