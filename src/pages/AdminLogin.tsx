import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield } from "lucide-react";


export const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify admin password
      if (password !== "65657667") {
        toast.error("Invalid admin password");
        setLoading(false);
        return;
      }

      // Store admin session and password
      localStorage.setItem("adminAuthenticated", "true");
      localStorage.setItem("adminPassword", password);
      
      // Success
      toast.success("Admin access granted");
      navigate("/admin");
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-6">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">Admin Access</h1>
        <p className="text-muted-foreground text-center mb-6">
          Enter admin password to continue
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="password">Admin Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              className="mt-2"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Access Admin Panel"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-4">
          Enter the admin password to access the control panel
        </p>
      </Card>
    </div>
  );
};