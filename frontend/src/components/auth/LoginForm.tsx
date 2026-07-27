"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push(redirect);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div className="flex justify-center">
        <Logo />
      </div>
      <h1 className="text-center text-2xl font-bold text-ink-900">Log in to Nomly</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-900">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-ink-900"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-900">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-ink-900"
          />
        </div>
        <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
          Log in
        </Button>
      </form>

      <p className="rounded-xl bg-ink-50 px-4 py-3 text-center text-xs text-ink-500">
        Demo tip: any seeded account works with the password <span className="font-semibold">password123</span>
        , e.g. maya.rivera@nomly.dev
      </p>

      <p className="text-center text-sm text-ink-600">
        New to Nomly?{" "}
        <Link href="/signup" className="font-semibold text-ink-900 underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
