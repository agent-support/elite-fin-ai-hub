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
    "Welcome! CryptoElite Brokers is your gateway to secure, zero-fee crypto success—over 500K traders trust us!",
    "Hi! Ready to dive into crypto excellence? I'm here to make your trading journey amazing!",
    "Hello! Welcome to CryptoElite Brokers—where smart trading meets incredible profits!"
  ],
  deposit: "Great choice! To deposit:\n1. Go to Dashboard > Wallets\n2. Copy your BTC/ETH address\n3. Send from your external wallet—funds appear instantly!\n\nOur platform ensures secure, lightning-fast deposits for your peace of mind.",
  withdrawal: "Withdrawals are fast and fee-free! Navigate to Portfolio > Withdraw, enter amount/address, confirm—processed in minutes for your peace of mind. Your funds, your control!",
  trading: "Trading here is intuitive and profitable! Head to the Trade page, search your asset, and execute with our AI insights—start winning today! Our platform makes every trade count.",
  research: "Our research tools are top-tier! Visit Market Research for real-time charts, news feeds, and analyst ratings that empower smart decisions. Knowledge is profit!",
  education: "Boost your knowledge! Our Education Center has expert articles, video tutorials, and interactive quizzes. I can guide you to any resource—what interests you?",
  support: "Our 24/7 support is unmatched—I'm here to help instantly! For complex issues, reach our VIP team at support@cryptoelite.com. Your success is our mission!",
  features: "CryptoElite Brokers offers:\n• Zero fees on spot trades\n• Real-time market data & AI insights\n• Secure wallet integration\n• 24/7 expert support\n• Educational resources\n\nWhat would you like to explore first?",
  fallback: "I'm here to make your experience amazing—what can I help with today? Try asking about deposits, trading, or our features!"
};

const quickReplies = [
  "How to deposit?",
  "Start trading",
  "Market research",
  "About withdrawals"
];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! Ready to dive into crypto excellence? I'm here to make your trading journey amazing!",
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
                <h3 className="font-semibold">CryptoElite Assistant</h3>
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
