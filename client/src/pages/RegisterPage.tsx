import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { AxiosError } from "axios";
import { useAuthStore } from "@/stores/authStore";
import type { ApiError } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);

    try {
      await register({ email, password, firstName, lastName });
      navigate("/dashboard");
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const data = axiosError.response?.data;

      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);
      } else {
        setError(data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0b]">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
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

        {/* Geometric shapes */}
        <div className="absolute top-[20%] right-[15%] w-64 h-64 border border-amber-500/10 rounded-full" />
        <div className="absolute top-[18%] right-[13%] w-72 h-72 border border-amber-500/5 rounded-full" />
        <div className="absolute bottom-[25%] left-[12%] w-32 h-32 border border-amber-400/10 rotate-45" />
        <div className="absolute top-[55%] right-[35%] w-16 h-16 bg-amber-500/5 rotate-12" />

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
              Start
              <br />
              <span className="text-amber-400">building.</span>
            </h1>
            <p className="text-white/40 text-base leading-relaxed">
              Create your account in seconds. No credit card, no setup friction
              — just authentication that works out of the box.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-white/50 text-sm">HttpOnly cookies</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-white/50 text-sm">Token rotation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-white/50 text-sm">BCrypt hashing</span>
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
              Create an account
            </h2>
            <p className="text-white/40 text-sm">
              Fill in your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white/60 text-xs uppercase tracking-widest">
                  First name
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-red-400">
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white/60 text-xs uppercase tracking-widest">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-red-400">
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>

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
              {fieldErrors.email && (
                <p className="text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/60 text-xs uppercase tracking-widest">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-400">
                  {fieldErrors.password}
                </p>
              )}
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
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-white/30 mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-amber-500/80 hover:text-amber-400 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
