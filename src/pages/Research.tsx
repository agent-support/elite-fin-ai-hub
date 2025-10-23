import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Newspaper } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const newsArticles = [
  {
    title: "Bitcoin Surges Past $60,000 as Institutional Interest Grows",
    source: "CryptoNews",
    time: "2 hours ago",
    category: "Bitcoin"
  },
  {
    title: "Ethereum 2.0 Upgrade Shows Promising Results",
    source: "BlockchainDaily",
    time: "5 hours ago",
    category: "Ethereum"
  },
  {
    title: "Regulatory Clarity Boosts Crypto Market Confidence",
    source: "FinanceTimes",
    time: "1 day ago",
    category: "Regulation"
  }
];

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

const fetchCryptoData = async (): Promise<CoinGeckoMarket[]> => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,cardano&order=market_cap_desc&sparkline=false&price_change_percentage=24h'
  );
  if (!response.ok) throw new Error('Failed to fetch crypto data');
  return response.json();
};

const formatMarketCap = (value: number): string => {
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  return value.toFixed(0);
};

export const Research = () => {
  const { data: cryptoData, isLoading } = useQuery({
    queryKey: ['cryptoMarkets'],
    queryFn: fetchCryptoData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const [analystRatings, setAnalystRatings] = useState([
    { symbol: "BTC", name: "Bitcoin", rating: "Strong Buy", target: 75000, current: 60000 },
    { symbol: "ETH", name: "Ethereum", rating: "Buy", target: 3200, current: 2500 },
    { symbol: "BNB", name: "Binance Coin", rating: "Hold", target: 380, current: 350 },
    { symbol: "SOL", name: "Solana", rating: "Buy", target: 180, current: 125 }
  ]);

  // Update analyst ratings when crypto data changes
  useEffect(() => {
    if (cryptoData) {
      setAnalystRatings(prev => prev.map(rating => {
        const liveData = cryptoData.find(c => c.symbol.toUpperCase() === rating.symbol);
        return liveData ? { ...rating, current: liveData.current_price } : rating;
      }));
    }
  }, [cryptoData]);
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Market Research</h1>

      <Tabs defaultValue="markets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="markets">Markets</TabsTrigger>
          <TabsTrigger value="news">News Feed</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="markets" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Top Cryptocurrencies</h2>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading live market data...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2">Asset</th>
                      <th className="text-right py-3 px-2">Price</th>
                      <th className="text-right py-3 px-2">24h Change</th>
                      <th className="text-right py-3 px-2">Market Cap</th>
                      <th className="text-right py-3 px-2">Volume (24h)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cryptoData?.map((crypto) => (
                      <tr key={crypto.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-4 px-2">
                          <div>
                            <div className="font-semibold">{crypto.symbol.toUpperCase()}</div>
                            <div className="text-sm text-muted-foreground">{crypto.name}</div>
                          </div>
                        </td>
                        <td className="text-right py-4 px-2 font-semibold">
                          ${crypto.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="text-right py-4 px-2">
                          <div className={`flex items-center justify-end gap-1 ${crypto.price_change_percentage_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {crypto.price_change_percentage_24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {Math.abs(crypto.price_change_percentage_24h).toFixed(1)}%
                          </div>
                        </td>
                        <td className="text-right py-4 px-2">${formatMarketCap(crypto.market_cap)}</td>
                        <td className="text-right py-4 px-2">${formatMarketCap(crypto.total_volume)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="news" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Newspaper className="h-6 w-6" />
              Latest Crypto News
            </h2>
            <div className="space-y-4">
              {newsArticles.map((article, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{article.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{article.time}</span>
                      </div>
                    </div>
                    <Badge variant="outline">{article.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Analyst Ratings & Price Targets</h2>
            <div className="space-y-4">
              {analystRatings.map((rating) => {
                const potentialGain = ((rating.target - rating.current) / rating.current * 100).toFixed(1);
                const isPositive = Number(potentialGain) > 0;
                
                return (
                  <div key={rating.symbol} className="p-4 rounded-lg bg-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-lg">{rating.symbol}</div>
                        <div className="text-sm text-muted-foreground">{rating.name}</div>
                      </div>
                      <Badge
                        variant={
                          rating.rating === "Strong Buy" || rating.rating === "Buy"
                            ? "default"
                            : "outline"
                        }
                        className={
                          rating.rating === "Strong Buy"
                            ? "bg-success text-success-foreground"
                            : rating.rating === "Buy"
                            ? "bg-primary text-primary-foreground"
                            : ""
                        }
                      >
                        {rating.rating}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Current Price</div>
                        <div className="font-semibold">${rating.current.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Target Price</div>
                        <div className="font-semibold">${rating.target.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Potential</div>
                        <div className={`font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          {isPositive ? '+' : ''}{potentialGain}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
