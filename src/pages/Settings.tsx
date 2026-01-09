import { useState } from "react";
import { 
  Settings as SettingsIcon,
  Shield,
  Sliders,
  Key,
  Link,
  Bell,
  User,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Settings() {
  const [mode, setMode] = useState<"assist" | "auto" | "safe">("assist");
  const [riskProfile, setRiskProfile] = useState<"conservative" | "normal" | "aggressive">("normal");
  const [maxReentries, setMaxReentries] = useState(5);
  const [cooldownSeconds, setCooldownSeconds] = useState(120);
  const [maxDailyLoss, setMaxDailyLoss] = useState(3);
  const [lossStreakLock, setLossStreakLock] = useState(4);
  const [twoStepConfirm, setTwoStepConfirm] = useState(true);

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <SettingsIcon className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure your trading system behavior
        </p>
      </div>

      <Accordion type="multiple" defaultValue={["mode", "risk"]} className="space-y-3">
        {/* Mode Selection */}
        <AccordionItem value="mode" className="glass-card border-0 px-4">
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Sliders className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Execution Mode</h3>
                <p className="text-xs text-muted-foreground">Control how the system operates</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { 
                  value: "assist", 
                  label: "Assist", 
                  desc: "Manual confirmation required",
                  badge: "assist" as const
                },
                { 
                  value: "auto", 
                  label: "Auto", 
                  desc: "Automatic execution (Trust required)",
                  badge: "auto" as const
                },
                { 
                  value: "safe", 
                  label: "Safe", 
                  desc: "Assist only, no overrides",
                  badge: "safe" as const
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMode(option.value as any)}
                  className={cn(
                    "rounded-lg border-2 p-4 text-left transition-all",
                    mode === option.value 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Badge variant={option.badge} className="mb-2">{option.label}</Badge>
                  <p className="text-xs text-muted-foreground">{option.desc}</p>
                </button>
              ))}
            </div>
            {mode === "auto" && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
                <AlertTriangle className="h-4 w-4" />
                Auto mode requires Trust Score ≥ 80
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Risk Profile */}
        <AccordionItem value="risk" className="glass-card border-0 px-4">
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Risk Profile</h3>
                <p className="text-xs text-muted-foreground">Set your risk tolerance level</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { 
                  value: "conservative", 
                  label: "Conservative", 
                  desc: "Lower risk, stricter limits",
                  badge: "conservative" as const
                },
                { 
                  value: "normal", 
                  label: "Normal", 
                  desc: "Balanced risk settings",
                  badge: "normal" as const
                },
                { 
                  value: "aggressive", 
                  label: "Aggressive", 
                  desc: "Higher risk tolerance",
                  badge: "aggressive" as const
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRiskProfile(option.value as any)}
                  className={cn(
                    "rounded-lg border-2 p-4 text-left transition-all",
                    riskProfile === option.value 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Badge variant={option.badge} className="mb-2">{option.label}</Badge>
                  <p className="text-xs text-muted-foreground">{option.desc}</p>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Risk Rules */}
        <AccordionItem value="rules" className="glass-card border-0 px-4">
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Sliders className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Risk Rules</h3>
                <p className="text-xs text-muted-foreground">Configure trading limits</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pb-4">
            {/* Max Reentries */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Max Re-entries per Day</Label>
                <span className="font-mono font-medium">{maxReentries}</span>
              </div>
              <Slider
                value={[maxReentries]}
                onValueChange={([v]) => setMaxReentries(v)}
                min={1}
                max={10}
                step={1}
              />
            </div>

            {/* Cooldown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Cooldown (seconds)</Label>
                <span className="font-mono font-medium">{cooldownSeconds}s</span>
              </div>
              <Slider
                value={[cooldownSeconds]}
                onValueChange={([v]) => setCooldownSeconds(v)}
                min={30}
                max={600}
                step={30}
              />
            </div>

            {/* Max Daily Loss */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Max Daily Loss %</Label>
                <span className="font-mono font-medium">{maxDailyLoss}%</span>
              </div>
              <Slider
                value={[maxDailyLoss]}
                onValueChange={([v]) => setMaxDailyLoss(v)}
                min={1}
                max={10}
                step={0.5}
              />
            </div>

            {/* Loss Streak Lock */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Loss Streak Lock Threshold</Label>
                <span className="font-mono font-medium">{lossStreakLock}</span>
              </div>
              <Slider
                value={[lossStreakLock]}
                onValueChange={([v]) => setLossStreakLock(v)}
                min={2}
                max={8}
                step={1}
              />
            </div>

            {/* Two-Step Confirm */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Step Confirmation</Label>
                <p className="text-xs text-muted-foreground">Require extra confirmation for high-risk trades</p>
              </div>
              <Switch
                checked={twoStepConfirm}
                onCheckedChange={setTwoStepConfirm}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Webhook Security */}
        <AccordionItem value="webhook" className="glass-card border-0 px-4">
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Webhook Security</h3>
                <p className="text-xs text-muted-foreground">API keys and IP restrictions</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label>Webhook Secret</Label>
              <div className="flex gap-2">
                <Input type="password" value="••••••••••••••••" readOnly />
                <Button variant="outline">Rotate</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>IP Allowlist</Label>
              <Input placeholder="Enter IP addresses, comma separated" />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* MetaApi */}
        <AccordionItem value="metaapi" className="glass-card border-0 px-4">
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Link className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">MetaApi Connection</h3>
                <p className="text-xs text-muted-foreground">MT5 broker integration</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label>MetaApi Account ID</Label>
              <Input placeholder="Enter your MetaApi account ID" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Account Type</Label>
              <Select defaultValue="demo">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demo">Demo</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="w-full">Test Connection</Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Save Button */}
      <div className="fixed bottom-20 left-4 right-4 lg:static lg:mt-6">
        <Button onClick={handleSave} variant="execute" className="w-full" size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
