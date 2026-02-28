import { Link } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  const initials = user?.firstName?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Top nav */}
      <nav className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-amber-500 rounded-sm flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-black"
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
            <span className="text-white/80 font-semibold tracking-wide">
              SpringAuth
            </span>
          </div>

          <Button
            variant="ghost"
            asChild
            className="text-white/50 hover:text-white hover:bg-white/5"
          >
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-amber-400">
              {initials}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Profile
            </h1>
            <p className="text-white/40 mt-0.5">
              Manage your account information
            </p>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5">
            <h2 className="text-white font-semibold">Personal information</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-white/60 text-xs uppercase tracking-widest"
                >
                  First name
                </Label>
                <Input
                  id="firstName"
                  value={user?.firstName ?? ""}
                  disabled
                  className="bg-white/5 border-white/10 text-white/70 h-11 disabled:opacity-70"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-white/60 text-xs uppercase tracking-widest"
                >
                  Last name
                </Label>
                <Input
                  id="lastName"
                  value=""
                  disabled
                  className="bg-white/5 border-white/10 text-white/70 h-11 disabled:opacity-70"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-white/60 text-xs uppercase tracking-widest"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email ?? ""}
                disabled
                className="bg-white/5 border-white/10 text-white/70 h-11 disabled:opacity-70"
              />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01]">
            <Button
              disabled
              className="bg-white/5 text-white/30 border border-white/10 hover:bg-white/5"
            >
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
