"use client";

import { memo, useId, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteUser, hardDeleteUser, updateUser } from "@/actions/users";
import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
import { AdminRowActionButtons } from "@/components/dashboard/admin-row-action-buttons";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatAdminDate } from "@/lib/admin-format";
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
import type { Profile } from "@/types/profile";
import {
  assignableRolesForActor,
  defaultRoleForActor,
  updateUserSchema,
  USER_EMAIL_MAX,
  USER_FULL_NAME_MAX,
  type UpdateUserInput,
  type UserRole,
} from "@/validations/users";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

function FormFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <FieldError>{message}</FieldError>;
}

function RoleSelectField({
  id,
  value,
  onChange,
  roles,
  disabled,
  error,
}: {
  id: string;
  value: UserRole;
  onChange: (role: UserRole) => void;
  roles: readonly UserRole[];
  disabled?: boolean;
  error?: string;
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <Label htmlFor={id}>Role</Label>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next as UserRole);
        }}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full" aria-invalid={Boolean(error)}>
          <SelectValue>{ROLE_LABELS[value]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role} value={role}>
              {ROLE_LABELS[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormFieldError message={error} />
    </Field>
  );
}

export const UserRowActions = memo(function UserRowActions({
  user,
  actorRole,
  onView,
  onEdit,
  onDelete,
}: {
  user: Profile;
  actorRole: "admin" | "editor";
  onView: (user: Profile) => void;
  onEdit: (user: Profile) => void;
  onDelete: (user: Profile) => void;
}) {
  const canEditRole =
    actorRole === "admin" || user.role === "editor" || user.role === "viewer";
  const canDeleteUser = actorRole === "admin" || user.role === "viewer";

  return (
    <AdminRowActionButtons
      viewLabel={`View ${user.email}`}
      editLabel={`Edit ${user.email}`}
      deleteLabel={`Delete ${user.email}`}
      onView={() => onView(user)}
      onEdit={canEditRole ? () => onEdit(user) : undefined}
      onDelete={() => onDelete(user)}
      canDelete={canDeleteUser}
    />
  );
});

