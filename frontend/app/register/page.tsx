"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "../../lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    setError(null);
    try {
      await authAPI.register(name, email, password);
      // server sets HttpOnly cookie, fetch user to confirm and notify header
      const me = await authAPI.me();
      if (!me?.data?.data) {
        setError('Registration failed');
        return;
      }
      try { window.dispatchEvent(new CustomEvent('auth:changed')); } catch {}
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed');
    }
  }

  return (
    <section className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-4">Create an account</h1>
      <p className="text-sm text-slate-600 mb-4">Register to save orders and view your order history. The test account is available for quick demos.</p>
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded shadow">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div className="flex items-center justify-between">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Register</button>
          <a href="/login" className="text-sm text-blue-600 underline">Sign in</a>
        </div>
      </form>
    </section>
  );
}
