import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { AxiosError } from "axios";
import { useAuthStore } from "@/stores/authStore";
import type { ApiError } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0b]">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/80 via-[#0a0a0b] to-[#0a0a0b]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(217,119,6,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(245,158,11,0.08),transparent_50%)]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating geometric shapes */}
        <div className="absolute top-[15%] left-[10%] w-72 h-72 border border-amber-500/10 rounded-full" />
        <div className="absolute top-[12%] left-[8%] w-80 h-80 border border-amber-500/5 rounded-full" />
        <div className="absolute bottom-[20%] right-[15%] w-40 h-40 border border-amber-400/10 rotate-45" />
        <div className="absolute top-[60%] left-[30%] w-20 h-20 bg-amber-500/5 rotate-12" />

        {/* Accent line */}
        <div className="absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-500/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-sm flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <span className="text-white/90 font-semibold tracking-wide text-lg">
                SpringAuth
              </span>
            </div>
          </div>

          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
              Secure by
              <br />
              <span className="text-amber-400">design.</span>
            </h1>
            <p className="text-white/40 text-base leading-relaxed">
              JWT authentication with refresh token rotation, built on Spring
              Boot and React. Production patterns, not a toy.
            </p>
            <div className="flex gap-6 pt-2">
              <div>
                <div className="text-2xl font-bold text-white/90">256-bit</div>
                <div className="text-xs text-white/30 uppercase tracking-widest mt-1">
                  Encryption
                </div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="text-2xl font-bold text-white/90">15 min</div>
                <div className="text-xs text-white/30 uppercase tracking-widest mt-1">
                  Token TTL
                </div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="text-2xl font-bold text-white/90">Auto</div>
                <div className="text-xs text-white/30 uppercase tracking-widest mt-1">
                  Rotation
                </div>
              </div>
            </div>
          </div>

          <p className="text-white/20 text-xs tracking-widest uppercase">
            Spring Boot &middot; React &middot; JWT
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-amber-500 rounded-sm flex items-center justify-center">
              <svg
                className="w-4 h-4 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <span className="text-white/90 font-semibold tracking-wide text-lg">
              SpringAuth
            </span>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-white/40 text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/60 text-xs uppercase tracking-widest">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/60 text-xs uppercase tracking-widest">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-amber-500/70 hover:text-amber-400 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-white/30 mt-8">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-amber-500/80 hover:text-amber-400 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
