import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/profile">Profile</Link>
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome back, {user?.firstName}!</CardTitle>
            <CardDescription>
              Logged in as {user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Dashboard content will go here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
