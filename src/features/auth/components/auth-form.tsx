"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
  nextPath?: string;
}

export function AuthForm({ mode, nextPath }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const router = useRouter();
  const next = nextPath?.startsWith("/") ? nextPath : "/characters";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = isSignUp
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password });
    setSubmitting(false);
    if (result.error) {
      setError(result.error.message ?? "Could not continue with that account.");
      return;
    }
    router.replace(next);
    router.refresh();
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12 sm:px-6">
      <section className="w-full rounded-card border border-border bg-background p-6 shadow-lg sm:p-8">
        <p className="text-caption font-semibold tracking-wide text-brand uppercase">
          Multiverse Explorer
        </p>
        <h1 className="mt-2 text-display font-bold text-foreground">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-body text-foreground-muted">
          {isSignUp
            ? "Save searches and use them on any device."
            : "Sign in to access your saved searches."}
        </p>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => void submit(event)}
        >
          {isSignUp && (
            <label className="flex flex-col gap-1.5 text-caption font-medium text-foreground-muted">
              Name
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-control border border-border bg-background px-3 py-2 text-body text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              />
            </label>
          )}
          <label className="flex flex-col gap-1.5 text-caption font-medium text-foreground-muted">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-control border border-border bg-background px-3 py-2 text-body text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-caption font-medium text-foreground-muted">
            Password
            <input
              required
              type="password"
              minLength={8}
              maxLength={128}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-control border border-border bg-background px-3 py-2 text-body text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            />
            {isSignUp && <span>Use at least 8 characters.</span>}
          </label>
          {error && (
            <p role="alert" className="text-status-dead text-caption">
              {error}
            </p>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Please wait…"
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </Button>
        </form>
        <p className="mt-5 text-caption text-foreground-muted">
          {isSignUp ? "Already have an account?" : "New here?"}{" "}
          <Link
            href={isSignUp ? `/sign-in?next=${next}` : `/sign-up?next=${next}`}
            className="font-medium text-brand underline-offset-4 hover:underline"
          >
            {isSignUp ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </section>
    </main>
  );
}
