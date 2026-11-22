"use client";

import { memo, useId, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteUser, hardDeleteUser, updateUser } from "@/actions/users";
import {
  ADMIN_INBOX_EDIT_HEADER_CLASS,
  ADMIN_INBOX_VIEW_DIALOG_CLASS,
  AdminDetailGrid,
  AdminDetailRow,
  AdminDetailSection,
} from "@/components/dashboard/admin-detail-row";
import { AdminFieldError } from "@/components/dashboard/admin-field-error";
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
import { Field, FieldGroup } from "@/components/ui/field";
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
  STAFF_AUDIENCE_TYPES,
  updateUserSchema,
  USER_EMAIL_MAX,
  USER_FULL_NAME_MAX,
  type StaffAudienceType,
  type UpdateUserInput,
  type UserRole,
} from "@/validations/users";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const TYPE_LABELS: Record<StaffAudienceType, string> = {
  startup: "Startup",
  investor: "Investor",
};


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
      <AdminFieldError message={error} />
    </Field>
  );
}

function AudienceTypeSelectField({
  id,
  value,
  onChange,
  disabled,
  error,
}: {
  id: string;
  value: StaffAudienceType;
  onChange: (type: StaffAudienceType) => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <Label htmlFor={id}>Account type</Label>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next as StaffAudienceType);
        }}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full" aria-invalid={Boolean(error)}>
          <SelectValue>{TYPE_LABELS[value]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STAFF_AUDIENCE_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <AdminFieldError message={error} />
    </Field>
  );
}

function audienceTypeForProfile(user: Profile): StaffAudienceType {
  return user.type === "investor" ? "investor" : "startup";
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
      <DialogContent className={ADMIN_INBOX_VIEW_DIALOG_CLASS}>
        <DialogHeader className="min-w-0 gap-3">
          <DialogTitle className="min-w-0 pr-8 wrap-break-word [overflow-wrap:anywhere]">
            {user?.full_name || "Unnamed user"}
          </DialogTitle>
          <DialogDescription>User profile details</DialogDescription>
        </DialogHeader>
        {user ? (
          <AdminDetailSection>
            <AdminDetailRow label="Email">{user.email}</AdminDetailRow>
            <AdminDetailRow label="Role">
              <Badge variant="outline">{user.role}</Badge>
            </AdminDetailRow>
            <AdminDetailRow label="Account type">
              <Badge variant="outline">{user.type}</Badge>
            </AdminDetailRow>
            <AdminDetailRow label="User ID">
              <span className="font-mono text-xs">{user.id}</span>
            </AdminDetailRow>
            <AdminDetailGrid>
              <AdminDetailRow label="Created">
                {formatAdminDate(user.created_at)}
              </AdminDetailRow>
              <AdminDetailRow label="Updated">
                {formatAdminDate(user.updated_at)}
              </AdminDetailRow>
            </AdminDetailGrid>
          </AdminDetailSection>
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
    type: audienceTypeForProfile(user),
  };
  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    mode: "onChange",
    defaultValues: editDefaults,
  });
  const { errors, isDirty } = form.formState;
  const selectedRole = form.watch("role");

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
      <DialogHeader className={ADMIN_INBOX_EDIT_HEADER_CLASS}>
        <DialogTitle>Edit user</DialogTitle>
        <DialogDescription>
          {canEditEmail
            ? "Update email, name, role, and account type for this account."
            : "Update name, role, and account type. Only administrators can change emails."}
        </DialogDescription>
      </DialogHeader>

      <form id={editFormId} onSubmit={form.handleSubmit(onUpdate)} noValidate>
        <input type="hidden" {...form.register("id")} />
        <FieldGroup>
          <Field data-invalid={Boolean(errors.fullName)}>
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
              aria-invalid={Boolean(errors.fullName)}
              {...form.register("fullName")}
            />
            <AdminFieldError message={errors.fullName?.message} />
          </Field>
          <Field data-invalid={Boolean(errors.email)}>
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
              aria-invalid={Boolean(errors.email)}
              {...form.register("email")}
            />
            <AdminFieldError message={errors.email?.message} />
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
                error={errors.role?.message}
              />
            )}
          />
          {selectedRole !== "admin" ? (
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <AudienceTypeSelectField
                  id="edit-user-type"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isUpdating}
                  error={errors.type?.message}
                />
              )}
            />
          ) : null}
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
            <DialogHeader className={ADMIN_INBOX_EDIT_HEADER_CLASS}>
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
