"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useTransition, type FormEvent } from "react";
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { UserListQuery } from "@/validations/users";

export function UsersFilters({ query }: { query: UserListQuery }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const hasFilters = query.search !== "" || query.role !== "all";

  function navigate(changes: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (!value || (key === "role" && value === "all")) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    next.set("page", "1");

    startTransition(() => {
      router.push(`${ROUTES.users}?${next.toString()}`);
    });
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    navigate({ search: String(formData.get("search") ?? "").trim() });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 lg:flex-row lg:items-end">
      <form
        className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={handleSearch}
      >
        <div className="grid min-w-0 flex-1 gap-2">
          <Label htmlFor="users-search">Search users</Label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="users-search"
              name="search"
              type="search"
              defaultValue={query.search}
              placeholder="Name or email"
              maxLength={100}
              className="min-h-11 pl-9 sm:min-h-8"
              disabled={isPending}
            />
          </div>
        </div>
        <Button
          type="submit"
          variant="outline"
          className="min-h-11 sm:min-h-8"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <SearchIcon />
          )}
          Search
        </Button>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
        <div className="grid gap-2">
          <Label htmlFor="users-role">Role</Label>
          <Select
            value={query.role}
            onValueChange={(value) => navigate({ role: value })}
            disabled={isPending}
          >
            <SelectTrigger
              id="users-role"
              className="min-h-11 w-full sm:min-h-8 sm:w-32"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="users-page-size">Rows</Label>
          <Select
            value={String(query.pageSize)}
            onValueChange={(value) => navigate({ pageSize: value })}
            disabled={isPending}
          >
            <SelectTrigger
              id="users-page-size"
              className="min-h-11 w-full sm:min-h-8 sm:w-24"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters ? (
        <Button variant="ghost" className="min-h-11 sm:min-h-8" asChild>
          <Link
            href={`${ROUTES.users}?pageSize=${query.pageSize}`}
            aria-disabled={isPending}
            className={cn(isPending && "pointer-events-none opacity-50")}
          >
            <XIcon />
            Clear
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
