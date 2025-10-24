import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Copy, TrendingUp, Wallet, DollarSign, LineChart, X, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useInvestmentROI } from "@/hooks/useInvestmentROI";
import { TransactionList } from "@/components/TransactionList";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [btcPrice, setBtcPrice] = useState(60000);
  const [ethPrice, setEthPrice] = useState(2500);
  const [pricesLoading, setPricesLoading] = useState(true);
  
  const { totalROI, totalInvested, investments, refetch } = useInvestmentROI(userId);

  useEffect(() => {
    checkAuthAndLoadData();
    fetchCryptoPrices();

    // Update prices every 30 seconds
    const interval = setInterval(fetchCryptoPrices, 30000);
    
    // Set up real-time subscription for balance updates
    const channel = supabase
      .channel('user-accounts-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_accounts'
        },
        (payload) => {
          if (payload.new && userId && payload.new.user_id === userId) {
            setBalance(Number(payload.new.balance) || 0);
            setBtcBalance(Number(payload.new.btc_balance) || 0);
            setEthBalance(Number(payload.new.eth_balance) || 0);
            setDepositAddress(payload.new.deposit_address);
          }
        }
      )
      .subscribe();
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [navigate, userId]);

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'
      );
      const data = await response.json();
      
      if (data.bitcoin?.usd) {
        setBtcPrice(data.bitcoin.usd);
      }
      if (data.ethereum?.usd) {
        setEthPrice(data.ethereum.usd);
      }
      setPricesLoading(false);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      setPricesLoading(false);
    }
  };

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

  const handleCancelInvestment = async () => {
    if (!selectedInvestment) return;

    try {
      const { error } = await supabase
        .from('investments')
        .update({ status: 'cancelled' })
        .eq('id', selectedInvestment);

      if (error) throw error;

      toast.success("Investment cancelled successfully");
      refetch();
    } catch (error) {
      console.error('Error cancelling investment:', error);
      toast.error("Failed to cancel investment");
    } finally {
      setCancelDialogOpen(false);
      setSelectedInvestment(null);
    }
  };

  const handleConvertToMainBalance = async () => {
    if (!userId) return;

    try {
      // Calculate total ROI from all active investments
      const totalAmount = balance + totalROI + btcValue + ethValue;
      
      // Update user account - set main balance to total, reset crypto and ROI stays in investments
      const { error } = await supabase
        .from('user_accounts')
        .update({ 
          balance: totalAmount,
          btc_balance: 0,
          eth_balance: 0
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setBalance(totalAmount);
      setBtcBalance(0);
      setEthBalance(0);

      toast.success("Successfully converted all balances to main balance");
      setConvertDialogOpen(false);
    } catch (error) {
      console.error('Error converting balance:', error);
      toast.error("Failed to convert balance");
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 gradient-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Balance</span>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">${totalValue.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">USD + BTC + ETH combined</div>
        </Card>

        <Card className="p-6 gradient-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">BTC Balance</span>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{btcBalance.toFixed(8)} BTC</div>
          <div className="text-sm text-muted-foreground">${btcValue.toFixed(2)}</div>
        </Card>

        <Card className="p-6 gradient-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">ETH Balance</span>
            <LineChart className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{ethBalance.toFixed(8)} ETH</div>
          <div className="text-sm text-muted-foreground">${ethValue.toFixed(2)}</div>
        </Card>

        <Card className="p-6 gradient-card border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Current ROI</span>
            <LineChart className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-1 text-green-500">${totalROI.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Active profit</div>
        </Card>
      </div>

      {/* Convert to Main Balance Button */}
      {(totalROI > 0 || btcBalance > 0 || ethBalance > 0) && (
        <Card className="p-6 mb-8 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Convert to Main Balance</h3>
              <p className="text-sm text-muted-foreground">
                Convert your ROI, BTC, and ETH to main balance before withdrawing
              </p>
              <p className="text-sm font-semibold mt-2">
                Total Available: ${(balance + totalROI + btcValue + ethValue).toFixed(2)}
              </p>
            </div>
            <Button onClick={() => setConvertDialogOpen(true)} className="gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Convert All
            </Button>
          </div>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recent Transactions</h2>
          <Button variant="outline" onClick={() => navigate("/transactions")}>
            View All
          </Button>
        </div>
        <TransactionList userId={userId} limit={5} />
      </Card>

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
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">Active</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedInvestment(inv.id);
                          setCancelDialogOpen(true);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
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

      {/* Cancel Investment Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Investment Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this trade? The ROI calculation will stop immediately and the investment will be marked as cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Continue Trade</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelInvestment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Cancel Trade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert to Main Balance Dialog */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convert to Main Balance</AlertDialogTitle>
            <AlertDialogDescription>
              This will convert all your ROI, BTC balance (${btcValue.toFixed(2)}), and ETH balance (${ethValue.toFixed(2)}) to your main balance. Your total main balance will be ${(balance + totalROI + btcValue + ethValue).toFixed(2)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvertToMainBalance}>
              Convert Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
