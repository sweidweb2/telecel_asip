import { HttpStatusPage, httpStatusMetadata } from "@/components/layout/http-status-page";

export const metadata = httpStatusMetadata("500");

type PageProps = {
  searchParams: Promise<{ digest?: string }>;
};

export default async function ServerErrorPage({ searchParams }: PageProps) {
  const { digest } = await searchParams;
  return <HttpStatusPage kind="500" digest={digest ?? null} />;
}
