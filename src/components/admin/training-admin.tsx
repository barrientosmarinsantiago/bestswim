"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Save, Waves } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function TrainingAdmin({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [access, setAccess] = useState<"loading" | "admin" | "denied">(() => (supabase ? "loading" : "denied"));
  const [accessError, setAccessError] = useState<string | null>(() =>
    supabase ? null : "Supabase is not configured in this environment."
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }
    const client = supabase;

    async function verifyAdmin() {
      const {
        data: { user },
        error: userError
      } = await client.auth.getUser();

      if (userError) {
        setAccessError(userError.message);
        setAccess("denied");
        return;
      }

      if (!user) {
        setAccessError("No active user session. Sign in from the client portal first.");
        setAccess("denied");
        return;
      }

      const { data, error } = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();

      if (error) {
        setAccessError(error.message);
        setAccess("denied");
        return;
      }

      if (data?.role === "admin") {
        setAccessError(null);
        setAccess("admin");
        return;
      }

      setAccessError(`Profile role is "${data?.role || "missing"}", not "admin".`);
      setAccess("denied");
    }

    verifyAdmin();
  }, [supabase]);

  async function saveSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    if (!supabase) {
      setStatus("error");
      return;
    }

    const form = new FormData(event.currentTarget);
    const payload = {
      program_slug: String(form.get("program") || "weekly-training"),
      session_date: String(form.get("date") || new Date().toISOString().slice(0, 10)),
      difficulty: String(form.get("difficulty") || "medium"),
      title: {
        es: String(form.get("titleEs") || ""),
        en: String(form.get("titleEn") || ""),
        pt: String(form.get("titlePt") || "")
      },
      body: {
        es: String(form.get("bodyEs") || ""),
        en: String(form.get("bodyEn") || ""),
        pt: String(form.get("bodyPt") || "")
      },
      published: form.get("published") === "on"
    };

    const { error } = await supabase.from("training_sessions").insert(payload);
    setStatus(error ? "error" : "saved");

    if (!error) {
      event.currentTarget.reset();
    }
  }

  return (
    <main className="min-h-screen bg-swim-navy px-4 py-10 text-swim-white">
      <div className="mx-auto max-w-4xl">
        <Link href={`/${locale}`} className="mb-8 flex items-center gap-3">
          <Waves className="h-7 w-7 text-swim-cyan" />
          <span className="text-xl font-semibold">Best Swim</span>
        </Link>

        <Card className="glass-panel">
          <CardHeader>
            <Badge>Admin</Badge>
            <CardTitle className="text-4xl">{dictionary.admin.title}</CardTitle>
            <CardDescription className="text-base">{dictionary.admin.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {access === "loading" ? <p className="text-sm text-swim-steel">Checking admin access...</p> : null}
            {access === "denied" ? (
              <div className="space-y-3 rounded-md border border-white/10 bg-white/[0.07] p-4 text-sm text-swim-steel">
                <p className="font-semibold text-swim-white">Admin access is required for this page.</p>
                {accessError ? <p className="text-swim-aqua">{accessError}</p> : null}
                <Link href={`/${locale}/clientes`} className="inline-flex text-swim-cyan hover:text-swim-aqua">
                  Go to client portal login
                </Link>
              </div>
            ) : null}
            {access === "admin" ? (
            <form className="grid gap-5" onSubmit={saveSession}>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="titleEs">{dictionary.admin.fields.titleEs}</Label>
                  <Input id="titleEs" name="titleEs" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleEn">{dictionary.admin.fields.titleEn}</Label>
                  <Input id="titleEn" name="titleEn" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titlePt">{dictionary.admin.fields.titlePt}</Label>
                  <Input id="titlePt" name="titlePt" required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date">{dictionary.admin.fields.date}</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">{dictionary.admin.fields.difficulty}</Label>
                  <Input id="difficulty" name="difficulty" defaultValue="medium" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program">{dictionary.admin.fields.program}</Label>
                  <Input id="program" name="program" defaultValue="weekly-training" required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="bodyEs">{dictionary.admin.fields.bodyEs}</Label>
                  <Textarea id="bodyEs" name="bodyEs" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyEn">{dictionary.admin.fields.bodyEn}</Label>
                  <Textarea id="bodyEn" name="bodyEn" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyPt">{dictionary.admin.fields.bodyPt}</Label>
                  <Textarea id="bodyPt" name="bodyPt" required />
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm text-swim-white/[0.82]">
                <input name="published" type="checkbox" className="h-4 w-4 accent-swim-cyan" />
                {dictionary.admin.fields.published}
              </label>
              <Button type="submit" disabled={status === "saving"}>
                <Save className="h-4 w-4" />
                {dictionary.admin.save}
              </Button>
              {status === "saved" ? <p className="text-sm text-swim-aqua">Saved.</p> : null}
              {status === "error" ? <p className="text-sm text-swim-aqua">Could not save. Check Supabase and RLS.</p> : null}
            </form>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
