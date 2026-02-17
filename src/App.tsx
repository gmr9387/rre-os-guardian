import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/layouts/MainLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CandidateDetail from "@/pages/CandidateDetail";
import History from "@/pages/History";
import Playbook from "@/pages/Playbook";
import Insights from "@/pages/Insights";
import Settings from "@/pages/Settings";
import Support from "@/pages/Support";
import Legal from "@/pages/Legal";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/NotFound";
import { CookieConsentBanner } from "@/components/common/CookieConsentBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner 
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "glass-card-elevated border-border/50",
              title: "text-foreground",
              description: "text-muted-foreground",
            },
          }}
        />
        <BrowserRouter>
          <CookieConsentBanner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="candidates/:id" element={<CandidateDetail />} />
              <Route path="history" element={<History />} />
              <Route path="playbook" element={<Playbook />} />
              <Route path="insights" element={<Insights />} />
              <Route path="settings" element={<Settings />} />
              <Route path="support" element={<Support />} />
              <Route path="legal" element={<Legal />} />
              <Route path="privacy" element={<Privacy />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;