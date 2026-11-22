/** External URL for admin view dialogs; omitted when empty. */
export function AdminExternalLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const trimmed = href.trim();
  if (!trimmed) return null;
  return (
    <a
      href={trimmed}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-primary hover:underline"
    >
      {label || trimmed}
    </a>
  );
}
