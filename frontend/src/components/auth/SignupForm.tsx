"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      await signup(email, password, fullName);
      toast.success("Welcome to Nomly!");
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
      <h1 className="text-center text-2xl font-bold text-ink-900">Create your account</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-900">Full name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jamie Rivera"
            className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-ink-900"
          />
        </div>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-ink-900"
          />
        </div>
        <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
          Sign up
        </Button>
      </form>

      <p className="text-center text-sm text-ink-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ink-900 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
