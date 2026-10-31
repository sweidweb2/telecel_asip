import { notFound } from "next/navigation";

import { HttpStatusPage, httpStatusMetadata } from "@/components/layout/http-status-page";
import {
  HTTP_STATUS_CODES,
  isHttpStatusCode,
  type HttpStatusCode,
} from "@/constants/http-errors";

type PageProps = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ digest?: string }>;
};

export function generateStaticParams() {
  return HTTP_STATUS_CODES.map((code) => ({ code }));
}

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  if (!isHttpStatusCode(code)) return {};
  return httpStatusMetadata(code);
}

export default async function HttpStatusCodePage({
  params,
  searchParams,
}: PageProps) {
  const [{ code }, { digest }] = await Promise.all([params, searchParams]);
  if (!isHttpStatusCode(code)) notFound();

  const kind = code as HttpStatusCode;
  return (
    <HttpStatusPage
      kind={kind}
      digest={kind === "500" ? (digest ?? null) : null}
    />
  );
}
