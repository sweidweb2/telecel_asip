import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import type { PgActionError, PgActionErrorContext } from "./pg-action-error";
import type { AdminMutationExecuteResult } from "./run-admin-mutation";

type AdminTable = keyof Database["public"]["Tables"];

type RowQuery = {
  insert: (values: Record<string, unknown>) => {
    select: (columns: string) => {
      single: () => Promise<{
        data: { id: string } | null;
        error: PgActionError | null;
      }>;
    };
  };
  update: (values: Record<string, unknown>) => {
    eq: (
      column: string,
      value: string,
    ) => {
      select: (columns: string) => {
        maybeSingle: () => Promise<{
          data: { id: string } | null;
          error: PgActionError | null;
        }>;
      };
    };
  };
  select: (columns: string) => {
    eq: (
      column: string,
      value: string,
    ) => {
      maybeSingle: () => Promise<{
        data: { id: string } | null;
        error: PgActionError | null;
      }>;
    };
  };
  delete: () => {
    eq: (
      column: string,
      value: string,
    ) => Promise<{ error: PgActionError | null }>;
  };
};

export type WriteAdminRowInput<T extends AdminTable> =
  | {
      op: "insert";
      table: T;
      values: Database["public"]["Tables"][T]["Insert"];
    }
  | {
      op: "update";
      table: T;
      id: string;
      values: Database["public"]["Tables"][T]["Update"];
      notFound: string;
    }
  | {
      op: "delete";
      table: T;
      id: string;
      notFound: string;
      pgContext?: PgActionErrorContext;
    };

function pgFailure(
  pgError: PgActionError,
  pgContext?: PgActionErrorContext,
): AdminMutationExecuteResult {
  return pgContext
    ? { status: "error", pgError, pgContext }
    : { status: "error", pgError };
}

/**
 * Insert, update, or delete one row. Returns the id, a not-found message,
 * or the Postgres error for `runAdminMutation` to map.
 */
export async function writeAdminRow<T extends AdminTable>(
  supabase: SupabaseClient<Database>,
  input: WriteAdminRowInput<T>,
): Promise<AdminMutationExecuteResult> {
  const table = (supabase as unknown as { from: (name: string) => RowQuery }).from(
    input.table,
  );

  if (input.op === "insert") {
    const { data, error } = await table
      .insert(input.values as Record<string, unknown>)
      .select("id")
      .single();

    if (error || !data?.id) {
      return { status: "error", pgError: error ?? {} };
    }

    return { status: "success", id: data.id };
  }

  if (input.op === "update") {
    const { data, error } = await table
      .update(input.values as Record<string, unknown>)
      .eq("id", input.id)
      .select("id")
      .maybeSingle();

    if (error) return pgFailure(error);
    if (!data) return { status: "error", message: input.notFound };

    return { status: "success", id: data.id };
  }

  const { data: existing, error: existingError } = await table
    .select("id")
    .eq("id", input.id)
    .maybeSingle();

  if (existingError) return pgFailure(existingError);
  if (!existing) return { status: "error", message: input.notFound };

  const { error } = await table.delete().eq("id", input.id);
  if (error) return pgFailure(error, input.pgContext);

  return { status: "success", id: input.id };
}
