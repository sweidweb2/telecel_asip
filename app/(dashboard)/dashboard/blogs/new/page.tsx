import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BlogEditorForm } from "@/components/blogs/blog-editor-form";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "New blog | ASIP Admin",
};

export default async function NewBlogPage() {
  const supabase = await createClient();
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error) throw error;
  if (!isAdmin) redirect(ROUTES.dashboard);

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div>
        <Link
          href={ROUTES.blogs}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "min-h-11 gap-2 px-0 hover:bg-transparent",
          )}
        >
          <ArrowLeft className="size-4" />
          Back to blogs
        </Link>
        <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight">
          New blog
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Draft an Insights article. Upload images after the first save.
        </p>
      </div>
      <BlogEditorForm mode="create" />
    </main>
  );
}
