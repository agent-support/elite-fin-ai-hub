import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowUpCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Withdraw = () => {
  const navigate = useNavigate();
  const [crypto, setCrypto] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("BTC");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [accountBalance, setAccountBalance] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch all balances
      const { data: account } = await supabase
        .from("user_accounts")
        .select("balance, btc_balance, eth_balance")
        .eq("user_id", user.id)
        .single();

      if (account) {
        setAccountBalance(Number(account.balance) || 0);
        setBtcBalance(Number(account.btc_balance) || 0);
        setEthBalance(Number(account.eth_balance) || 0);
      }
    };

    checkAuth();
  }, [navigate]);

  const cryptoPrices = {
    BTC: 60000,
    ETH: 3000,
  };

  const getFee = () => {
    return crypto === "BTC" ? 0.0001 : 0.001;
  };

  const getCurrentBalance = () => {
    return crypto === "BTC" ? btcBalance : ethBalance;
  };

  const getMaxAmount = () => {
    return getCurrentBalance().toFixed(8);
  };

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    
    if (!amount || isNaN(withdrawAmount) || withdrawAmount < 0.0001) {
      toast.error("Minimum withdrawal is 0.0001");
      return;
    }

    if (!address) {
      toast.error("Please enter a valid withdrawal address");
      return;
    }

    const price = cryptoPrices[crypto as keyof typeof cryptoPrices];
    const usdValue = withdrawAmount * price;
    
    if (usdValue < 10000) {
      toast.error("Minimum withdrawal amount is $10,000");
      return;
    }
    
    const currentBalance = getCurrentBalance();
    if (withdrawAmount > currentBalance) {
      toast.error(`Insufficient ${crypto} balance. You have ${currentBalance.toFixed(8)} ${crypto}`);
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    const price = cryptoPrices[crypto as keyof typeof cryptoPrices];
    const usdValue = withdrawAmount * price;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create withdrawal request
      const { error: withdrawalError } = await supabase
        .from("withdrawal_requests")
        .insert({
          user_id: user.id,
          amount: usdValue,
          crypto_type: crypto,
          wallet_address: address,
          status: "pending"
        });

      if (withdrawalError) throw withdrawalError;

      // Update the correct balance based on crypto type
      const updateData = crypto === "BTC" 
        ? { btc_balance: btcBalance - withdrawAmount }
        : { eth_balance: ethBalance - withdrawAmount };

      const { error: balanceError } = await supabase
        .from("user_accounts")
        .update(updateData)
        .eq("user_id", user.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'withdrawal',
          crypto_type: crypto,
          amount: usdValue,
          status: 'pending',
          description: `Withdrawal of ${withdrawAmount} ${crypto} to ${address.slice(0, 10)}...`
        });

      toast.success(`Withdrawal request submitted! ${withdrawAmount} ${crypto} will be processed soon.`);
      setShowConfirmDialog(false);
      setAmount("");
      setAddress("");
      
      // Update local state
      if (crypto === "BTC") {
        setBtcBalance(btcBalance - withdrawAmount);
      } else {
        setEthBalance(ethBalance - withdrawAmount);
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error("Failed to process withdrawal request");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <ArrowUpCircle className="h-10 w-10 text-primary" />
            Withdraw Funds
          </h1>
          <p className="text-muted-foreground">
            Fast and secure withdrawals - processed within minutes
          </p>
        </div>

        <Card className="bg-card border-primary/20">
          <CardHeader>
            <CardTitle>Withdrawal Details</CardTitle>
            <CardDescription>
              Available {crypto}: {getCurrentBalance().toFixed(8)} | Minimum Withdrawal: $10,000
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Select Crypto */}
            <div className="space-y-2">
              <Label htmlFor="crypto">Select Cryptocurrency</Label>
              <Select value={crypto} onValueChange={setCrypto}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Network */}
            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">BTC (Bitcoin Network)</SelectItem>
                  <SelectItem value="ETH">ETH (Ethereum Network)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Amount ({crypto})</Label>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs"
                  onClick={() => setAmount(getMaxAmount())}
                >
                  Max: {getMaxAmount()} {crypto}
                </Button>
              </div>
              <Input
                id="amount"
                type="number"
                step="0.00001"
                placeholder={`Min: 0.0001 ${crypto}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {amount && (
                <p className="text-sm text-muted-foreground">
                  ≈ ${(parseFloat(amount) * cryptoPrices[crypto as keyof typeof cryptoPrices]).toLocaleString()}
                </p>
              )}
            </div>

            {/* Destination Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Destination Address</Label>
              <Input
                id="address"
                placeholder={`Enter ${crypto} address`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            {/* Fee Preview */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Withdrawal Amount:</span>
                <span className="font-semibold">{amount || "0"} {crypto}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Network Fee:</span>
                <span className="font-semibold">{getFee()} {crypto}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span>You will receive:</span>
                <span className="font-bold text-green-500">
                  {amount ? (parseFloat(amount) - getFee()).toFixed(8) : "0"} {crypto}
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-semibold text-yellow-500">Important Warning:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Withdrawing from your {crypto} balance</li>
                  <li>Withdrawals are irreversible once confirmed</li>
                  <li>Double-check the destination address</li>
                  <li>Ensure you've selected the correct network</li>
                  <li>Wrong address/network may result in permanent loss</li>
                </ul>
              </div>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleWithdraw}
            >
              Submit Withdrawal Request
            </Button>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Withdrawal</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to withdraw {amount} {crypto} to:
                <div className="mt-2 p-2 bg-muted rounded font-mono text-xs break-all">
                  {address}
                </div>
                <p className="mt-2 text-red-500 font-semibold">
                  This action is irreversible. Please verify all details carefully.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmWithdraw} className="bg-primary hover:bg-primary/90">
                Confirm Withdrawal
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Withdraw;
