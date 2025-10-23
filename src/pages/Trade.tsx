import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Search, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

const cryptoData = [
  { symbol: "BTC", name: "Bitcoin", price: 60000, change: 2.5 },
  { symbol: "ETH", name: "Ethereum", price: 2500, change: -1.2 },
  { symbol: "BNB", name: "Binance Coin", price: 350, change: 3.1 },
  { symbol: "SOL", name: "Solana", price: 125, change: 5.4 },
  { symbol: "ADA", name: "Cardano", price: 0.45, change: -0.8 }
];

export const Trade = () => {
  const navigate = useNavigate();
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoData[0]);
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [sliderValue, setSliderValue] = useState([50]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  const handleTrade = (action: "buy" | "sell") => {
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }

    const total = Number(amount) * selectedCrypto.price;
    toast.success(
      `${action.toUpperCase()} order placed successfully!\n${amount} ${selectedCrypto.symbol} ≈ $${total.toFixed(2)}`
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Trade Crypto</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Selection */}
        <Card className="lg:col-span-1 p-6">
          <div className="mb-4">
            <Label>Search Market</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search crypto..." className="pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            {cryptoData.map((crypto) => (
              <button
                key={crypto.symbol}
                onClick={() => setSelectedCrypto(crypto)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedCrypto.symbol === crypto.symbol
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{crypto.symbol}</div>
                    <div className="text-sm opacity-80">{crypto.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${crypto.price.toLocaleString()}</div>
                    <div className={`text-sm flex items-center gap-1 ${crypto.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {crypto.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(crypto.change)}%
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Trading Interface */}
        <Card className="lg:col-span-2 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{selectedCrypto.name} ({selectedCrypto.symbol})</h2>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">${selectedCrypto.price.toLocaleString()}</div>
              <div className={`flex items-center gap-1 ${selectedCrypto.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                {selectedCrypto.change >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                {Math.abs(selectedCrypto.change)}% (24h)
              </div>
            </div>
          </div>

          <Tabs defaultValue="buy" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label>Order Type</Label>
                  <Select value={orderType} onValueChange={(v) => setOrderType(v as any)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market Order</SelectItem>
                      <SelectItem value="limit">Limit Order</SelectItem>
                      <SelectItem value="stop">Stop Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {orderType !== "market" && (
                  <div>
                    <Label>Price (USD)</Label>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}

                <div>
                  <Label>Amount ({selectedCrypto.symbol})</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Amount (%)</Label>
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="bg-secondary p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="font-semibold">
                      ${amount ? (Number(amount) * selectedCrypto.price).toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="font-semibold text-success">$0.00 (Zero Fees!)</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleTrade("buy")}
                  className="w-full bg-success hover:bg-success/90 text-success-foreground glow-success"
                >
                  Buy {selectedCrypto.symbol}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="sell" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label>Order Type</Label>
                  <Select value={orderType} onValueChange={(v) => setOrderType(v as any)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market Order</SelectItem>
                      <SelectItem value="limit">Limit Order</SelectItem>
                      <SelectItem value="stop">Stop Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {orderType !== "market" && (
                  <div>
                    <Label>Price (USD)</Label>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}

                <div>
                  <Label>Amount ({selectedCrypto.symbol})</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Amount (%)</Label>
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="bg-secondary p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Total Receive</span>
                    <span className="font-semibold">
                      ${amount ? (Number(amount) * selectedCrypto.price).toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="font-semibold text-success">$0.00 (Zero Fees!)</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleTrade("sell")}
                  className="w-full bg-destructive hover:bg-destructive/90"
                >
                  Sell {selectedCrypto.symbol}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};
