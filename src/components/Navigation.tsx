import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, Headphones, UserPlus, Lock } from "lucide-react";
import { useEffect, useState } from "react";

export const Navigation = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
      setUsername(JSON.parse(user).username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <>
      <nav className="bg-primary text-primary-foreground py-3 px-6 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            ForexElite Brokers
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/" className="hover:underline transition-all">
              Home
            </Link>
            <span className="hover:underline cursor-pointer transition-all">About us</span>
            <span className="hover:underline cursor-pointer transition-all">Trading & Products</span>
            <span className="hover:underline cursor-pointer transition-all">Promotions</span>
            {isLoggedIn && (
              <>
                <Link to="/dashboard" className="hover:underline transition-all">
                  Dashboard
                </Link>
                <Link to="/trade" className="hover:underline transition-all">
                  Trade
                </Link>
                <Link to="/research" className="hover:underline transition-all">
                  Research
                </Link>
              </>
            )}
            <Link to="/education" className="hover:underline transition-all">
              Education & Support
            </Link>
            <span className="hover:underline cursor-pointer transition-all">Partners</span>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 text-sm mr-2">
                  <User className="h-4 w-4" />
                  <span>{username}</span>
                </div>
                <Button
                  size="sm"
                  onClick={handleLogout}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Headphones className="h-4 w-4 mr-1" />
                  Support
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/signup")}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Register
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Lock className="h-4 w-4 mr-1" />
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
      
      {/* Sub-bar with large REGISTER button */}
      {!isLoggedIn && (
        <div className="bg-primary-foreground py-2 text-center">
          <Button
            size="lg"
            onClick={() => navigate("/signup")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground animate-pulse-glow font-bold px-12"
          >
            REGISTER
          </Button>
        </div>
      )}
    </>
  );
};
