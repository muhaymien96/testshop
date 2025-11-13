"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "../lib/api";

export default function LoginFormClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const next = params?.get("next") || "/";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await authAPI.login(email, password);
      // server sets HttpOnly cookie; fetch user info and notify header
      const me = await authAPI.me();
      if (!me?.data?.data) {
        setError("Login failed");
        return;
      }
      try {
        window.dispatchEvent(new CustomEvent("auth:changed"));
      } catch {}
      router.push(next);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed");
    }
  }

  return (
    <section className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-4">Sign in to Test Shop</h1>
      <p className="text-sm text-slate-600 mb-4">
        Use the test account (testuser@example.com / password123) or register a new one.
      </p>
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded shadow">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword((e.target as HTMLInputElement).value)} className="w-full p-2 border rounded" />
        </div>
        <div className="flex items-center justify-between">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Sign in</button>
          <a href="/register" className="text-sm text-blue-600 underline">Register</a>
        </div>
      </form>
    </section>
  );
}
