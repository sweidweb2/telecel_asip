import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { StaffMain } from "@/components/dashboard/skip-to-content";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTES } from "@/constants/routes";
import { requireEditor } from "@/data/auth";

type OkResult = { status: "ok" };

export type CmsEditorLoadResult<T extends OkResult> =
  | { status: "forbidden" }
  | { status: "not_found" }
  | T;

type EditorRecord<T extends OkResult> = Omit<T, "status">;

type CreateProps = {
  listPath: string;
  listLabel: string;
  pageLabel: string;
  load?: undefined;
  children: ReactNode;
};

type LoadedProps<T extends OkResult> = {
  listPath: string;
  listLabel: string;
  pageLabel: string | ((record: EditorRecord<T>) => string);
  load: () => Promise<CmsEditorLoadResult<T>>;
  children: (record: EditorRecord<T>) => ReactNode;
};

/**
 * Shared catalogue create/edit chrome: breadcrumb, editor gate, and the form.
 * Create pages pass `children`. Pages that load a record pass `load` and a render function.
 */
export async function CmsEditorPage(props: CreateProps): Promise<ReactNode>;
export async function CmsEditorPage<T extends OkResult>(
  props: LoadedProps<T>,
): Promise<ReactNode>;
export async function CmsEditorPage<T extends OkResult>(
  props: CreateProps | LoadedProps<T>,
): Promise<ReactNode> {
  const { listPath, listLabel, pageLabel, children } = props;
  let record: EditorRecord<T> | null = null;

  if (props.load) {
    const result = await props.load();
    if (result.status === "forbidden") redirect(ROUTES.dashboard);
    if (result.status === "not_found") notFound();
    const rest: Partial<typeof result> = { ...result };
    delete rest.status;
    record = rest as EditorRecord<T>;
  } else {
    await requireEditor();
  }

  const crumb =
    typeof pageLabel === "function" ? pageLabel(record as EditorRecord<T>) : pageLabel;

  return (
    <StaffMain>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={listPath} />}>
              {listLabel}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[16rem] truncate sm:max-w-md">
              {crumb}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {typeof children === "function"
        ? children(record as EditorRecord<T>)
        : children}
    </StaffMain>
  );
}
