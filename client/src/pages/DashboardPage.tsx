import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

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

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              asChild
              className="text-white/50 hover:text-white hover:bg-white/5"
            >
              <Link to="/profile">Profile</Link>
            </Button>
            <div className="w-px h-5 bg-white/10" />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white/50 hover:text-red-400 hover:bg-red-500/5"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome section */}
        <div className="flex items-start gap-5 mb-12">
          <div className="w-14 h-14 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-amber-400">
              {initials}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome back, {user?.firstName}
            </h1>
            <p className="text-white/40 mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-3">
              Session status
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80 font-medium">Active</span>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-3">
              Access token
            </div>
            <span className="text-white/80 font-medium">In-memory (15 min)</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-3">
              Refresh token
            </div>
            <span className="text-white/80 font-medium">HttpOnly cookie (7 days)</span>
          </div>
        </div>

        {/* Protected route notice */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <p className="text-white/50 text-sm">
            This is a <span className="text-white/80">protected route</span>. If
            you're seeing this, your JWT is valid. Try refreshing the page — your
            session persists via refresh token rotation.
          </p>
        </div>
      </div>
    </div>
  );
}
