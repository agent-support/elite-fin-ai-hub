import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export const CryptoTicker = () => {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,tether,solana&order=market_cap_desc&per_page=5&page=1&sparkline=false'
        );
        const data = await response.json();
        setPrices(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-card/50 backdrop-blur-sm border-y border-border py-4">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">Loading live prices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm border-y border-border py-4 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          {prices.map((crypto) => (
            <div
              key={crypto.id}
              className="flex items-center gap-3 min-w-fit bg-background/50 rounded-lg px-4 py-2"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground uppercase">
                  {crypto.symbol}
                </span>
                <span className="text-xs text-muted-foreground">{crypto.name}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-foreground">
                  ${crypto.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div
                  className={`flex items-center gap-1 text-xs ${
                    crypto.price_change_percentage_24h >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {crypto.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
