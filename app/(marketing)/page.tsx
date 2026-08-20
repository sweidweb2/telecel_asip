import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16">
      <div className="max-w-xl space-y-6">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          Telecel
        </h1>
        <p className="text-lg text-muted-foreground">
          Sign in to manage the admin dashboard, or create an account to get
          started.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={ROUTES.login}>Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={ROUTES.register}>Register</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href={ROUTES.dashboard}>Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
