import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronDown, 
  Shield, 
  Power, 
  User, 
  Settings,
  Bell,
  Menu,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useActiveAccount } from "@/hooks/useActiveAccount";
import { useKillSwitch } from "@/hooks/useDashboardData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GlobalHeaderProps {
  onMenuClick?: () => void;
}

export function GlobalHeader({ onMenuClick }: GlobalHeaderProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { accounts, activeAccount, accountSettings, setActiveAccountId, loading } = useActiveAccount();
  const { data: killSwitch } = useKillSwitch();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleKillSwitch = async () => {
    if (!activeAccount) return;

    try {
      const { error } = await supabase
        .from('kill_switch')
        .update({
          is_active: true,
          activated_at: new Date().toISOString(),
          reason: 'Emergency stop by user',
        })
        .eq('account_id', activeAccount.id);

      if (error) throw error;

      toast.error("Kill Switch Activated", {
        description: "All trading operations have been halted.",
      });
    } catch (error) {
      console.error('Error activating kill switch:', error);
      toast.error("Failed to activate kill switch");
    }
  };

  const getAccountTypeLabel = (account: typeof activeAccount) => {
    if (!account) return 'personal';
    if (account.label.toLowerCase().includes('funded') || account.label.toLowerCase().includes('ftmo')) {
      return 'funded';
    }
    if (account.label.toLowerCase().includes('sandbox') || account.label.toLowerCase().includes('test')) {
      return 'sandbox';
    }
    return 'personal';
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "funded": return "text-success";
      case "personal": return "text-primary";
      case "sandbox": return "text-warning";
      default: return "text-primary";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon-sm" 
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Shield className="h-6 w-6 text-primary" />
              <div className="absolute inset-0 animate-pulse-glow" />
            </div>
            <span className="hidden font-mono text-sm font-bold tracking-tight sm:inline-block">
              <span className="text-primary">RRE</span>
              <span className="text-muted-foreground"> OS</span>
              <span className="text-foreground"> PRO</span>
            </span>
          </div>

          {/* Account Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 text-sm" disabled={loading}>
                {activeAccount ? (
                  <>
                    <span className={getAccountTypeColor(getAccountTypeLabel(activeAccount))}>●</span>
                    <span className="max-w-[120px] truncate">{activeAccount.label}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">No Account</span>
                )}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Switch Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {accounts.map((account) => {
                const type = getAccountTypeLabel(account);
                return (
                  <DropdownMenuItem
                    key={account.id}
                    onClick={() => setActiveAccountId(account.id)}
                    className="gap-2"
                  >
                    <span className={getAccountTypeColor(type)}>●</span>
                    <span className="flex-1">{account.label}</span>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {account.is_demo ? 'demo' : 'live'}
                    </Badge>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center - Badges */}
        <div className="hidden items-center gap-2 md:flex">
          {activeAccount && (
            <Badge variant={activeAccount.risk_profile}>{activeAccount.risk_profile}</Badge>
          )}
          {accountSettings && (
            <Badge variant={accountSettings.mode}>{accountSettings.mode}</Badge>
          )}
          {killSwitch?.is_active && (
            <Badge variant="locked" className="gap-1 animate-pulse">
              <Power className="h-3 w-3" />
              KILLED
            </Badge>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon-sm" className="relative">
            <Bell className="h-4 w-4" />
          </Button>

          {/* Kill Switch */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="kill" 
                size="sm"
                className="hidden gap-1.5 sm:inline-flex"
                disabled={killSwitch?.is_active}
              >
                <Power className="h-3.5 w-3.5" />
                <span className="text-xs">KILL</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-card-elevated border-danger/50">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-danger">
                  <Power className="h-5 w-5" />
                  Emergency Kill Switch
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will immediately halt all trading operations for the active account.
                  You can reactivate trading from the Settings page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-danger hover:bg-danger/90"
                  onClick={handleKillSwitch}
                >
                  Confirm Kill
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile badges */}
      <div className="flex items-center gap-2 border-t border-border/30 px-4 py-2 md:hidden">
        {activeAccount && (
          <Badge variant={activeAccount.risk_profile} className="text-[10px]">
            {activeAccount.risk_profile}
          </Badge>
        )}
        {accountSettings && (
          <Badge variant={accountSettings.mode} className="text-[10px]">
            {accountSettings.mode}
          </Badge>
        )}
        {killSwitch?.is_active && (
          <Badge variant="locked" className="text-[10px] gap-1">
            <Power className="h-3 w-3" />
            KILLED
          </Badge>
        )}
      </div>
    </header>
  );
}