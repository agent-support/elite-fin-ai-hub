import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Copy, TrendingUp, Wallet, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoadData();
  }, [navigate]);

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/login");
      return;
    }

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 gradient-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Portfolio Value</span>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">${totalValue.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">
            USD: ${balance.toFixed(2)} | BTC: {btcBalance.toFixed(8)} | ETH: {ethBalance.toFixed(8)}
          </div>
        </Card>

        <Card className="p-6 gradient-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">BTC Holdings</span>
            <span className="text-yellow-500 text-2xl">₿</span>
          </div>
          <div className="text-3xl font-bold mb-1">{btcBalance.toFixed(8)} BTC</div>
          <div className="text-sm text-muted-foreground">≈ ${btcValue.toFixed(2)}</div>
        </Card>

        <Card className="p-6 gradient-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">ETH Holdings</span>
            <span className="text-purple-500 text-2xl">◈</span>
          </div>
          <div className="text-3xl font-bold mb-1">{ethBalance.toFixed(8)} ETH</div>
          <div className="text-sm text-muted-foreground">≈ ${ethValue.toFixed(2)}</div>
        </Card>
      </div>

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
          <Button className="h-20" onClick={() => navigate("/charts")}>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
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
          <Button className="h-20" variant="outline" onClick={() => navigate("/research")}>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <div>Market Research</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};
