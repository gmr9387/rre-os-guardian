import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  History, 
  BookOpen, 
  BarChart3, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/app/dashboard" },
  { icon: History, label: "History", path: "/app/history" },
  { icon: BookOpen, label: "Playbook", path: "/app/playbook" },
  { icon: BarChart3, label: "Insights", path: "/app/insights" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/app/dashboard' && location.pathname === '/app');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "font-medium",
                isActive && "text-primary"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 h-0.5 w-12 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
