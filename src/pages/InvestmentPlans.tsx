import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Check, TrendingUp, Shield, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    minInvestment: 200,
    maxInvestment: 999,
    dailyYield: "5%",
    features: [
      "Basic trading signals",
      "Email support",
      "Access to educational resources",
      "Real-time market data",
    ],
    color: "from-blue-500 to-blue-700",
  },
  {
    name: "Basic",
    icon: TrendingUp,
    minInvestment: 1000,
    maxInvestment: 4999,
    dailyYield: "8%",
    features: [
      "Enhanced trading tools",
      "Priority email support",
      "Advanced charts & analytics",
      "Weekly market reports",
      "Portfolio tracking",
    ],
    color: "from-green-500 to-green-700",
  },
  {
    name: "Advanced",
    icon: Shield,
    minInvestment: 5000,
    maxInvestment: 19999,
    dailyYield: "12%",
    features: [
      "Priority support 24/7",
      "AI-powered insights",
      "Risk management tools",
      "Daily market analysis",
      "Personal account manager",
      "Automated trading bots",
    ],
    color: "from-purple-500 to-purple-700",
  },
  {
    name: "Premium",
    icon: Crown,
    minInvestment: 20000,
    maxInvestment: null,
    dailyYield: "15%",
    features: [
      "VIP dedicated manager",
      "Custom trading strategies",
      "Exclusive market insights",
      "Zero trading fees",
      "Private webinars",
      "Direct line to trading desk",
      "Priority withdrawals",
    ],
    color: "from-amber-500 to-amber-700",
  },
];

const InvestmentPlans = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount < selectedPlan.minInvestment) {
      toast.error(`Minimum investment is $${selectedPlan.minInvestment}`);
      return;
    }

    if (selectedPlan.maxInvestment && amount > selectedPlan.maxInvestment) {
      toast.error(`Maximum investment for this plan is $${selectedPlan.maxInvestment}`);
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to invest");
        navigate("/login");
        return;
      }

      // Get user account
      const { data: accountData, error: accountError } = await supabase
        .from('user_accounts')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (accountError) throw accountError;

      const currentBalance = Number(accountData.balance);
      if (amount > currentBalance) {
        toast.error("Insufficient balance");
        return;
      }

      // Deduct from balance
      const { error: updateError } = await supabase
        .from('user_accounts')
        .update({ balance: currentBalance - amount })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Create investment record
      const dailyYieldValue = parseFloat(selectedPlan.dailyYield);
      const { error: investError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          plan_name: selectedPlan.name,
          amount: amount,
          daily_yield: dailyYieldValue,
          status: 'active'
        });

      if (investError) throw investError;

      toast.success(`Successfully subscribed to ${selectedPlan.name} plan with $${amount}!`);
      setIsDialogOpen(false);
      setInvestmentAmount("");
    } catch (error) {
      console.error('Error creating investment:', error);
      toast.error("Failed to create investment. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Investment Plans</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan to maximize your crypto trading potential. All plans include simulated yields for demonstration purposes.
          </p>
          <p className="text-sm text-yellow-500 mt-2">
            ⚠️ Disclaimer: Simulated yields. Cryptocurrency trading carries risks. Past performance does not guarantee future results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className="relative overflow-hidden border-2 hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20"
              >
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.color}`} />
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-8 w-8 text-primary" />
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-500">{plan.dailyYield}</div>
                      <div className="text-xs text-muted-foreground">Daily Yield*</div>
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    ${plan.minInvestment.toLocaleString()} - {plan.maxInvestment ? `$${plan.maxInvestment.toLocaleString()}` : "Unlimited"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Dialog open={isDialogOpen && selectedPlan?.name === plan.name} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => setSelectedPlan(plan)}
                      >
                        Subscribe Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Subscribe to {plan.name} Plan</DialogTitle>
                        <DialogDescription>
                          Enter the amount you wish to invest (Min: ${plan.minInvestment.toLocaleString()})
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Investment Amount ($)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder={`Min: ${plan.minInvestment}`}
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(e.target.value)}
                            min={plan.minInvestment}
                            max={plan.maxInvestment || undefined}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSubscribe} className="flex-1">
                            Confirm Investment
                          </Button>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InvestmentPlans;
