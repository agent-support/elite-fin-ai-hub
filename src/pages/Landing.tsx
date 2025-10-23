import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ForexPair {
  pair: string;
  bid: string;
  ask: string;
  trend: "up" | "down";
}

export default function Landing() {
  const navigate = useNavigate();
  const [currentHero, setCurrentHero] = useState(0);
  const [forexData, setForexData] = useState<ForexPair[]>([
    { pair: "EURGBP", bid: "0.8695", ask: "0.8694", trend: "up" },
    { pair: "EURJPY", bid: "176.80", ask: "176.81", trend: "down" },
    { pair: "EURUSD", bid: "1.1597", ask: "1.1596", trend: "up" },
    { pair: "GAUCNH", bid: "939.07", ask: "939.38", trend: "down" },
    { pair: "GBPAUD", bid: "2.0558", ask: "2.0561", trend: "up" },
    { pair: "AUDUSD", bid: "0.6487", ask: "0.64875", trend: "down" },
    { pair: "CADCHF", bid: "0.5696", ask: "0.56967", trend: "up" },
    { pair: "CADJPY", bid: "108.92", ask: "108.93", trend: "down" },
  ]);

  // Auto-scroll heroes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update forex prices every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setForexData((prev) =>
        prev.map((pair) => ({
          ...pair,
          bid: (parseFloat(pair.bid) + (Math.random() - 0.5) * 0.01).toFixed(5),
          ask: (parseFloat(pair.ask) + (Math.random() - 0.5) * 0.01).toFixed(5),
          trend: Math.random() > 0.5 ? "up" : "down",
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Sections */}
      <div className="relative overflow-hidden">
        {/* Hero 1: Starbucks Promo */}
        <section
          className={`min-h-[80vh] relative bg-primary transition-opacity duration-1000 ${
            currentHero === 0 ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 31, 63, 0.95), rgba(0, 31, 63, 0.95)), repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(255, 255, 255, 0.05) 35px, rgba(255, 255, 255, 0.05) 70px), repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(255, 255, 255, 0.05) 35px, rgba(255, 255, 255, 0.05) 70px)",
          }}
        >
          <div className="container mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
              <ArrowUp className="h-12 w-12 text-accent mx-auto md:mx-0 mb-4" />
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                Sign-up and get a<br />Starbucks Coffee
              </h1>
              <p className="text-xl text-white/80 mb-8">For Activation Accounts</p>
              <div className="flex gap-4 justify-center md:justify-start">
                <Button
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  Login
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate("/signup")}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  Open an Account
                </Button>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=600"
                alt="Professional woman with thumbs up registering for forex trading"
                className="w-64 md:w-96 rounded-lg shadow-2xl"
              />
            </div>
          </div>

          {/* Live Forex Ticker */}
          <div className="absolute bottom-20 left-0 right-0 bg-primary/50 backdrop-blur-sm py-4 overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...forexData, ...forexData].map((pair, idx) => (
                <div key={idx} className="inline-flex items-center mx-6 text-white">
                  <span className="font-semibold mr-2">{pair.pair}</span>
                  <span className="mr-1">{pair.bid}/{pair.ask}</span>
                  {pair.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Footer Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-primary py-4 px-6 text-white text-sm border-t border-white/10">
            <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
              <span className="text-white/60">*T&Cs Apply HF.9245/9245</span>
              <div className="flex flex-wrap gap-6">
                <span className="flex items-center gap-2">
                  <span className="bg-accent/20 px-3 py-1 rounded">90+ Trading Instruments</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="bg-accent/20 px-3 py-1 rounded">1:2000 Flexible Leverage</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="bg-accent/20 px-3 py-1 rounded">Zero Commission</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="bg-accent/20 px-3 py-1 rounded">24/7 Client Support</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="bg-accent/20 px-3 py-1 rounded">Low Spread</span>
                </span>
              </div>
              <div className="flex gap-4 text-xs">
                <span>EURUSD 1.1597/1.1596</span>
                <span>GBPAUD 2.0558/2.0561</span>
              </div>
            </div>
          </div>
        </section>

        {/* Hero 2: $50 Bonus */}
        <section
          className={`min-h-[80vh] relative bg-primary transition-opacity duration-1000 ${
            currentHero === 1 ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 31, 63, 0.95), rgba(0, 31, 63, 0.95)), repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(255, 255, 255, 0.05) 35px, rgba(255, 255, 255, 0.05) 70px), repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(255, 255, 255, 0.05) 35px, rgba(255, 255, 255, 0.05) 70px)",
          }}
        >
          <div className="container mx-auto px-6 py-20 text-center">
            <ArrowUp className="h-12 w-12 text-accent mx-auto mb-4" />
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
              <span className="text-accent">REGISTER NOW</span>
            </h1>
            <p className="text-4xl md:text-6xl font-bold text-white mb-12">
              GET $50 INSTANTLY!
            </p>
            <div className="mb-12">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&h=400"
                alt="Hands on tablet showing rising forex profit chart with green arrows"
                className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl"
              />
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                Login
              </Button>
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                Open an Account
              </Button>
            </div>
          </div>

          {/* Live Forex Ticker */}
          <div className="absolute bottom-20 left-0 right-0 bg-primary/50 backdrop-blur-sm py-4 overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...forexData, ...forexData].map((pair, idx) => (
                <div key={idx} className="inline-flex items-center mx-6 text-white">
                  <span className="font-semibold mr-2">{pair.pair}</span>
                  <span className="mr-1">{pair.bid}/{pair.ask}</span>
                  {pair.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Footer Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-primary py-4 px-6 text-white text-sm border-t border-white/10">
            <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
              <span className="text-white/60">*Your capital is at risk. 13154</span>
              <div className="flex flex-wrap gap-6">
                <span className="flex items-center gap-2">
                  <span className="bg-accent/20 px-3 py-1 rounded">90+ Trading Instruments</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="bg-accent/20 px-3 py-1 rounded">1:2000 Flexible Leverage</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="bg-accent/20 px-3 py-1 rounded">Zero Commission</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="bg-accent/20 px-3 py-1 rounded">24/7 Client Support</span>
                </span>
              </div>
              <div className="flex gap-4 text-xs">
                <span>AUDUSD 0.6487/0.64875</span>
                <span>CADJPY 108.92/108.93</span>
              </div>
            </div>
          </div>
        </section>

        {/* Hero 3: Markets to Trade */}
        <section
          className={`min-h-[80vh] relative bg-primary transition-opacity duration-1000 ${
            currentHero === 2 ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 31, 63, 0.95), rgba(0, 31, 63, 0.95)), repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(255, 255, 255, 0.05) 35px, rgba(255, 255, 255, 0.05) 70px), repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(255, 255, 255, 0.05) 35px, rgba(255, 255, 255, 0.05) 70px)",
          }}
        >
          <div className="container mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-8 md:mb-0">
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&h=400"
                alt="Diverse traders registering on devices showing EUR/USD profit chart"
                className="w-full rounded-lg shadow-2xl"
              />
            </div>
            <div className="flex-1 text-center md:text-right md:pl-12">
              <ArrowUp className="h-12 w-12 text-accent mx-auto md:ml-auto mb-4" />
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                Markets to Trade
              </h1>
              <p className="text-2xl text-white/80 mb-8">Join Profitable Traders Today</p>
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                Start Trading
              </Button>
              <div className="mt-8">
                <ArrowUp className="h-20 w-20 text-success mx-auto md:ml-auto animate-bounce" />
                <p className="text-xl text-success font-bold mt-2">Unlock Forex Profits Now</p>
              </div>
            </div>
          </div>

          {/* Live Forex Ticker */}
          <div className="absolute bottom-20 left-0 right-0 bg-primary/50 backdrop-blur-sm py-4 overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...forexData, ...forexData].map((pair, idx) => (
                <div key={idx} className="inline-flex items-center mx-6 text-white">
                  <span className="font-semibold mr-2">{pair.pair}</span>
                  <span className="mr-1">{pair.bid}/{pair.ask}</span>
                  {pair.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Footer Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-primary py-4 px-6 text-white text-sm border-t border-white/10">
            <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
              <span className="text-white/60">*T&Cs Apply HF.9245/9245</span>
              <div className="flex flex-wrap gap-6">
                <span className="flex items-center gap-2">
                  <span className="bg-accent/20 px-3 py-1 rounded">90+ Trading Instruments</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="bg-accent/20 px-3 py-1 rounded">1:2000 Flexible Leverage</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="bg-accent/20 px-3 py-1 rounded">Zero Commission</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="bg-accent/20 px-3 py-1 rounded">Low Spread</span>
                </span>
              </div>
              <div className="flex gap-4 text-xs">
                <span>CADCHF 0.5696/0.56967</span>
                <span>GAUCNH 939.07/939.38</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Hero Navigation Dots */}
      <div className="flex justify-center gap-3 py-6 bg-background">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            onClick={() => setCurrentHero(idx)}
            className={`h-3 w-3 rounded-full transition-all ${
              currentHero === idx ? "bg-accent w-8" : "bg-muted"
            }`}
            aria-label={`Go to hero ${idx + 1}`}
          />
        ))}
      </div>

      {/* Trust Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Trusted by 500K+ Traders Worldwide</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="p-6 bg-background rounded-lg">
              <div className="text-5xl font-bold text-accent mb-2">500K+</div>
              <p className="text-muted-foreground">Active Traders</p>
            </div>
            <div className="p-6 bg-background rounded-lg">
              <div className="text-5xl font-bold text-accent mb-2">$10B</div>
              <p className="text-muted-foreground">Assets Under Management</p>
            </div>
            <div className="p-6 bg-background rounded-lg">
              <div className="text-5xl font-bold text-accent mb-2">24/7</div>
              <p className="text-muted-foreground">Customer Support</p>
            </div>
            <div className="p-6 bg-background rounded-lg">
              <div className="text-5xl font-bold text-accent mb-2">0%</div>
              <p className="text-muted-foreground">Commission on Trades</p>
            </div>
          </div>
        </div>
      </section>

      {/* GDPR Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50 text-sm">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground">
            We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
          </p>
          <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
