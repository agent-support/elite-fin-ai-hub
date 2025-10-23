import { Link } from "react-router-dom";
import { TrendingUp, Shield, Zap, BarChart3, Users, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import peopleRegistering from "@/assets/people-registering.jpg";
import marketProfit from "@/assets/market-profit.jpg";
import peopleEarning from "@/assets/people-earning.jpg";

export const Landing = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Zero Fees",
      description: "Trade spot crypto with absolutely zero trading fees. Keep 100% of your profits."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Execute trades in milliseconds with our advanced infrastructure and real-time data."
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your assets are protected with military-grade encryption and cold storage."
    },
    {
      icon: BarChart3,
      title: "AI-Powered Insights",
      description: "Make smarter decisions with our advanced AI analytics and market predictions."
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "24/7 dedicated support team ready to assist you at every step."
    },
    {
      icon: Award,
      title: "Trusted Platform",
      description: "Join 500K+ traders who trust us with over $10B in assets under management."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Day Trader",
      text: "CryptoElite has transformed my trading experience. Zero fees mean more profit in my pocket!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Crypto Investor",
      text: "The AI insights are incredibly accurate. I've increased my portfolio by 45% in just 3 months.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "New Trader",
      text: "As a beginner, the education resources and support team made everything so easy to understand.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero py-12 md:py-16">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
                Trade Crypto Smarter
                <br />
                <span className="text-primary">Zero Fees on Spot Trades</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join 500,000+ traders who trust CryptoElite for secure, profitable crypto trading.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto glow-primary">
                    Open Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Explore Markets
                  </Button>
                </a>
              </div>
            </div>
            
            {/* Image Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img src={peopleRegistering} alt="People registering on crypto trading platform" className="w-full h-40 md:h-48 object-cover" />
                <div className="bg-card p-3 text-center">
                  <p className="text-sm font-semibold text-foreground">Easy Registration</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img src={marketProfit} alt="Market profit charts and analytics" className="w-full h-40 md:h-48 object-cover" />
                <div className="bg-card p-3 text-center">
                  <p className="text-sm font-semibold text-foreground">Market Insights</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img src={peopleEarning} alt="People earning money through trading" className="w-full h-40 md:h-48 object-cover" />
                <div className="bg-card p-3 text-center">
                  <p className="text-sm font-semibold text-foreground">Start Earning</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500K+</div>
              <div className="text-muted-foreground">Active Traders</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">$10B+</div>
              <div className="text-muted-foreground">Assets Under Management</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">0%</div>
              <div className="text-muted-foreground">Trading Fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose CryptoElite?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to succeed in crypto trading, all in one powerful platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 gradient-card hover:scale-105 transition-transform">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Trusted by Traders Worldwide</h2>
            <p className="text-xl text-muted-foreground">
              See what our community has to say about their success.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join CryptoElite today and experience the future of crypto trading with zero fees and unlimited potential.
          </p>
          <Link to="/signup">
            <Button size="lg" className="text-lg px-8 py-6 glow-primary">
              Open Your Free Account Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
