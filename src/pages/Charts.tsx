import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CoinGeckoPrice {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

const fetchChartData = async (coinId: string): Promise<CoinGeckoPrice> => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`
  );
  if (!response.ok) throw new Error("Failed to fetch chart data");
  return response.json();
};

const fetchCurrentPrice = async (coinId: string) => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
  );
  if (!response.ok) throw new Error("Failed to fetch price");
  return response.json();
};

const CryptoChart = ({ coinId, coinName }: { coinId: string; coinName: string }) => {
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["chartData", coinId],
    queryFn: () => fetchChartData(coinId),
    refetchInterval: 60000,
  });

  const { data: priceData } = useQuery({
    queryKey: ["price", coinId],
    queryFn: () => fetchCurrentPrice(coinId),
    refetchInterval: 30000,
  });

  const formattedData = chartData?.prices.map(([timestamp, price]) => ({
    time: new Date(timestamp).toLocaleDateString(),
    price: price,
  })) || [];

  const currentPrice = priceData?.[coinId]?.usd || 0;
  const priceChange = priceData?.[coinId]?.usd_24h_change || 0;
  const isPositive = priceChange >= 0;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{coinName}</h2>
        <div className="flex items-center gap-4">
          <span className="text-4xl font-bold">${currentPrice.toLocaleString()}</span>
          <span className={`flex items-center gap-1 text-lg font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            {Math.abs(priceChange).toFixed(2)}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">24h Change</p>
      </div>

      {chartLoading ? (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart...</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="time" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export const Charts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Live Crypto Charts</h1>

      <Tabs defaultValue="bitcoin" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="bitcoin">Bitcoin (BTC)</TabsTrigger>
          <TabsTrigger value="ethereum">Ethereum (ETH)</TabsTrigger>
        </TabsList>

        <TabsContent value="bitcoin">
          <CryptoChart coinId="bitcoin" coinName="Bitcoin (BTC)" />
        </TabsContent>

        <TabsContent value="ethereum">
          <CryptoChart coinId="ethereum" coinName="Ethereum (ETH)" />
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Charts show 7-day price history with real-time updates from CoinGecko API. 
          Data refreshes automatically every minute.
        </p>
      </div>
    </div>
  );
};