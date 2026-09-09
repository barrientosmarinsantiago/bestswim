"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthPortalLinkProps = {
  dictionary: Dictionary;
  locale: Locale;
  onNavigate?: () => void;
};

export function AuthPortalLink({ dictionary, locale, onNavigate }: AuthPortalLinkProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, activeSession) => {
      setSession(activeSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function signOut() {
    await supabase?.auth.signOut();
    setSession(null);
    onNavigate?.();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" asChild>
        <Link href={`/${locale}/clientes`} onClick={onNavigate} title={session?.user.email || dictionary.nav.portal}>
          <User className="h-4 w-4" />
          {session ? dictionary.portal.myPortal : dictionary.nav.portal}
        </Link>
      </Button>
      {session ? (
        <Button variant="ghost" size="sm" type="button" onClick={signOut} title={session.user.email || dictionary.portal.signOut}>
          <LogOut className="h-4 w-4" />
          {dictionary.portal.signOut}
        </Button>
      ) : null}
    </div>
  );
}
