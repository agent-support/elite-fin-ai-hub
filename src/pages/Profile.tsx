import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Shield } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    riskTolerance: "",
    accountBalance: "0",
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Load user data
    const username = localStorage.getItem("username") || "";
    const fullName = localStorage.getItem("fullName") || "";
    const email = localStorage.getItem("email") || "";
    const phone = localStorage.getItem("phone") || "";
    const address = localStorage.getItem("address") || "";
    const riskTolerance = localStorage.getItem("riskTolerance") || "";
    const accountBalance = localStorage.getItem("accountBalance") || "35000";

    setFormData({
      username,
      fullName,
      email,
      phone,
      address,
      riskTolerance,
      accountBalance,
    });
  }, [navigate]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage
    localStorage.setItem("fullName", formData.fullName);
    localStorage.setItem("email", formData.email);
    localStorage.setItem("phone", formData.phone);
    localStorage.setItem("address", formData.address);
    localStorage.setItem("riskTolerance", formData.riskTolerance);

    toast.success("Profile updated successfully!");
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="bg-card border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {formData.fullName ? formData.fullName[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">Profile Settings</CardTitle>
                <p className="text-muted-foreground">Update your account information</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St, City, Country"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskTolerance" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Risk Tolerance
                  </Label>
                  <Select
                    value={formData.riskTolerance}
                    onValueChange={(value) => setFormData({ ...formData, riskTolerance: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Account Balance</Label>
                  <div className="text-3xl font-bold text-green-500">
                    ${parseFloat(formData.accountBalance).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Update Profile
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
