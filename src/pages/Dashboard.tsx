import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Copy, TrendingUp, Wallet, DollarSign, LineChart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useInvestmentROI } from "@/hooks/useInvestmentROI";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();
  
  const { totalROI, totalInvested, investments } = useInvestmentROI(userId);

  useEffect(() => {
    checkAuthAndLoadData();
  }, [navigate]);

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/login");
      return;
    }

    setUserId(user.id);

    // Fetch user account data
    const { data: account, error } = await supabase
      .from("user_accounts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading account:", error);
      toast.error("Failed to load account data");
    } else if (account) {
      setBalance(Number(account.balance) || 0);
      setBtcBalance(Number(account.btc_balance) || 0);
      setEthBalance(Number(account.eth_balance) || 0);
      setDepositAddress(account.deposit_address);
    }

    setLoading(false);
  };

  const copyToClipboard = (text: string, type: string) => {
    if (!text) {
      toast.error("No deposit address set");
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success(`${type} address copied to clipboard!`);
  };

  const btcPrice = 60000;
  const ethPrice = 2500;
  const btcValue = btcBalance * btcPrice;
  const ethValue = ethBalance * ethPrice;
  const totalValue = balance + btcValue + ethValue;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {localStorage.getItem("username") || "Trader"}!</h1>
        <p className="text-muted-foreground">Here's your portfolio overview</p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 gradient-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Account Balance</span>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">${balance.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Available funds</div>
        </Card>

        <Card className="p-6 gradient-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Invested</span>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold mb-1">${totalInvested.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">{investments.length} active plan{investments.length !== 1 ? 's' : ''}</div>
        </Card>

        <Card className="p-6 gradient-card border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Current ROI</span>
            <LineChart className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-1 text-green-500">${totalROI.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Profit earned</div>
        </Card>

        <Card className="p-6 gradient-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Value</span>
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">${(balance + totalInvested + totalROI).toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Balance + Investments + ROI</div>
        </Card>
      </div>

      {/* Active Investments */}
      {investments.length > 0 && (
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Active Investment Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investments.map((inv) => {
              const hoursSinceStart = (new Date().getTime() - new Date(inv.start_date).getTime()) / (1000 * 60 * 60);
              const currentROI = (inv.amount * (inv.daily_yield / 24) * hoursSinceStart) / 100;
              const dailyExpected = (inv.amount * inv.daily_yield) / 100;
              
              return (
                <Card key={inv.id} className="p-4 border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{inv.plan_name}</h3>
                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">Active</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invested:</span>
                      <span className="font-semibold">${inv.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Yield:</span>
                      <span className="font-semibold text-primary">{inv.daily_yield}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current ROI:</span>
                      <span className="font-semibold text-green-500">${currentROI.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected/Day:</span>
                      <span className="font-semibold">${dailyExpected.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Running for {hoursSinceStart.toFixed(1)} hours
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      {/* Wallet Information */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Deposit Address</h2>
        {depositAddress ? (
          <div className="flex items-center gap-2">
            <code className="text-sm bg-secondary p-3 rounded flex-1 overflow-hidden text-ellipsis">
              {depositAddress}
            </code>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(depositAddress, "Deposit")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">No deposit address set. Contact admin to set up your deposit address.</p>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-20" onClick={() => navigate("/investment-plans")}>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <div>Investment Plans</div>
            </div>
          </Button>
          <Button className="h-20" variant="outline" onClick={() => navigate("/charts")}>
            <div className="text-center">
              <LineChart className="h-6 w-6 mx-auto mb-2" />
              <div>View Charts</div>
            </div>
          </Button>
          <Button className="h-20" variant="outline" onClick={() => navigate("/deposit")}>
            <div className="text-center">
              <Wallet className="h-6 w-6 mx-auto mb-2" />
              <div>Deposit Funds</div>
            </div>
          </Button>
          <Button className="h-20" variant="outline" onClick={() => navigate("/withdraw")}>
            <div className="text-center">
              <ArrowDownRight className="h-6 w-6 mx-auto mb-2" />
              <div>Withdraw</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};
