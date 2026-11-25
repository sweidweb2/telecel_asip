"use client";

import type { ReactNode } from "react";
import type {
  Control,
  FieldPath,
  FieldValues,
  UseFormRegister,
} from "react-hook-form";
import { Controller } from "react-hook-form";

import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UrlInput } from "@/components/ui/url-input";
import { cn } from "@/lib/utils";

type CmsFieldBaseProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Standard CMS text input: label + Input + error.
 */
export function CmsTextField<TFieldValues extends FieldValues>({
  id,
  label,
  hint,
  error,
  disabled,
  className,
  register,
  name,
  type = "text",
  maxLength,
  placeholder,
  inputClassName,
}: CmsFieldBaseProps & {
  register: UseFormRegister<TFieldValues>;
  name: FieldPath<TFieldValues>;
  type?: "text" | "email" | "tel" | "date" | "number";
  maxLength?: number;
  placeholder?: string;
  inputClassName?: string;
}) {
  return (
    <Field className={className} data-invalid={Boolean(error)}>
      <AdminFormFieldLabel htmlFor={id} hint={hint}>
        {label}
      </AdminFormFieldLabel>
      <Input
        id={id}
        type={type}
        className={cn("min-h-11", inputClassName)}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        {...register(name)}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

/**
 * Standard CMS textarea: label + Textarea + error.
 */
export function CmsTextareaField<TFieldValues extends FieldValues>({
  id,
  label,
  hint,
  error,
  disabled,
  className,
  register,
  name,
  rows = 3,
  maxLength,
  placeholder,
}: CmsFieldBaseProps & {
  register: UseFormRegister<TFieldValues>;
  name: FieldPath<TFieldValues>;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <Field className={className} data-invalid={Boolean(error)}>
      <AdminFormFieldLabel htmlFor={id} hint={hint}>
        {label}
      </AdminFormFieldLabel>
      <Textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        {...register(name)}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

/**
 * Standard CMS URL input (UrlInput helper).
 */
export function CmsUrlField<TFieldValues extends FieldValues>({
  id,
  label,
  hint,
  error,
  disabled,
  className,
  register,
  name,
  maxLength,
  placeholder,
}: CmsFieldBaseProps & {
  register: UseFormRegister<TFieldValues>;
  name: FieldPath<TFieldValues>;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <Field className={className} data-invalid={Boolean(error)}>
      <AdminFormFieldLabel htmlFor={id} hint={hint}>
        {label}
      </AdminFormFieldLabel>
      <UrlInput
        id={id}
        className="min-h-11"
        maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        {...register(name)}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

type CmsSelectOption = {
  value: string;
  label: string;
};

/**
 * Standard CMS select via Controller (Base UI `items` + labeled SelectValue).
 */
export function CmsSelectField<TFieldValues extends FieldValues>({
  id,
  label,
  hint,
  error,
  disabled,
  className,
  control,
  name,
  options,
  placeholder,
  emptyValue,
}: CmsFieldBaseProps & {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  options: readonly CmsSelectOption[];
  placeholder?: string;
  /**
   * Value written when the selection is cleared / matches a sentinel.
   * Pass `null` for nullable fields; omit to clear to `""`.
   */
  emptyValue?: string | null;
}) {
  const items = options.map((option) => ({
    value: option.value,
    label: option.label,
  }));
  const clearTo = emptyValue === undefined ? "" : emptyValue;

  return (
    <Field className={className} data-invalid={Boolean(error)}>
      <AdminFormFieldLabel htmlFor={id} hint={hint}>
        {label}
      </AdminFormFieldLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const selected =
            field.value == null || field.value === ""
              ? clearTo
              : String(field.value);
          const selectedLabel =
            options.find((option) => option.value === selected)?.label ??
            placeholder;

          return (
            <Select
              value={selected == null ? "" : selected}
              items={items}
              onValueChange={(value) => {
                if (
                  value == null ||
                  value === "" ||
                  (emptyValue !== undefined && value === emptyValue)
                ) {
                  field.onChange(clearTo);
                  return;
                }
                field.onChange(value);
              }}
              disabled={disabled}
            >
              <SelectTrigger
                id={id}
                className="min-h-11 w-full"
                aria-invalid={Boolean(error)}
              >
                <SelectValue placeholder={placeholder}>
                  {selectedLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

/**
 * Standard CMS boolean switch with label beside control.
 */
export function CmsSwitchField<TFieldValues extends FieldValues>({
  id,
  label,
  hint,
  error,
  disabled,
  className,
  control,
  name,
  description,
}: CmsFieldBaseProps & {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  description?: ReactNode;
}) {
  return (
    <Field className={className} data-invalid={Boolean(error)}>
      <div className="flex items-center justify-between gap-4">
        <div className="grid gap-1">
          <AdminFormFieldLabel htmlFor={id} hint={hint}>
            {label}
          </AdminFormFieldLabel>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Switch
              id={id}
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-invalid={Boolean(error)}
            />
          )}
        />
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}
