"use client";

import { useId, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { EyeIcon, EyeOffIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createUser } from "@/actions/users";
import { ADMIN_INBOX_EDIT_HEADER_CLASS } from "@/components/dashboard/admin-detail-row";
import { AdminFieldError } from "@/components/dashboard/admin-field-error";
import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
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
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
import {
  assignableRolesForActor,
  createUserSchema,
  defaultRoleForActor,
  STAFF_AUDIENCE_TYPES,
  USER_EMAIL_MAX,
  USER_FULL_NAME_MAX,
  USER_PASSWORD_MAX,
  type CreateUserInput,
  type StaffAudienceType,
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

export function CreateUserDialog({
  actorRole,
}: {
  actorRole: "admin" | "editor";
}) {
  const formId = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
      type: "startup",
    },
  });
  const { errors, isDirty } = form.formState;
  const selectedRole = form.watch("role");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setIsPasswordVisible(false);
      form.reset({
        fullName: "",
        email: "",
        password: "",
        role: defaultRole,
        type: "startup",
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
        <DialogHeader className={ADMIN_INBOX_EDIT_HEADER_CLASS}>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Add an account and choose their access role and audience type.
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FieldGroup>
            <Field data-invalid={Boolean(errors.fullName)}>
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
                aria-invalid={Boolean(errors.fullName)}
                {...form.register("fullName")}
              />
              <AdminFieldError message={errors.fullName?.message} />
            </Field>
            <Field data-invalid={Boolean(errors.email)}>
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
                aria-invalid={Boolean(errors.email)}
                {...form.register("email")}
              />
              <AdminFieldError message={errors.email?.message} />
            </Field>
            <Field data-invalid={Boolean(errors.password)}>
              <AdminFormFieldLabel htmlFor="create-password" hint="required">
                Password
              </AdminFormFieldLabel>
              <div className="relative">
                <Input
                  id="create-password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  disabled={isPending}
                  maxLength={USER_PASSWORD_MAX}
                  placeholder="At least 8 characters, letter + number"
                  aria-invalid={Boolean(errors.password)}
                  className="pr-11"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-0.5 inline-flex size-9 min-h-9 min-w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  disabled={isPending}
                  aria-label={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                  aria-pressed={isPasswordVisible}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                >
                  <EyeIcon
                    className={isPasswordVisible ? "hidden size-4" : "size-4"}
                    aria-hidden
                  />
                  <EyeOffIcon
                    className={isPasswordVisible ? "size-4" : "hidden size-4"}
                    aria-hidden
                  />
                </button>
              </div>
              <AdminFieldError
                message={errors.password?.message}
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
                    id="create-type"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
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
