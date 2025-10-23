import { Link, useLocation } from "react-router-dom";
import { TrendingUp, Home, BarChart3, BookOpen, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    window.location.href = "/";
  };

  const navItems = isLoggedIn
    ? [
        { path: "/dashboard", label: "Dashboard", icon: Home },
        { path: "/trade", label: "Trade", icon: TrendingUp },
        { path: "/research", label: "Research", icon: BarChart3 },
        { path: "/education", label: "Education", icon: BookOpen },
      ]
    : [
        { path: "/", label: "Home", icon: Home },
        { path: "/research", label: "Research", icon: BarChart3 },
        { path: "/education", label: "Education", icon: BookOpen },
      ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CryptoElite
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 transition-colors ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{username}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="glow-primary">
                    Open Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
