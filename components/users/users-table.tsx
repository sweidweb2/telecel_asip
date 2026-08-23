import { format } from "date-fns";
import { UserRoundSearchIcon } from "lucide-react";

import { UserRowActions } from "@/components/users/user-dialogs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Profile } from "@/types/profile";

const ROLE_VARIANT = {
  admin: "default",
  editor: "secondary",
  viewer: "outline",
} as const;

export function UsersTable({
  users,
  total,
}: {
  users: Profile[];
  total: number;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="border-b">
        <CardTitle>
          {total} {total === 1 ? "user" : "users"}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Full name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-56 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-2 whitespace-normal">
                    <span className="flex size-11 items-center justify-center rounded-full bg-muted">
                      <UserRoundSearchIcon className="size-5 text-muted-foreground" />
                    </span>
                    <p className="font-medium">No users found</p>
                    <p className="text-sm text-muted-foreground">
                      Try changing the search or role filter, or create a new
                      user.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="max-w-56 truncate pl-4 font-medium">
                    {user.full_name || "—"}
                  </TableCell>
                  <TableCell className="max-w-64 truncate">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ROLE_VARIANT[user.role]}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.updated_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="pr-4">
                    <UserRowActions user={user} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
