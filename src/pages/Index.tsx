import { Brain, Shield, Zap, Activity, Bell, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import CallInterface from "@/components/CallInterface";
import FeatureCard from "@/components/FeatureCard";

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced LSTM analytics predict component failures 24 hours before they occur.",
    },
    {
      icon: Shield,
      title: "Proactive Alerts",
      description: "Automated voice calls to engineers with detailed component health reports.",
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Continuous tracking of temperature, vibration, and load across all substations.",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Intelligent escalation paths with immediate human transfer when needed.",
    },
    {
      icon: BarChart3,
      title: "Predictive RUL",
      description: "Remaining useful life calculations for proactive maintenance scheduling.",
    },
    {
      icon: Zap,
      title: "Grid Intelligence",
      description: "Transform operations with actionable insights and minimized downtime.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-glow opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 opacity-0 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">AI Voice Agent Active</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <span className="text-gradient">Smart Substation</span>
            <br />
            <span className="text-foreground">Alert System</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
            Real-time AI voice agent for proactive grid operations. Get instant alerts 
            and predictive maintenance insights delivered through natural conversation.
          </p>

          {/* Call Interface */}
          <div id="demo" className="py-12 opacity-0 animate-scale-in" style={{ animationDelay: "300ms" }}>
            <CallInterface />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Transform your substation operations with our comprehensive suite of 
              intelligent monitoring and analytics tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={400 + i * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-semibold">Shakti AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Shakti. Smart Substation Alert System.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
