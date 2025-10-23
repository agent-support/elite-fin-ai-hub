import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Award, ArrowRight } from "lucide-react";

const articles = [
  {
    title: "Beginner's Guide to Bitcoin Wallets",
    description: "Learn how to securely store your Bitcoin and keep your assets safe.",
    readTime: "5 min read",
    level: "Beginner"
  },
  {
    title: "Understanding Market Analysis",
    description: "Master technical and fundamental analysis to make better trading decisions.",
    readTime: "10 min read",
    level: "Intermediate"
  },
  {
    title: "Advanced Trading Strategies",
    description: "Explore sophisticated strategies used by professional crypto traders.",
    readTime: "15 min read",
    level: "Advanced"
  }
];

const videos = [
  {
    title: "Crypto Trading 101",
    duration: "12:34",
    views: "150K",
    category: "Basics"
  },
  {
    title: "How to Secure Your Crypto",
    duration: "8:45",
    views: "98K",
    category: "Security"
  },
  {
    title: "Reading Candlestick Charts",
    duration: "15:20",
    views: "200K",
    category: "Analysis"
  }
];

export const Education = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Education Center</h1>
        <p className="text-muted-foreground">Expand your crypto knowledge with our expert resources</p>
      </div>

      {/* Featured Section */}
      <Card className="p-8 mb-12 gradient-card">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Start Your Crypto Journey</h2>
            <p className="text-muted-foreground">Complete our beginner course and earn your certificate</p>
          </div>
        </div>
        <Button className="glow-primary">
          Enroll Now <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {/* Articles Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Featured Articles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <Card key={index} className="p-6 hover:scale-105 transition-transform cursor-pointer">
              <div className="mb-4">
                <span className={`text-xs px-2 py-1 rounded ${
                  article.level === "Beginner" ? "bg-success/20 text-success" :
                  article.level === "Intermediate" ? "bg-primary/20 text-primary" :
                  "bg-destructive/20 text-destructive"
                }`}>
                  {article.level}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
              <p className="text-muted-foreground mb-4">{article.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{article.readTime}</span>
                <Button variant="ghost" size="sm">
                  Read More <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Video Library */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Video className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Video Tutorials</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <Card key={index} className="overflow-hidden hover:scale-105 transition-transform cursor-pointer">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Video className="h-12 w-12 text-primary" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-secondary px-2 py-1 rounded">{video.category}</span>
                  <span className="text-sm text-muted-foreground">{video.duration}</span>
                </div>
                <h3 className="font-semibold mb-1">{video.title}</h3>
                <p className="text-sm text-muted-foreground">{video.views} views</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quiz Section */}
      <Card className="p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Test Your Knowledge</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Take our interactive quiz to assess your understanding of crypto trading fundamentals and earn badges.
        </p>
        <Button size="lg" className="glow-primary">
          Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </div>
  );
};
