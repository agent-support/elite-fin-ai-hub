import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Copy, TrendingUp, Wallet, DollarSign } from "lucide-react";
import { toast } from "sonner";

const DEMO_WALLETS = {
  btc: {
    address: "bc1qhwutfxhl9062uxjswwgc7dr4zv8fwkekm4u42s",
    balance: 0.5,
    value: 30000,
    change: 2.5
  },
  eth: {
    address: "0xc254e04bf79df093e821ba9e8e8f366e01b36d66",
    balance: 2.0,
    value: 5000,
    change: -1.2
  }
};

export const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} address copied to clipboard!`);
  };

  const totalValue = DEMO_WALLETS.btc.value + DEMO_WALLETS.eth.value;
  const overallChange = ((DEMO_WALLETS.btc.change + DEMO_WALLETS.eth.change) / 2).toFixed(2);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {localStorage.getItem("username")}!</h1>
        <p className="text-muted-foreground">Here's your portfolio overview</p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 gradient-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Portfolio Value</span>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">${totalValue.toLocaleString()}</div>
          <div className={`flex items-center gap-1 text-sm ${Number(overallChange) >= 0 ? 'text-success' : 'text-destructive'}`}>
            {Number(overallChange) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(Number(overallChange))}% (24h)
          </div>
        </Card>

        <Card className="p-6 gradient-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Active Trades</span>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">12</div>
          <div className="text-sm text-muted-foreground">3 pending orders</div>
        </Card>

        <Card className="p-6 gradient-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Available Balance</span>
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">$5,240</div>
          <div className="text-sm text-muted-foreground">Ready to trade</div>
        </Card>
      </div>

      {/* Wallet Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* BTC Wallet */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Bitcoin Wallet</h2>
            <div className="text-yellow-500 text-2xl">₿</div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Balance</div>
              <div className="text-2xl font-bold">{DEMO_WALLETS.btc.balance} BTC</div>
              <div className="text-muted-foreground">≈ ${DEMO_WALLETS.btc.value.toLocaleString()}</div>
              <div className={`flex items-center gap-1 text-sm mt-1 ${DEMO_WALLETS.btc.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                {DEMO_WALLETS.btc.change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(DEMO_WALLETS.btc.change)}% (24h)
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Wallet Address</div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-secondary p-2 rounded flex-1 overflow-hidden text-ellipsis">
                  {DEMO_WALLETS.btc.address}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(DEMO_WALLETS.btc.address, "BTC")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" variant="outline">Deposit</Button>
              <Button className="flex-1" variant="outline">Withdraw</Button>
            </div>
          </div>
        </Card>

        {/* ETH Wallet */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Ethereum Wallet</h2>
            <div className="text-purple-500 text-2xl">◈</div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Balance</div>
              <div className="text-2xl font-bold">{DEMO_WALLETS.eth.balance} ETH</div>
              <div className="text-muted-foreground">≈ ${DEMO_WALLETS.eth.value.toLocaleString()}</div>
              <div className={`flex items-center gap-1 text-sm mt-1 ${DEMO_WALLETS.eth.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                {DEMO_WALLETS.eth.change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(DEMO_WALLETS.eth.change)}% (24h)
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Wallet Address</div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-secondary p-2 rounded flex-1 overflow-hidden text-ellipsis">
                  {DEMO_WALLETS.eth.address}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(DEMO_WALLETS.eth.address, "ETH")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" variant="outline">Deposit</Button>
              <Button className="flex-1" variant="outline">Withdraw</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-20" onClick={() => navigate("/trade")}>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <div>Trade Now</div>
            </div>
          </Button>
          <Button className="h-20" variant="outline">
            <div className="text-center">
              <Wallet className="h-6 w-6 mx-auto mb-2" />
              <div>Deposit Funds</div>
            </div>
          </Button>
          <Button className="h-20" variant="outline" onClick={() => navigate("/research")}>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <div>Market Research</div>
            </div>
          </Button>
          <Button className="h-20" variant="outline" onClick={() => navigate("/education")}>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <div>Learn More</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};
