import { Link, useLocation } from "react-router-dom";
import { TrendingUp, User, BarChart3, DollarSign, ArrowDownCircle, ArrowUpCircle, Headphones, LogOut, Home, Menu, X, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useState } from "react";

export const Navigation = () => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const username = localStorage.getItem("username");
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    window.location.href = "/";
  };

  const menuItems = [
    { path: "/profile", label: "Profile", icon: User },
    { path: "/charts", label: "Charts", icon: LineChart },
    { path: "/research", label: "Analysis", icon: BarChart3 },
    { path: "/investment-plans", label: "Investment Plan", icon: DollarSign },
    { path: "/deposit", label: "Deposit", icon: ArrowDownCircle },
    { path: "/withdraw", label: "Withdraw", icon: ArrowUpCircle },
    { path: "/education", label: "Support", icon: Headphones },
  ];

  const publicNav = [
    { path: "/", label: "Home", icon: Home },
    { path: "/research", label: "Research", icon: BarChart3 },
    { path: "/education", label: "Education", icon: Headphones },
  ];

  const navItems = isLoggedIn ? menuItems : publicNav;

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isLoggedIn && (
              <Menubar className="border-none bg-transparent">
                <MenubarMenu>
                  <MenubarTrigger className="cursor-pointer">
                    <Menu className="h-5 w-5" />
                  </MenubarTrigger>
                  <MenubarContent>
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <MenubarItem key={item.path} asChild>
                          <Link to={item.path} className="flex items-center gap-2 cursor-pointer">
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </MenubarItem>
                      );
                    })}
                    <MenubarSeparator />
                    <MenubarItem onClick={handleLogout} className="text-destructive cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            )}
            <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CryptoElite
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!isLoggedIn && navItems.map((item) => {
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
                {/* Mobile Menu */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="outline" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64">
                    <div className="flex items-center gap-2 mb-8">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      <span className="text-xl font-bold">Menu</span>
                    </div>
                    <div className="space-y-2">
                      {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-secondary"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/10 text-destructive w-full"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{username}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex gap-2"
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
