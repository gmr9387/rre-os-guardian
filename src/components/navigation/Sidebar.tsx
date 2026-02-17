import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  History, 
  BookOpen, 
  BarChart3, 
  Settings,
  Shield,
  ChevronLeft,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/app/dashboard" },
  { icon: History, label: "History", path: "/app/history" },
  { icon: BookOpen, label: "Playbook", path: "/app/playbook" },
  { icon: BarChart3, label: "Insights", path: "/app/insights" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
  { icon: MessageSquare, label: "Support", path: "/app/support" },
  { icon: Shield, label: "Legal", path: "/app/legal" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 border-r border-border/50 bg-sidebar transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-mono text-sm font-bold">
              <span className="text-primary">RRE</span>
              <span className="text-muted-foreground"> OS</span>
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon-sm"
            className="lg:hidden"
            onClick={onClose}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === '/app/dashboard' && location.pathname === '/app');
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5",
                      isActive && "text-primary"
                    )} />
                    {item.label}
                    {isActive && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 p-4">
          <div className="glass-card p-3">
            <p className="text-xs text-muted-foreground">System Status</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-success">Connected</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
