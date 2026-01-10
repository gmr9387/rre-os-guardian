import { useState } from "react";
import { Outlet } from "react-router-dom";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { Sidebar } from "@/components/navigation/Sidebar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { ActiveAccountProvider } from "@/hooks/useActiveAccount";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ActiveAccountProvider>
      <div className="flex min-h-screen flex-col">
        <GlobalHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex flex-1">
          {/* Desktop Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
        
        {/* Mobile Bottom Nav */}
        <BottomNav />
      </div>
    </ActiveAccountProvider>
  );
}