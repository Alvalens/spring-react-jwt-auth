import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex bg-[#0a0a0b]">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/80 via-[#0a0a0b] to-[#0a0a0b]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(217,119,6,0.15),transparent_60%)]" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="absolute top-[25%] right-[18%] w-48 h-48 border border-amber-500/10 rounded-full" />
        <div className="absolute bottom-[20%] left-[15%] w-28 h-28 border border-amber-400/10 rotate-45" />
        <div className="absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-500/20 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-sm flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-white/90 font-semibold tracking-wide text-lg">SpringAuth</span>
          </div>

          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
              Almost
              <br />
              <span className="text-amber-400">there.</span>
            </h1>
            <p className="text-white/40 text-base leading-relaxed">
              Choose a strong password — at least 8 characters. You'll be signed
              in right after.
            </p>
          </div>

          <p className="text-white/20 text-xs tracking-widest uppercase">
            Spring Boot &middot; React &middot; JWT
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-amber-500 rounded-sm flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-white/90 font-semibold tracking-wide text-lg">SpringAuth</span>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Reset password
            </h2>
            <p className="text-white/40 text-sm">Enter your new password</p>
          </div>

          <form className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/60 text-xs uppercase tracking-widest">
                New password
              </Label>
              <Input
                id="password"
                type="password"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/60 text-xs uppercase tracking-widest">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
              />
            </div>

            <Button className="w-full h-11 bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors">
              Reset password
            </Button>
          </form>

          <p className="text-center text-sm text-white/30 mt-8">
            <Link
              to="/login"
              className="text-amber-500/80 hover:text-amber-400 transition-colors"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