export function UserViewDialog({
  open,
  user,
  onOpenChange,
}: {
  open: boolean;
  user: Profile | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">
            {user?.full_name || "Unnamed user"}
          </DialogTitle>
          <DialogDescription>User profile details</DialogDescription>
        </DialogHeader>
        {user ? (
          <dl className="grid gap-3 text-sm">
            <div className="grid gap-1">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="break-all font-medium">{user.email}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-muted-foreground">Role</dt>
              <dd>
                <Badge variant="outline">{user.role}</Badge>
              </dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="break-all font-mono text-xs">{user.id}</dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">
                  {formatAdminDate(user.created_at)}
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="font-medium">
                  {formatAdminDate(user.updated_at)}
                </dd>
              </div>
            </div>
          </dl>
        ) : null}
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

function UserEditForm({
  user,
  actorRole,
  onClose,
}: {
  user: Profile;
  actorRole: "admin" | "editor";
  onClose: () => void;
}) {
  const editFormId = useId();
  const router = useRouter();
  const [isUpdating, startUpdate] = useTransition();
  const roles = assignableRolesForActor(actorRole);
  const canEditRole =
    actorRole === "admin" || user.role === "editor" || user.role === "viewer";
  const canEditEmail = actorRole === "admin";
  const editDefaults: UpdateUserInput = {
    id: user.id,
    fullName: user.full_name ?? "",
    email: user.email,
    role:
      canEditRole && roles.includes(user.role as UserRole)
        ? (user.role as UserRole)
        : defaultRoleForActor(actorRole),
  };
  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    mode: "onChange",
    defaultValues: editDefaults,
  });
  const { errors, isDirty } = form.formState;

  function onUpdate(values: UpdateUserInput) {
    startUpdate(async () => {
      try {
        const result = await updateUser(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        onClose();
        router.refresh();
      } catch {
        toast.error("The user could not be updated. Please try again.");
      }
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit user</DialogTitle>
        <DialogDescription>
          {canEditEmail
            ? "Update email, name, and role for this account."
            : "Update name and role for this account. Only administrators can change emails."}
        </DialogDescription>
      </DialogHeader>

      <form id={editFormId} onSubmit={form.handleSubmit(onUpdate)} noValidate>
        <input type="hidden" {...form.register("id")} />
        <FieldGroup>
          <Field data-invalid={Boolean(form.formState.errors.fullName)}>
            <AdminFormFieldLabel
              htmlFor="edit-user-name"
              hint={`2–${USER_FULL_NAME_MAX} chars`}
            >
              Full name
            </AdminFormFieldLabel>
            <Input
              id="edit-user-name"
              disabled={isUpdating}
              maxLength={USER_FULL_NAME_MAX}
              placeholder="e.g. Ama Mensah"
              aria-invalid={Boolean(form.formState.errors.fullName)}
              {...form.register("fullName")}
            />
            <FormFieldError message={form.formState.errors.fullName?.message} />
          </Field>
          <Field data-invalid={Boolean(form.formState.errors.email)}>
            <AdminFormFieldLabel
              htmlFor="edit-user-email"
              hint={canEditEmail ? `max ${USER_EMAIL_MAX}` : "admin only"}
            >
              Email
            </AdminFormFieldLabel>
            <Input
              id="edit-user-email"
              type="email"
              disabled={isUpdating}
              readOnly={!canEditEmail}
              maxLength={USER_EMAIL_MAX}
              placeholder="name@company.com"
              className={!canEditEmail ? "bg-muted" : undefined}
              aria-invalid={Boolean(form.formState.errors.email)}
              {...form.register("email")}
            />
            <FormFieldError message={form.formState.errors.email?.message} />
          </Field>
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <RoleSelectField
                id="edit-user-role"
                value={field.value}
                onChange={field.onChange}
                roles={roles}
                disabled={isUpdating}
                error={form.formState.errors.role?.message}
              />
            )}
          />
        </FieldGroup>
      </form>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isUpdating}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form={editFormId}
          disabled={isAdminFormSubmitDisabled({
            isPending: isUpdating,
            isDirty,
            errors,
          })}
        >
          {isUpdating ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <PencilIcon />
          )}
          {isUpdating ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function UserEditDialog({
  open,
  user,
  actorRole,
  onOpenChange,
}: {
  open: boolean;
  user: Profile | null;
  actorRole: "admin" | "editor";
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {open && user ? (
          <UserEditForm
            key={user.id}
            user={user}
            actorRole={actorRole}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Edit user</DialogTitle>
              <DialogDescription>
                Update name and role for this account.
              </DialogDescription>
            </DialogHeader>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function UserDeleteDialog({
  open,
  user,
  actorRole,
  onOpenChange,
}: {
  open: boolean;
  user: Profile | null;
  actorRole: "admin" | "editor";
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isDeleting, startDelete] = useTransition();
  const [isHardDeleting, startHardDelete] = useTransition();
  const showHardDelete = actorRole === "admin" && user?.role !== "admin";
  const busy = isDeleting || isHardDeleting;

  function onDelete() {
    if (!user) return;
    startDelete(async () => {
      try {
        const result = await deleteUser({ id: user.id });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        onOpenChange(false);
        router.refresh();
      } catch {
        toast.error("The user could not be deleted. Please try again.");
      }
    });
  }

  function onHardDelete() {
    if (!user) return;
    startHardDelete(async () => {
      try {
        const result = await hardDeleteUser({ id: user.id });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        onOpenChange(false);
        router.refresh();
      } catch {
        toast.error("The user could not be hard-deleted. Please try again.");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle>Delete user?</AlertDialogTitle>
          <AlertDialogDescription className="break-all">
            This permanently deletes {user?.email} from Auth and removes the
            linked profile. The last admin and last editor cannot be removed
            with a normal delete.
            {actorRole === "editor"
              ? " Editors may only delete viewer accounts."
              : null}
            {showHardDelete
              ? " If this account owns evidence records, use hard-delete below."
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={onDelete} disabled={busy}>
              {isDeleting ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <Trash2Icon />
              )}
              {isDeleting ? "Deleting…" : "Delete user"}
            </Button>
          </div>
          {showHardDelete ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={onHardDelete}
              disabled={busy}
            >
              {isHardDeleting ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <Trash2Icon />
              )}
              {isHardDeleting
                ? "Hard-deleting…"
                : "Delete user and connected evidence"}
            </Button>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
