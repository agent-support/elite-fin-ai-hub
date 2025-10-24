import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Copy, CheckCircle, Bitcoin, Wallet } from "lucide-react";
import ethQR from "@/assets/eth-qr.png";
import btcQR from "@/assets/btc-qr.png";
import { supabase } from "@/integrations/supabase/client";

const WALLETS = {
  BTC: {
    address: "bc1qhwutfxhl9062uxjswwgc7dr4zv8fwkekm4u42s",
    name: "Bitcoin",
    icon: Bitcoin,
    network: "BTC (Bitcoin Network)",
  },
  ETH: {
    address: "0xc254e04bf79df093e821ba9e8e8f366e01b36d66",
    name: "Ethereum",
    icon: Wallet,
    network: "ETH (Ethereum Network)",
  },
};

const Deposit = () => {
  const navigate = useNavigate();
  const [depositAmount, setDepositAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(type);
    toast.success(`${type} address copied to clipboard!`);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleConfirmDeposit = async (crypto: keyof typeof WALLETS) => {
    const amount = parseFloat(depositAmount);
    if (!depositAmount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!txHash) {
      toast.error("Please enter transaction hash");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to deposit");
        return;
      }

      // Create deposit request
      const { error: depositError } = await supabase
        .from('deposit_requests')
        .insert({
          user_id: user.id,
          amount: amount,
          crypto_type: crypto,
          transaction_hash: txHash,
          status: 'pending'
        });

      if (depositError) throw depositError;

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount: amount,
          crypto_type: crypto,
          status: 'pending',
          description: `Deposit of ${amount} ${crypto} - Pending admin approval`
        });

      toast.success(`Deposit request submitted! Your ${amount} ${crypto} deposit is pending admin approval.`);
      setDepositAmount("");
      setTxHash("");
    } catch (error) {
      console.error('Error submitting deposit:', error);
      toast.error('Failed to submit deposit request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Deposit Funds Securely</h1>
          <p className="text-muted-foreground">
            Send cryptocurrency to your wallet addresses below. Funds appear instantly!
          </p>
        </div>

        <Tabs defaultValue="BTC" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="BTC" className="flex items-center gap-2">
              <Bitcoin className="h-4 w-4" />
              Bitcoin (BTC)
            </TabsTrigger>
            <TabsTrigger value="ETH" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Ethereum (ETH)
            </TabsTrigger>
          </TabsList>

          {Object.entries(WALLETS).map(([crypto, wallet]) => {
            const Icon = wallet.icon;
            return (
              <TabsContent key={crypto} value={crypto}>
                <Card className="bg-card border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-6 w-6 text-primary" />
                      Deposit {wallet.name}
                    </CardTitle>
                    <CardDescription>Network: {wallet.network}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Wallet Address */}
                    <div className="space-y-3">
                      <Label>Your {wallet.name} Deposit Address</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={wallet.address}
                          readOnly
                          className="font-mono text-sm bg-muted"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(wallet.address, crypto)}
                        >
                          {copiedAddress === crypto ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white p-6 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <img 
                          src={crypto === "BTC" ? btcQR : ethQR} 
                          alt={`${crypto} QR Code`}
                          className="w-64 h-64 mx-auto rounded-lg mb-2"
                        />
                        <p className="text-sm text-gray-600">Scan to deposit {crypto}</p>
                      </div>
                    </div>

                    {/* Deposit Confirmation Form */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold">Confirm Your Deposit</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`amount-${crypto}`}>Amount ({crypto})</Label>
                        <Input
                          id={`amount-${crypto}`}
                          type="number"
                          step="0.00001"
                          placeholder={`Enter ${crypto} amount`}
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`tx-${crypto}`}>Transaction Hash</Label>
                        <Input
                          id={`tx-${crypto}`}
                          placeholder="Enter transaction hash from your wallet"
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value)}
                        />
                      </div>

                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => handleConfirmDeposit(crypto as keyof typeof WALLETS)}
                      >
                        Confirm Deposit
                      </Button>
                    </div>

                    {/* Instructions */}
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <h4 className="font-semibold text-sm">Deposit Instructions:</h4>
                      <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                        <li>Copy the wallet address above or scan the QR code</li>
                        <li>Send {crypto} from your external wallet to this address</li>
                        <li>Enter the amount and transaction hash above</li>
                        <li>Click "Confirm Deposit" - funds appear instantly!</li>
                      </ol>
                      <p className="text-xs text-yellow-500 mt-3">
                        ⚠️ Important: Only send {wallet.name} to this address. Sending other coins may result in permanent loss.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

export default Deposit;
