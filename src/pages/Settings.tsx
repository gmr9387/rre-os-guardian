import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveAccount } from "@/hooks/useActiveAccount";
import { useBrokerConnection } from "@/hooks/useBrokerConnection";
import { useExecutionMode } from "@/hooks/useExecutionMode";
import {
  Settings as SettingsIcon,
  Shield,
  Sliders,
  Key,
  AlertTriangle,
  Copy,
  RotateCw,
  Plus,
  User,
  Plug,
  ChevronDown,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
  Hand,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Settings() {
  const { activeAccount, refetch: refetchAccount } = useActiveAccount();
  const queryClient = useQueryClient();

  // Account state
  const [label, setLabel] = useState("");
  const [riskProfile, setRiskProfile] = useState<"conservative" | "normal" | "aggressive">("normal");
  const [isDemo, setIsDemo] = useState(true);
  const [metaapiAccountId, setMetaapiAccountId] = useState("");

  // Settings state
  const [mode, setMode] = useState<"assist" | "auto" | "safe">("assist");
  const [maxReentries, setMaxReentries] = useState(3);
  const [cooldownSeconds, setCooldownSeconds] = useState(300);
  const [maxDailyLoss, setMaxDailyLoss] = useState(2);
  const [lossStreakLock, setLossStreakLock] = useState(3);
  const [lockDuration, setLockDuration] = useState(60);
  const [riskPerTradePct, setRiskPerTradePct] = useState(1.0);
  const [twoStepConfirm, setTwoStepConfirm] = useState(false);
  const [perSymbolCaps, setPerSymbolCaps] = useState("{}");
  const [startingBalance, setStartingBalance] = useState(10000);

  // Kill switch state
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [killSwitchReason, setKillSwitchReason] = useState("");
  const [showKillConfirm, setShowKillConfirm] = useState(false);

  // Webhook secret state
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [newSecret, setNewSecret] = useState("");

  // Broker connection
  const {
    brokerConnection,
    loading: brokerLoading,
    setEnvironment,
    runCheck,
    isUpdating: brokerUpdating,
    isChecking: brokerChecking,
  } = useBrokerConnection();

  // Execution mode
  const { executionMode, setExecutionMode, isUpdating: executionModeUpdating } = useExecutionMode();

  // Broker help
  const [helpOpen, setHelpOpen] = useState(false);

  // Fetch account settings
  const { data: accountSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['account_settings', activeAccount?.id],
    queryFn: async () => {
      if (!activeAccount) return null;
      const { data, error } = await supabase
        .from('account_settings')
        .select('*')
        .eq('account_id', activeAccount.id)
        .maybeSingle();

      if (error) throw error;

      // Create if missing
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('account_settings')
          .insert({ account_id: activeAccount.id })
          .select()
          .single();
        if (insertError) throw insertError;
        return newData;
      }
      return data;
    },
    enabled: !!activeAccount,
  });

  // Fetch kill switch
  const { data: killSwitch } = useQuery({
    queryKey: ['kill_switch', activeAccount?.id],
    queryFn: async () => {
      if (!activeAccount) return null;
      const { data, error } = await supabase
        .from('kill_switch')
        .select('*')
        .eq('account_id', activeAccount.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('kill_switch')
          .insert({ account_id: activeAccount.id, is_active: false })
          .select()
          .single();
        if (insertError) throw insertError;
        return newData;
      }
      return data;
    },
    enabled: !!activeAccount,
  });

  // Fetch webhook secrets
  const { data: webhookSecrets } = useQuery({
    queryKey: ['webhook_secrets', activeAccount?.id],
    queryFn: async () => {
      if (!activeAccount) return [];
      const { data, error } = await supabase
        .from('webhook_secrets')
        .select('*')
        .eq('account_id', activeAccount.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!activeAccount,
  });

  // Sync state from fetched data
  useEffect(() => {
    if (activeAccount) {
      setLabel(activeAccount.label);
      setRiskProfile(activeAccount.risk_profile as "conservative" | "normal" | "aggressive");
      setIsDemo(activeAccount.is_demo);
      setMetaapiAccountId(activeAccount.metaapi_account_id || "");
    }
  }, [activeAccount]);

  useEffect(() => {
    if (accountSettings) {
      setMode(accountSettings.mode as "assist" | "auto" | "safe");
      setMaxReentries(accountSettings.max_reentries_day);
      setCooldownSeconds(accountSettings.cooldown_seconds);
      setMaxDailyLoss(Number(accountSettings.max_daily_loss_pct));
      setLossStreakLock(accountSettings.loss_streak_lock_threshold);
      setLockDuration(accountSettings.lock_duration_minutes);
      setRiskPerTradePct(Number(accountSettings.risk_per_trade_pct) || 1.0);
      setTwoStepConfirm(accountSettings.two_step_confirm_enabled);
      setPerSymbolCaps(JSON.stringify(accountSettings.per_symbol_caps || {}, null, 2));
      setStartingBalance(Number((accountSettings as unknown as { starting_balance?: number }).starting_balance) || 10000);
    }
  }, [accountSettings]);

  useEffect(() => {
    if (killSwitch) {
      setKillSwitchActive(killSwitch.is_active);
    }
  }, [killSwitch]);

  // Mutations
  const updateAccountMutation = useMutation({
    mutationFn: async () => {
      if (!activeAccount) throw new Error("No account");
      const { error } = await supabase
        .from('accounts')
        .update({ label, risk_profile: riskProfile, is_demo: isDemo })
        .eq('id', activeAccount.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Account settings saved");
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['active_account'] });
    },
    onError: (e) => toast.error("Failed to save: " + e.message),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!activeAccount) throw new Error("No account");
      let parsedCaps = {};
      try {
        parsedCaps = JSON.parse(perSymbolCaps);
      } catch {
        throw new Error("Invalid JSON in per-symbol caps");
      }

      const { error } = await supabase
        .from('account_settings')
        .update({
          mode,
          max_reentries_day: maxReentries,
          cooldown_seconds: cooldownSeconds,
          max_daily_loss_pct: maxDailyLoss,
          loss_streak_lock_threshold: lossStreakLock,
          lock_duration_minutes: lockDuration,
          risk_per_trade_pct: riskPerTradePct,
          two_step_confirm_enabled: twoStepConfirm,
          per_symbol_caps: parsedCaps,
          starting_balance: startingBalance,
        })
        .eq('account_id', activeAccount.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Risk rules saved");
      queryClient.invalidateQueries({ queryKey: ['account_settings'] });
      queryClient.invalidateQueries({ queryKey: ['pnl_summary'] });
      refetchAccount();
    },
    onError: (e) => toast.error("Failed to save: " + e.message),
  });

  const toggleKillSwitchMutation = useMutation({
    mutationFn: async (activate: boolean) => {
      if (!activeAccount) throw new Error("No account");
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('kill_switch')
        .update({
          is_active: activate,
          activated_at: activate ? new Date().toISOString() : null,
          activated_by: activate ? user?.id : null,
          reason: activate ? killSwitchReason : null,
        })
        .eq('account_id', activeAccount.id);
      if (error) throw error;
    },
    onSuccess: (_, activate) => {
      toast.success(activate ? "Kill switch activated" : "Kill switch deactivated");
      queryClient.invalidateQueries({ queryKey: ['kill_switch'] });
      setShowKillConfirm(false);
      setKillSwitchReason("");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const generateSecretMutation = useMutation({
    mutationFn: async () => {
      if (!activeAccount) throw new Error("No account");

      // Generate random secret
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const secret = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');

      // Hash it using SHA-256
      const encoder = new TextEncoder();
      const data = encoder.encode(secret);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Insert into DB
      const { error } = await supabase
        .from('webhook_secrets')
        .insert({
          account_id: activeAccount.id,
          secret_hash: hashHex,
          is_active: true,
        });
      if (error) throw error;

      return secret;
    },
    onSuccess: (secret) => {
      setNewSecret(secret);
      setShowSecretModal(true);
      queryClient.invalidateQueries({ queryKey: ['webhook_secrets'] });
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const rotateSecretMutation = useMutation({
    mutationFn: async () => {
      if (!activeAccount) throw new Error("No account");

      // Mark existing as inactive
      await supabase
        .from('webhook_secrets')
        .update({ is_active: false })
        .eq('account_id', activeAccount.id)
        .eq('is_active', true);

      // Generate new secret
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const secret = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');

      const encoder = new TextEncoder();
      const data = encoder.encode(secret);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await supabase
        .from('webhook_secrets')
        .insert({
          account_id: activeAccount.id,
          secret_hash: hashHex,
          is_active: true,
        });
      if (error) throw error;

      return secret;
    },
    onSuccess: (secret) => {
      setNewSecret(secret);
      setShowSecretModal(true);
      queryClient.invalidateQueries({ queryKey: ['webhook_secrets'] });
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const copySecret = () => {
    navigator.clipboard.writeText(newSecret);
    toast.success("Secret copied to clipboard");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Connected
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <XCircle className="h-3 w-3" />
            Disconnected
          </Badge>
        );
    }
  };

  if (!activeAccount) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No account selected</p>
      </div>
    );
  }

  if (settingsLoading) {
    return (
      <div className="space-y-4 pb-20 lg:pb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <SettingsIcon className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure your trading system
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="rules">Risk Rules</TabsTrigger>
          <TabsTrigger value="broker">Broker</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Account Details</h3>
                <p className="text-xs text-muted-foreground">Manage your trading account</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Risk Profile</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {(["conservative", "normal", "aggressive"] as const).map((profile) => (
                  <button
                    key={profile}
                    onClick={() => setRiskProfile(profile)}
                    className={cn(
                      "rounded-lg border-2 p-3 text-left transition-all capitalize",
                      riskProfile === profile
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Badge variant={profile}>{profile}</Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Demo Account</Label>
                <p className="text-xs text-muted-foreground">Is this a demo/paper trading account?</p>
              </div>
              <Switch checked={isDemo} onCheckedChange={setIsDemo} />
            </div>

            <div className="space-y-2">
              <Label>MetaApi Account ID</Label>
              <Input
                value={metaapiAccountId}
                disabled
                placeholder="Set via n8n integration"
                className="opacity-50"
              />
              <p className="text-xs text-muted-foreground">Configured automatically when connected to MetaApi</p>
            </div>

            <Button
              onClick={() => updateAccountMutation.mutate()}
              disabled={updateAccountMutation.isPending}
              variant="execute"
              className="w-full"
            >
              Save Account Settings
            </Button>
          </div>
        </TabsContent>

        {/* Risk Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="glass-card p-4 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Sliders className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Risk Rules</h3>
                <p className="text-xs text-muted-foreground">Configure trading limits</p>
              </div>
            </div>

            {/* Mode Selection */}
            <div className="space-y-2">
              <Label>Execution Mode</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {(["assist", "auto", "safe"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "rounded-lg border-2 p-3 text-left transition-all",
                      mode === m
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Badge variant={m} className="capitalize">{m}</Badge>
                  </button>
                ))}
              </div>
              {mode === "auto" && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  Auto mode is gated by Trust Score ≥ 80 and locks
                </div>
              )}
            </div>

            {/* Sliders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Max Re-entries per Day</Label>
                <span className="font-mono font-medium">{maxReentries}</span>
              </div>
              <Slider value={[maxReentries]} onValueChange={([v]) => setMaxReentries(v)} min={1} max={10} step={1} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Cooldown (seconds)</Label>
                <span className="font-mono font-medium">{cooldownSeconds}s</span>
              </div>
              <Slider value={[cooldownSeconds]} onValueChange={([v]) => setCooldownSeconds(v)} min={30} max={600} step={30} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Max Daily Loss %</Label>
                <span className="font-mono font-medium">{maxDailyLoss}%</span>
              </div>
              <Slider value={[maxDailyLoss]} onValueChange={([v]) => setMaxDailyLoss(v)} min={0.5} max={10} step={0.5} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Risk Per Trade %</Label>
                  <p className="text-xs text-muted-foreground">Position size based on account equity</p>
                </div>
                <span className="font-mono font-medium">{riskPerTradePct}%</span>
              </div>
              <Slider value={[riskPerTradePct]} onValueChange={([v]) => setRiskPerTradePct(v)} min={0.25} max={5} step={0.25} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Loss Streak Lock Threshold</Label>
                <span className="font-mono font-medium">{lossStreakLock}</span>
              </div>
              <Slider value={[lossStreakLock]} onValueChange={([v]) => setLossStreakLock(v)} min={2} max={8} step={1} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Lock Duration (minutes)</Label>
                <span className="font-mono font-medium">{lockDuration}</span>
              </div>
              <Slider value={[lockDuration]} onValueChange={([v]) => setLockDuration(v)} min={15} max={240} step={15} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Step Confirmation</Label>
                <p className="text-xs text-muted-foreground">Require extra confirmation for trades</p>
              </div>
              <Switch checked={twoStepConfirm} onCheckedChange={setTwoStepConfirm} />
            </div>

            <div className="space-y-2">
              <Label>Starting Balance (USD)</Label>
              <p className="text-xs text-muted-foreground">Used to calculate your total P&L and portfolio performance on the dashboard.</p>
              <Input
                type="number"
                value={startingBalance}
                onChange={(e) => setStartingBalance(Number(e.target.value))}
                min={0}
                step={100}
                placeholder="10000"
              />
            </div>

            <div className="space-y-2">
              <Label>Per-Symbol Caps (JSON)</Label>
              <Textarea
                value={perSymbolCaps}
                onChange={(e) => setPerSymbolCaps(e.target.value)}
                className="font-mono text-xs h-24"
                placeholder='{"EURUSD": 2, "XAUUSD": 1}'
              />
            </div>

            <Button
              onClick={() => updateSettingsMutation.mutate()}
              disabled={updateSettingsMutation.isPending}
              variant="execute"
              className="w-full"
            >
              Save Risk Rules
            </Button>
          </div>
        </TabsContent>

        {/* Broker Tab */}
        <TabsContent value="broker" className="space-y-4">
          {/* Execution Mode Toggle */}
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Execution Mode</h3>
                <p className="text-xs text-muted-foreground">Choose how trades are executed</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setExecutionMode("auto")}
                disabled={executionModeUpdating}
                className={cn(
                  "rounded-lg border-2 p-4 text-left transition-all",
                  executionMode === "auto"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Auto (Alpaca)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Orders execute automatically via Alpaca API. Requires API credentials and funds in your Alpaca account.
                </p>
                {executionMode === "auto" && (
                  <Badge variant="default" className="mt-2">Active</Badge>
                )}
              </button>

              <button
                onClick={() => setExecutionMode("manual")}
                disabled={executionModeUpdating}
                className={cn(
                  "rounded-lg border-2 p-4 text-left transition-all",
                  executionMode === "manual"
                    ? "border-success bg-success/10"
                    : "border-border hover:border-success/50"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Hand className="h-5 w-5 text-success" />
                  <span className="font-semibold">Manual Signals</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive trade signals (Entry, SL, TP) to copy. Execute manually in any broker of your choice.
                </p>
                {executionMode === "manual" && (
                  <Badge variant="default" className="mt-2 bg-success text-success-foreground">Active</Badge>
                )}
              </button>
            </div>

            {executionMode === "manual" && (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>Your funds stay in your preferred broker. Copy signals and execute trades yourself.</span>
              </div>
            )}

            {executionMode === "auto" && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                <Zap className="h-4 w-4 flex-shrink-0" />
                <span>Orders will be sent directly to Alpaca when you confirm a re-entry.</span>
              </div>
            )}
          </div>

          {/* Broker Connection - only show in auto mode */}
          {executionMode === "auto" && (
          <div className="glass-card p-4 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Plug className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Broker Connection</h3>
                <p className="text-xs text-muted-foreground">Connect to your trading broker</p>
              </div>
            </div>

            {brokerLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                {/* Broker Selection */}
                <div className="space-y-2">
                  <Label>Broker</Label>
                  <Select value="alpaca" disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alpaca">Alpaca (Stock + Options)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">More brokers coming soon</p>
                </div>

                {/* Environment Toggle */}
                <div className="space-y-2">
                  <Label>Environment</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setEnvironment("paper")}
                      disabled={brokerUpdating}
                      className={cn(
                        "rounded-lg border-2 p-3 text-center transition-all",
                        brokerConnection?.environment === "paper"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="font-medium">Paper</div>
                      <div className="text-xs text-muted-foreground">Test trading</div>
                    </button>
                    <button
                      onClick={() => setEnvironment("live")}
                      disabled={brokerUpdating}
                      className={cn(
                        "rounded-lg border-2 p-3 text-center transition-all",
                        brokerConnection?.environment === "live"
                          ? "border-success bg-success/10"
                          : "border-border hover:border-success/50"
                      )}
                    >
                      <div className="font-medium">Live</div>
                      <div className="text-xs text-muted-foreground">Real money</div>
                    </button>
                  </div>
                </div>

                {/* Connection Status */}
                <div className="space-y-2">
                  <Label>Connection Status</Label>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(brokerConnection?.status || "disconnected")}
                      {brokerConnection?.last_checked_at && (
                        <span className="text-xs text-muted-foreground">
                          Last checked: {new Date(brokerConnection.last_checked_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connection Check Button */}
                <Button
                  onClick={runCheck}
                  disabled={brokerChecking}
                  variant="outline"
                  className="w-full gap-2"
                >
                  {brokerChecking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Plug className="h-4 w-4" />
                      Run Connection Check
                    </>
                  )}
                </Button>

                {/* Warning for Live mode */}
                {brokerConnection?.environment === "live" && brokerConnection?.status !== "connected" && (
                  <div className="flex items-center gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>Live trading requires broker credentials configured via n8n integration.</span>
                  </div>
                )}

                {/* Help Collapsible */}
                <Collapsible open={helpOpen} onOpenChange={setHelpOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between">
                      <span>How to Connect</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", helpOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-3">
                    <div className="rounded-lg border p-3 text-sm space-y-2">
                      <h4 className="font-medium">Paper Trading (Recommended First)</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Create a free Alpaca account at alpaca.markets</li>
                        <li>Paper trading is for testing and should be used first</li>
                        <li>No real money is at risk in paper mode</li>
                        <li>API keys will be configured via n8n workflow</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border p-3 text-sm space-y-2">
                      <h4 className="font-medium">Live Trading</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Requires broker compliance and real funding</li>
                        <li>Only switch after testing thoroughly in paper mode</li>
                        <li>API credentials are securely handled via n8n</li>
                        <li>Ensure your risk rules are properly configured</li>
                      </ul>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}
          </div>
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          {/* Kill Switch */}
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/20">
                <Shield className="h-5 w-5 text-danger" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Kill Switch</h3>
                <p className="text-xs text-muted-foreground">Emergency halt all trading</p>
              </div>
              <Switch
                checked={killSwitchActive}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setShowKillConfirm(true);
                  } else {
                    toggleKillSwitchMutation.mutate(false);
                  }
                }}
              />
            </div>
            {killSwitchActive && (
              <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
                <AlertTriangle className="h-4 w-4" />
                Kill switch is active. All trading is halted.
              </div>
            )}
          </div>

          {/* Webhook Secrets */}
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Webhook Secrets</h3>
                <p className="text-xs text-muted-foreground">API keys for webhook authentication</p>
              </div>
            </div>

            {webhookSecrets && webhookSecrets.length > 0 ? (
              <div className="space-y-2">
                {webhookSecrets.slice(0, 5).map((secret) => (
                  <div
                    key={secret.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3",
                      secret.is_active ? "border-success/30 bg-success/5" : "border-border opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        ••••••••{secret.secret_hash.slice(-8)}
                      </span>
                      <Badge variant={secret.is_active ? "default" : "outline"}>
                        {secret.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(secret.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No secrets configured</p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => generateSecretMutation.mutate()}
                disabled={generateSecretMutation.isPending}
              >
                <Plus className="h-4 w-4" />
                Generate New
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => rotateSecretMutation.mutate()}
                disabled={rotateSecretMutation.isPending || !webhookSecrets?.some((s) => s.is_active)}
              >
                <RotateCw className="h-4 w-4" />
                Rotate
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Kill Switch Confirm Dialog */}
      <Dialog open={showKillConfirm} onOpenChange={setShowKillConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-5 w-5" />
              Activate Kill Switch
            </DialogTitle>
            <DialogDescription>
              This will immediately halt all trading. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Input
              value={killSwitchReason}
              onChange={(e) => setKillSwitchReason(e.target.value)}
              placeholder="e.g., Market volatility, account issue..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKillConfirm(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => toggleKillSwitchMutation.mutate(true)}
              disabled={toggleKillSwitchMutation.isPending}
            >
              Activate Kill Switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Secret Modal */}
      <Dialog open={showSecretModal} onOpenChange={setShowSecretModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              New Webhook Secret
            </DialogTitle>
            <DialogDescription>
              Copy this secret now. It will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
              <code className="flex-1 break-all text-sm">{newSecret}</code>
              <Button variant="ghost" size="icon-sm" onClick={copySecret}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSecretModal(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
