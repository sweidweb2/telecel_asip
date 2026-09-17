import type { Metadata } from "next";

import { UsersListPage } from "@/components/users/users-list-page";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Users | ASIP Editor",
};

type UsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditorUsersPage({ searchParams }: UsersPageProps) {
  return (
    <UsersListPage
      searchParams={searchParams}
      actorRole="editor"
      listPath={ROUTES.users}
      showEditorBlurb
    />
  );
}
