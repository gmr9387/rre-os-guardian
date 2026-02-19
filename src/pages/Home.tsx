import { useNavigate } from "react-router-dom";
import heroDashboard from "@/assets/hero-dashboard.png";
import {
  Shield,
  ArrowRight,
  BarChart3,
  Zap,
  Lock,
  TrendingUp,
  RefreshCcw,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const features = [
  {
    icon: RefreshCcw,
    title: "Rapid Re-Entry Engine",
    description:
      "Automatically scores re-entry candidates after a stopout, so you never miss the next high-probability setup.",
  },
  {
    icon: BarChart3,
    title: "Real-Time P&L Tracking",
    description:
      "See your starting balance, cumulative profits, daily performance, and R-multiples at a glance.",
  },
  {
    icon: Zap,
    title: "Execution Modes",
    description:
      "Choose between Assist, Auto, and Safe modes — from full automation to guided manual execution.",
  },
  {
    icon: Lock,
    title: "Risk Management OS",
    description:
      "Daily loss limits, loss-streak locks, kill switch, and per-symbol caps guard your funded account.",
  },
  {
    icon: BookOpen,
    title: "Playbook Strategies",
    description:
      "Store and apply your own trading playbooks. Tag candidates with strategy context for better analysis.",
  },
  {
    icon: TrendingUp,
    title: "Alpha Insights",
    description:
      "Discover your best sessions, symbols, and candidate types through automatically generated alpha fingerprints.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/app/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute inset-0 bg-grid-pattern bg-[size:50px_50px] opacity-[0.03]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex h-16 items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <span className="font-mono text-base font-bold">
            <span className="text-primary">RRE</span>
            <span className="text-muted-foreground"> OS</span>
            <span className="text-foreground"> PRO</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Button variant="execute" size="sm" onClick={() => navigate("/app/dashboard")}>
              Dashboard <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button variant="execute" size="sm" onClick={() => navigate("/login")}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-20 text-center lg:pb-32 lg:pt-28">
        <Badge variant="outline" className="mb-6 gap-1.5 border-primary/30 text-primary">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Professional Trading OS
        </Badge>

        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Trade Smarter After
          <br />
          <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
            Every Stopout
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
          RRE OS PRO scores re-entry candidates in real time, enforces your risk rules, and keeps you
          disciplined on funded and personal accounts — so you can trade with confidence.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="execute"
            size="lg"
            className="w-full sm:w-auto gap-2 px-8"
            onClick={handleGetStarted}
          >
            {user ? "Go to Dashboard" : "Start Free"}
            <ArrowRight className="h-4 w-4" />
          </Button>
          {!user && (
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2 px-8"
              onClick={() => navigate("/login")}
            >
              Sign In
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Hero Dashboard Image */}
        <div className="relative mt-16 mx-auto max-w-5xl">
          {/* Glow behind the image */}
          <div className="absolute -inset-4 rounded-2xl bg-primary/10 blur-2xl" />
          {/* Border frame */}
          <div className="relative rounded-2xl border border-primary/20 overflow-hidden shadow-2xl">
            {/* Top bar chrome effect */}
            <div className="flex items-center gap-1.5 bg-card/80 px-4 py-3 border-b border-border/50 backdrop-blur">
              <div className="h-2.5 w-2.5 rounded-full bg-danger/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-warning/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
              <span className="ml-3 font-mono text-xs text-muted-foreground/60">RRE OS PRO — Dashboard</span>
            </div>
            <img
              src={heroDashboard}
              alt="RRE OS PRO trading dashboard"
              className="w-full object-cover"
              loading="eager"
            />
            {/* Bottom fade overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
            Everything you need to re-enter right
          </h2>
          <p className="text-muted-foreground">
            Built for funded account traders who need precision, not guesswork.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass-card group p-6 transition-all duration-200 hover:border-primary/30"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
        <div className="glass-card-elevated relative overflow-hidden rounded-2xl p-10 text-center">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <Shield className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl">Ready to take control?</h2>
          <p className="mb-8 text-muted-foreground">
            Create your account and connect your trading environment in minutes.
          </p>
          <Button
            variant="execute"
            size="lg"
            className="gap-2 px-10"
            onClick={handleGetStarted}
          >
            {user ? "Open Dashboard" : "Create Free Account"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 px-6 py-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-mono text-sm font-semibold text-muted-foreground">RRE OS PRO</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <button
            className="hover:text-foreground transition-colors"
            onClick={() => navigate("/app/legal")}
          >
            Terms
          </button>
          <button
            className="hover:text-foreground transition-colors"
            onClick={() => navigate("/app/privacy")}
          >
            Privacy
          </button>
          <button
            className="hover:text-foreground transition-colors"
            onClick={() => navigate("/app/support")}
          >
            Support
          </button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} RRE OS PRO. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
