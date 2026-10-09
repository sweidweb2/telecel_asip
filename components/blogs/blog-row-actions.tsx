"use client";

import { deleteBlog } from "@/actions/blogs";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { AdminRowEditLink } from "@/components/dashboard/admin-row-edit-link";
import { ROUTES } from "@/constants/routes";
import type { BlogListItem } from "@/types/blog";

type BlogRowActionsProps = {
  blog: BlogListItem;
  redirectOnDelete?: boolean;
};

export function BlogRowActions({
  blog,
  redirectOnDelete = false,
}: BlogRowActionsProps) {
  const href = `${ROUTES.blogs}/${blog.id}`;

  return (
    <div className="flex items-center justify-end gap-0.5">
      <AdminRowEditLink href={href} label={`Edit ${blog.title}`} />

      <AdminRowDelete
        deleteAction={() => deleteBlog({ id: blog.id })}
        redirectTo={redirectOnDelete ? ROUTES.blogs : undefined}
        fallbackError="The blog could not be deleted. Please try again."
        title="Delete blog?"
        description={
          <>
            This permanently deletes “{blog.title}” and its images. This cannot
            be undone.
          </>
        }
        confirmLabel="Delete blog"
        triggerLabel={`Delete ${blog.title}`}
      />
    </div>
  );
}
