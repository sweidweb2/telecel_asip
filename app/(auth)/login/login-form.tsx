"use client";

import Link from "next/link";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";

export function LoginForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full">
        Sign in
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href={ROUTES.register}
          className="text-foreground underline-offset-4 hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
