import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

const CONSENT_KEY = "rre-cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border/50 bg-card/95 backdrop-blur-xl p-4 shadow-2xl lg:bottom-4 lg:left-4 lg:right-auto lg:max-w-md lg:rounded-xl lg:border">
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">Cookie Consent</p>
            <p className="mt-1 text-xs text-muted-foreground">
              We use essential cookies for authentication and optional analytics cookies
              to improve the Service. Read our{" "}
              <Link to="/app/privacy" className="text-primary underline underline-offset-2">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAccept} className="text-xs">
              Accept All
            </Button>
            <Button size="sm" variant="outline" onClick={handleDecline} className="text-xs">
              Essential Only
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
