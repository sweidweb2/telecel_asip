import {
  AdminDetailRow,
  AdminDetailSection,
} from "@/components/dashboard/admin-detail-row";
import {
  getAdminPublicReflection,
  type AdminPublicReflectionId,
} from "@/constants/admin-public-reflections";
import { cn } from "@/lib/utils";

/**
 * Where a CMS resource appears on the public site — the body of the admin Catalog.
 */
export function AdminPublicReflectionPanel({
  resourceId,
}: {
  resourceId: AdminPublicReflectionId;
}) {
  const guide = getAdminPublicReflection(resourceId);

  return (
    <div className="grid min-w-0 gap-4">
      <div className="grid min-w-0 gap-2">
        <h2 className="text-lg font-semibold text-balance">{guide.title}</h2>
        <p className="text-sm text-muted-foreground">{guide.intro}</p>
      </div>

      <ul className="grid gap-3">
        {guide.surfaces.map((surface) => (
          <li key={`${surface.page}-${surface.path}`}>
            <AdminDetailSection title={surface.page}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-xs text-muted-foreground">{surface.path}</p>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
                    surface.reflected
                      ? "bg-primary text-primary-foreground"
                      : "border border-transparent bg-[var(--portal-accent)] text-white",
                  )}
                >
                  {surface.reflected ? "Reflected" : "Not reflected"}
                </span>
              </div>
              <AdminDetailRow label="What shows">{surface.shows}</AdminDetailRow>
              <AdminDetailRow label="Rule">{surface.rule}</AdminDetailRow>
            </AdminDetailSection>
          </li>
        ))}
      </ul>

      {guide.notes && guide.notes.length > 0 ? (
        <ul className="grid gap-1.5 border-t pt-3 text-sm text-muted-foreground">
          {guide.notes.map((note) => (
            <li key={note}>• {note}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
