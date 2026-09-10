"use client";

import { useId, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import {
  EyeIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  createUser,
  deleteUser,
  hardDeleteUser,
  updateUser,
} from "@/actions/users";
import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
  DialogTrigger,
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
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/profile";
import {
  assignableRolesForActor,
  createUserSchema,
  defaultRoleForActor,
  updateUserSchema,
  USER_EMAIL_MAX,
  USER_FULL_NAME_MAX,
  USER_PASSWORD_MAX,
  type CreateUserInput,
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

export function CreateUserDialog({
  actorRole,
}: {
  actorRole: "admin" | "editor";
}) {
  const formId = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const roles = assignableRolesForActor(actorRole);
  const defaultRole = defaultRoleForActor(actorRole);
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: defaultRole,
    },
  });
  const { errors, isDirty } = form.formState;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset({
        fullName: "",
        email: "",
        password: "",
        role: defaultRole,
      });
    }
  }

  function onSubmit(values: CreateUserInput) {
    startTransition(async () => {
      try {
        const result = await createUser(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("The user could not be created. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <PlusIcon />
            Create user
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Add an account and choose their access role.
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.fullName)}>
              <AdminFormFieldLabel
                htmlFor="create-name"
                hint={`2–${USER_FULL_NAME_MAX} chars`}
              >
                Full name
              </AdminFormFieldLabel>
              <Input
                id="create-name"
                disabled={isPending}
                maxLength={USER_FULL_NAME_MAX}
                placeholder="e.g. Ama Mensah"
                aria-invalid={Boolean(form.formState.errors.fullName)}
                {...form.register("fullName")}
              />
              <FormFieldError message={form.formState.errors.fullName?.message} />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.email)}>
              <AdminFormFieldLabel
                htmlFor="create-email"
                hint={`max ${USER_EMAIL_MAX}`}
              >
                Email
              </AdminFormFieldLabel>
              <Input
                id="create-email"
                type="email"
                disabled={isPending}
                maxLength={USER_EMAIL_MAX}
                placeholder="name@company.com"
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register("email")}
              />
              <FormFieldError message={form.formState.errors.email?.message} />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.password)}>
              <AdminFormFieldLabel htmlFor="create-password" hint="optional">
                Password
              </AdminFormFieldLabel>
              <Input
                id="create-password"
                type="password"
                autoComplete="new-password"
                disabled={isPending}
                maxLength={USER_PASSWORD_MAX}
                placeholder='Defaults to "password" if empty'
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register("password")}
              />
              <FormFieldError
                message={form.formState.errors.password?.message}
              />
            </Field>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <RoleSelectField
                  id="create-role"
                  value={field.value}
                  onChange={field.onChange}
                  roles={roles}
                  disabled={isPending}
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
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={isAdminFormSubmitDisabled({ isPending, isDirty, errors })}
          >
            {isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <PlusIcon />
            )}
            {isPending ? "Creating…" : "Create user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UserRowActions({
  user,
  actorRole,
  editOpen,
  onEditOpenChange,
}: {
  user: Profile;
  actorRole: "admin" | "editor";
  editOpen?: boolean;
  onEditOpenChange?: (open: boolean) => void;
}) {
  const editFormId = useId();
  const router = useRouter();
  const [viewOpen, setViewOpen] = useState(false);
  const [uncontrolledEditOpen, setUncontrolledEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isUpdating, startUpdate] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isHardDeleting, startHardDelete] = useTransition();
  const isEditControlled = onEditOpenChange !== undefined;
  const editOpenState = isEditControlled
    ? Boolean(editOpen)
    : uncontrolledEditOpen;
  const roles = assignableRolesForActor(actorRole);
  const canEditRole =
    actorRole === "admin" || user.role === "editor" || user.role === "viewer";
  const editDefaults: UpdateUserInput = {
    id: user.id,
    fullName: user.full_name ?? "",
    email: user.email,
    role: canEditRole && roles.includes(user.role as UserRole)
      ? (user.role as UserRole)
      : defaultRoleForActor(actorRole),
  };
  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    mode: "onChange",
    defaultValues: editDefaults,
  });
  const { errors, isDirty } = form.formState;
  const showHardDelete = actorRole === "admin" && user.role !== "admin";

  function handleEditOpen(next: boolean) {
    if (isEditControlled) {
      onEditOpenChange?.(next);
    } else {
      setUncontrolledEditOpen(next);
    }
    if (next) form.reset(editDefaults);
  }

  function onUpdate(values: UpdateUserInput) {
    startUpdate(async () => {
      try {
        const result = await updateUser(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        handleEditOpen(false);
        router.refresh();
      } catch {
        toast.error("The user could not be updated. Please try again.");
      }
    });
  }

  function onDelete() {
    startDelete(async () => {
      try {
        const result = await deleteUser({ id: user.id });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        setDeleteOpen(false);
        router.refresh();
      } catch {
        toast.error("The user could not be deleted. Please try again.");
      }
    });
  }

  function onHardDelete() {
    startHardDelete(async () => {
      try {
        const result = await hardDeleteUser({ id: user.id });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        setDeleteOpen(false);
        router.refresh();
      } catch {
        toast.error("The user could not be hard-deleted. Please try again.");
      }
    });
  }

  const busy = isDeleting || isHardDeleting;

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className={ADMIN_ICON_BUTTON_CLASS}
              aria-label={`View ${user.email}`}
            />
          }
        >
          <EyeIcon />
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">
              {user.full_name || "Unnamed user"}
            </DialogTitle>
            <DialogDescription>User profile details</DialogDescription>
          </DialogHeader>
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
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      {canEditRole ? (
        <Dialog open={editOpenState} onOpenChange={handleEditOpen}>
          <DialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className={ADMIN_ICON_BUTTON_CLASS}
                aria-label={`Edit ${user.email}`}
              />
            }
          >
            <PencilIcon />
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Edit user</DialogTitle>
              <DialogDescription>
                Update email, name, and role for this account.
              </DialogDescription>
            </DialogHeader>

            <form
              id={editFormId}
              onSubmit={form.handleSubmit(onUpdate)}
              noValidate
            >
              <input type="hidden" {...form.register("id")} />
              <FieldGroup>
                <Field data-invalid={Boolean(form.formState.errors.fullName)}>
                  <AdminFormFieldLabel
                    htmlFor={`edit-name-${user.id}`}
                    hint={`2–${USER_FULL_NAME_MAX} chars`}
                  >
                    Full name
                  </AdminFormFieldLabel>
                  <Input
                    id={`edit-name-${user.id}`}
                    disabled={isUpdating}
                    maxLength={USER_FULL_NAME_MAX}
                    placeholder="e.g. Ama Mensah"
                    aria-invalid={Boolean(form.formState.errors.fullName)}
                    {...form.register("fullName")}
                  />
                  <FormFieldError
                    message={form.formState.errors.fullName?.message}
                  />
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.email)}>
                  <AdminFormFieldLabel
                    htmlFor={`edit-email-${user.id}`}
                    hint={`max ${USER_EMAIL_MAX}`}
                  >
                    Email
                  </AdminFormFieldLabel>
                  <Input
                    id={`edit-email-${user.id}`}
                    type="email"
                    disabled={isUpdating}
                    maxLength={USER_EMAIL_MAX}
                    placeholder="name@company.com"
                    aria-invalid={Boolean(form.formState.errors.email)}
                    {...form.register("email")}
                  />
                  <FormFieldError
                    message={form.formState.errors.email?.message}
                  />
                </Field>
                <Controller
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <RoleSelectField
                      id={`edit-role-${user.id}`}
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
                onClick={() => handleEditOpen(false)}
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
          </DialogContent>
        </Dialog>
      ) : null}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                ADMIN_ICON_BUTTON_CLASS,
                "text-destructive hover:bg-destructive/10 hover:text-destructive",
              )}
              aria-label={`Delete ${user.email}`}
              disabled={actorRole === "editor" && user.role === "admin"}
            />
          }
        >
          <Trash2Icon />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription className="break-all">
              This permanently deletes {user.email} from Auth and removes the
              linked profile. The last admin and last editor cannot be removed
              with a normal delete.
              {showHardDelete
                ? " If this account owns evidence records, use hard-delete below."
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={busy}
              >
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
    </div>
  );
}
