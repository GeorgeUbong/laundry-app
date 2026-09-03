'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginEmployee } from './apis/auth/user';
import { Button } from './_components/button';
import { Card, CardContent, CardHeader, CardTitle } from './_components/card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Slap your login logic here (e.g., Supabase / NextAuth call)
    setLoading(true);
    setError("");

    try {
      await loginEmployee(email, password);
      //succes login
      router.push('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "something is wrong"
      );
    } finally {
      setLoading(false);
    }
    console.log({ email, password });
  };



  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-app-bg text-app-text">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <p className="text-sm text-grey-surface">
            Enter your credentials to access your account
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="text-xs font-semibold uppercase tracking-wider text-grey-surface"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-10 px-3 rounded-lg border border-card-border bg-transparent text-sm text-app-text placeholder:text-grey-surface focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="text-xs font-semibold uppercase tracking-wider text-grey-surface"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 rounded-lg border border-card-border bg-transparent text-sm text-app-text placeholder:text-grey-surface focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
              />
            </div>

            {/* Submit Button */}
            <Button variant="primary" type="submit" disabled={loading} className="w-full mt-2">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}