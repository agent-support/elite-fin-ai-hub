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
    dailyYield: "480%",
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
    dailyYield: "485%",
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
    dailyYield: "490%",
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
    dailyYield: "495%",
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
  const [selectedCrypto, setSelectedCrypto] = useState<"BTC" | "ETH">("BTC");
  const [btcPrice, setBtcPrice] = useState(60000);
  const [ethPrice, setEthPrice] = useState(2500);
  const [btcBalance, setBtcBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }
    fetchCryptoPrices();
    loadUserBalances();
  }, [navigate]);

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'
      );
      const data = await response.json();
      if (data.bitcoin?.usd) setBtcPrice(data.bitcoin.usd);
      if (data.ethereum?.usd) setEthPrice(data.ethereum.usd);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    }
  };

  const loadUserBalances = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: accountData } = await supabase
        .from('user_accounts')
        .select('btc_balance, eth_balance')
        .eq('user_id', user.id)
        .single();

      if (accountData) {
        setBtcBalance(Number(accountData.btc_balance));
        setEthBalance(Number(accountData.eth_balance));
      }
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to invest");
        navigate("/login");
        return;
      }

      // Get user account
      const { data: accountData, error: accountError } = await supabase
        .from('user_accounts')
        .select('btc_balance, eth_balance')
        .eq('user_id', user.id)
        .single();

      if (accountError) throw accountError;

      const currentBtcBalance = Number(accountData.btc_balance);
      const currentEthBalance = Number(accountData.eth_balance);

      // Convert USD amount to crypto
      const cryptoPrice = selectedCrypto === "BTC" ? btcPrice : ethPrice;
      const cryptoAmount = amount / cryptoPrice;
      const currentBalance = selectedCrypto === "BTC" ? currentBtcBalance : currentEthBalance;

      if (cryptoAmount > currentBalance) {
        toast.error(`Insufficient ${selectedCrypto} balance`);
        return;
      }

      // Deduct from selected crypto balance
      const updateData = selectedCrypto === "BTC" 
        ? { btc_balance: currentBtcBalance - cryptoAmount }
        : { eth_balance: currentEthBalance - cryptoAmount };

      const { error: updateError } = await supabase
        .from('user_accounts')
        .update(updateData)
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

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'investment',
          crypto_type: selectedCrypto,
          amount: amount,
          status: 'completed',
          description: `Investment in ${selectedPlan.name} plan using ${selectedCrypto}`
        });

      toast.success(`Successfully subscribed to ${selectedPlan.name} plan with $${amount} (${cryptoAmount.toFixed(8)} ${selectedCrypto})!`);
      setIsDialogOpen(false);
      setInvestmentAmount("");
      loadUserBalances();
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
                          <Label htmlFor="crypto">Pay with</Label>
                          <select 
                            id="crypto"
                            className="w-full p-2 border rounded-md bg-background"
                            value={selectedCrypto}
                            onChange={(e) => setSelectedCrypto(e.target.value as "BTC" | "ETH")}
                          >
                            <option value="BTC">Bitcoin (BTC) - Balance: {btcBalance.toFixed(8)}</option>
                            <option value="ETH">Ethereum (ETH) - Balance: {ethBalance.toFixed(8)}</option>
                          </select>
                        </div>
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
                          {investmentAmount && (
                            <p className="text-xs text-muted-foreground">
                              ≈ {(parseFloat(investmentAmount) / (selectedCrypto === "BTC" ? btcPrice : ethPrice)).toFixed(8)} {selectedCrypto}
                            </p>
                          )}
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
