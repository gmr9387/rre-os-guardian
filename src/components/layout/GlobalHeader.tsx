import { useState } from "react";
import { 
  ChevronDown, 
  Shield, 
  Power, 
  User, 
  Settings,
  Bell,
  Menu
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

interface Account {
  id: string;
  label: string;
  type: "funded" | "personal" | "sandbox";
  isActive: boolean;
}

const mockAccounts: Account[] = [
  { id: "1", label: "FTMO Challenge", type: "funded", isActive: true },
  { id: "2", label: "Personal Live", type: "personal", isActive: false },
  { id: "3", label: "Strategy Test", type: "sandbox", isActive: false },
];

interface GlobalHeaderProps {
  onMenuClick?: () => void;
}

export function GlobalHeader({ onMenuClick }: GlobalHeaderProps) {
  const [accounts] = useState<Account[]>(mockAccounts);
  const [activeAccount, setActiveAccount] = useState(accounts[0]);
  const [riskProfile] = useState<"conservative" | "normal" | "aggressive">("normal");
  const [mode] = useState<"assist" | "auto" | "safe">("assist");

  const getAccountTypeColor = (type: Account["type"]) => {
    switch (type) {
      case "funded": return "text-success";
      case "personal": return "text-primary";
      case "sandbox": return "text-warning";
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
              <Button variant="ghost" className="gap-2 text-sm">
                <span className={getAccountTypeColor(activeAccount.type)}>●</span>
                <span className="max-w-[120px] truncate">{activeAccount.label}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Switch Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {accounts.map((account) => (
                <DropdownMenuItem
                  key={account.id}
                  onClick={() => setActiveAccount(account)}
                  className="gap-2"
                >
                  <span className={getAccountTypeColor(account.type)}>●</span>
                  <span className="flex-1">{account.label}</span>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {account.type}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center - Badges */}
        <div className="hidden items-center gap-2 md:flex">
          <Badge variant={riskProfile}>{riskProfile}</Badge>
          <Badge variant={mode}>{mode}</Badge>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon-sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-danger-foreground">
              2
            </span>
          </Button>

          {/* Kill Switch */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="kill" 
                size="sm"
                className="hidden gap-1.5 sm:inline-flex"
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
                  This will immediately halt all trading operations, close pending orders, 
                  and lock the system. This action cannot be undone without admin intervention.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-danger hover:bg-danger/90">
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
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger">
                <Power className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile badges */}
      <div className="flex items-center gap-2 border-t border-border/30 px-4 py-2 md:hidden">
        <Badge variant={riskProfile} className="text-[10px]">{riskProfile}</Badge>
        <Badge variant={mode} className="text-[10px]">{mode}</Badge>
      </div>
    </header>
  );
}
