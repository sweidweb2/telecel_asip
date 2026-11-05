"use client";

import { useState, useTransition } from "react";
import { Loader2Icon, LogOutIcon } from "lucide-react";

import { signOut } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Locale } from "@/constants/locales";
import { userInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

type SiteAccountMenuProps = {
  email: string;
  locale: Locale;
};

export function SiteAccountMenu({ email, locale }: SiteAccountMenuProps) {
  const [isPending, startTransition] = useTransition();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const initials = userInitials(null, email);
  const openLabel = locale === "fr" ? "Ouvrir le menu compte" : "Open account menu";
  const logoutLabel = locale === "fr" ? "Se déconnecter" : "Log out";
  const signingOutTitle = locale === "fr" ? "Déconnexion" : "Signing out";
  const signingOutBody =
    locale === "fr"
      ? "Fin de votre session. Redirection en cours…"
      : "Ending your session. You will be redirected…";

  function handleSignOut() {
    setIsSigningOut(true);
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "min-h-10 min-w-10 rounded-full border border-black/10 bg-white hover:bg-muted",
          )}
          aria-label={openLabel}
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-asip-ink text-xs text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 min-w-56">
          <div className="grid gap-0.5 px-2 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {locale === "fr" ? "Connecté" : "Signed in"}
            </span>
            <span className="truncate text-sm font-medium">{email}</span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="min-h-11 sm:min-h-8"
            disabled={isPending || isSigningOut}
            onClick={handleSignOut}
          >
            {isPending || isSigningOut ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <LogOutIcon />
            )}
            {logoutLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isSigningOut}
        onOpenChange={(open) => {
          if (!open && isSigningOut) return;
          setIsSigningOut(open);
        }}
      >
        <DialogContent className="max-w-xs sm:max-w-xs" showCloseButton={false}>
          <DialogHeader className="items-center text-center">
            <Loader2Icon
              className="mx-auto size-8 animate-spin text-muted-foreground"
              aria-hidden
            />
            <DialogTitle className="pt-2 text-base">{signingOutTitle}</DialogTitle>
            <DialogDescription>{signingOutBody}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
