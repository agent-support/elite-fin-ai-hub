import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const chatbotResponses = {
  greeting: [
    "Welcome! ForexElite Brokers is your gateway to secure, zero-commission forex success—over 500K traders trust us!",
    "Hi! Ready to profit from forex excellence? I'm here to make your trading journey amazing!",
    "Hello! Welcome to ForexElite Brokers—where smart forex trading meets incredible profits!"
  ],
  deposit: "Great choice! To deposit:\n1. Go to Dashboard > Wallets\n2. Select your preferred payment method\n3. Funds appear instantly!\n\nOur platform ensures secure, lightning-fast deposits for your peace of mind.",
  withdrawal: "Withdrawals are fast and fee-free! Navigate to Portfolio > Withdraw, enter amount, confirm—processed in minutes for your peace of mind. Your funds, your control!",
  trading: "Trading forex is intuitive and profitable! Head to the Trade page, search EUR/USD or your preferred pair, and execute with our AI insights—start winning today! Our platform makes every trade count.",
  research: "Our research tools are top-tier! Visit Market Research for real-time charts, news feeds, and analyst ratings that empower smart forex decisions. Knowledge is profit!",
  education: "Boost your knowledge! Our Education Center has expert articles, video tutorials, and interactive quizzes on forex trading. I can guide you to any resource—what interests you?",
  support: "Our 24/7 support is unmatched—I'm here to help instantly! For complex issues, reach our VIP team at support@forexelite.com. Your success is our mission!",
  features: "ForexElite Brokers offers:\n• Zero commissions on forex trades\n• $50 instant bonus for new accounts\n• 1:2000 flexible leverage\n• 90+ trading instruments\n• Real-time market data & AI insights\n• 24/7 expert support\n• Low spreads\n\nWhat would you like to explore first?",
  bonus: "Amazing! Get $50 INSTANTLY when you register and activate your account! Plus, sign up now and receive a free Starbucks coffee! Start trading with bonus funds right away. Click 'Register' to claim your bonus!",
  fallback: "I'm here to make your forex experience amazing—what can I help with today? Try asking about bonuses, deposits, trading, or our features!"
};

const quickReplies = [
  "How to register?",
  "Get $50 bonus",
  "Start trading",
  "About deposits"
];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Ready to profit from forex? Join ForexElite and get $50 instantly plus a free Starbucks coffee! How can I help you get started?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.match(/hello|hi|hey|greet/)) {
      return chatbotResponses.greeting[Math.floor(Math.random() * chatbotResponses.greeting.length)];
    }
    if (lowerInput.match(/deposit|fund|add money|send crypto/)) {
      return chatbotResponses.deposit;
    }
    if (lowerInput.match(/withdraw|cash out|send out/)) {
      return chatbotResponses.withdrawal;
    }
    if (lowerInput.match(/trade|buy|sell|execute|order/)) {
      return chatbotResponses.trading;
    }
    if (lowerInput.match(/research|chart|market|analysis|data/)) {
      return chatbotResponses.research;
    }
    if (lowerInput.match(/learn|education|tutorial|guide/)) {
      return chatbotResponses.education;
    }
    if (lowerInput.match(/support|help|contact|issue/)) {
      return chatbotResponses.support;
    }
    if (lowerInput.match(/feature|what can|capability|offer/)) {
      return chatbotResponses.features;
    }
    if (lowerInput.match(/bonus|50|promo|reward|instant|starbucks/)) {
      return chatbotResponses.bonus;
    }
    if (lowerInput.match(/register|sign up|account|join/)) {
      return "Signing up is quick and easy! Click the 'Register' or 'Open an Account' button to get started. You'll get $50 instantly plus a free Starbucks coffee when you activate your account. Join 500K+ profitable traders today!";
    }
    
    return chatbotResponses.fallback;
  };

  const handleSend = (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getResponse(messageText),
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg glow-primary animate-pulse-glow z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50 animate-fade-in">
          {/* Header */}
          <div className="bg-primary p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">ForexElite Assistant</h3>
                <p className="text-xs text-primary-foreground/80">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Replies */}
          <div className="p-3 border-t border-border">
            <div className="flex flex-wrap gap-2 mb-2">
              {quickReplies.map((reply) => (
                <Button
                  key={reply}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(reply)}
                  className="text-xs"
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="icon" className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
