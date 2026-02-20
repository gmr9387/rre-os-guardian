import { ArrowLeft, Eye, Database, Cookie, Globe, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">How we handle your data</p>
        </div>
      </div>

      {/* Overview */}
      <section className="glass-card space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Overview</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            RRE OS ("we", "our", "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you use our trading intelligence platform.
          </p>
          <p>
            By using RRE OS, you consent to the data practices described in this policy.
            If you do not agree, please discontinue use of the Service.
          </p>
        </div>
      </section>

      {/* Data We Collect */}
      <section className="glass-card space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Data We Collect</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Account Information.</strong>{" "}
            Email address, display name, and authentication credentials used to create
            and manage your account.
          </p>
          <p>
            <strong className="text-foreground">Trading Data.</strong>{" "}
            Stop-out events, re-entry candidates, execution records, behavioral metrics,
            and risk management settings you create through the Service. This data is
            essential for providing trading intelligence and performance analytics.
          </p>
          <p>
            <strong className="text-foreground">Brokerage Connection Data.</strong>{" "}
            API keys and connection metadata for linked brokerages (e.g., Alpaca).
            We never store your brokerage password. API keys are encrypted at rest.
          </p>
          <p>
            <strong className="text-foreground">Usage Data.</strong>{" "}
            Browser type, device information, IP address, pages visited, and interaction
            patterns collected automatically to improve the Service.
          </p>
          <p>
            <strong className="text-foreground">Cookies & Local Storage.</strong>{" "}
            We use essential cookies for authentication and session management.
            Optional analytics cookies are used only with your consent.
          </p>
        </div>
      </section>

      {/* How We Use Your Data */}
      <section className="glass-card space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">How We Use Your Data</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li>Provide, operate, and maintain the Service</li>
            <li>Generate re-entry candidates and risk analytics</li>
            <li>Execute trades via your connected brokerage on your behalf</li>
            <li>Calculate behavioral metrics (EVI, Trust Score) for risk governance</li>
            <li>Send essential service notifications (e.g., kill switch activation)</li>
            <li>Improve the Service through aggregate, anonymized analytics</li>
          </ul>
          <p className="mt-2">
            We do <strong className="text-foreground">not</strong> sell, rent, or share
            your personal data with third parties for marketing purposes.
          </p>
        </div>
      </section>

      {/* Cookies */}
      <section className="glass-card space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Cookie className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Cookie Policy</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="py-2 pr-4 font-medium text-foreground">Cookie</th>
                  <th className="py-2 pr-4 font-medium text-foreground">Type</th>
                  <th className="py-2 font-medium text-foreground">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">sb-auth-token</td>
                  <td className="py-2 pr-4">Essential</td>
                  <td className="py-2">Authentication session management</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">cookie-consent</td>
                  <td className="py-2 pr-4">Essential</td>
                  <td className="py-2">Stores your cookie preference</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">analytics</td>
                  <td className="py-2 pr-4">Optional</td>
                  <td className="py-2">Anonymous usage analytics</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            You can manage your cookie preferences at any time using the cookie
            consent banner or by clearing your browser cookies.
          </p>
        </div>
      </section>

      {/* Your Rights */}
      <section className="glass-card space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Your Rights (GDPR)</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Under GDPR and applicable data protection laws, you have the right to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong className="text-foreground">Access</strong> – Request a copy of your personal data</li>
            <li><strong className="text-foreground">Rectification</strong> – Correct inaccurate data</li>
            <li><strong className="text-foreground">Erasure</strong> – Request deletion of your data ("right to be forgotten")</li>
            <li><strong className="text-foreground">Restriction</strong> – Limit how your data is processed</li>
            <li><strong className="text-foreground">Portability</strong> – Receive your data in a machine-readable format</li>
            <li><strong className="text-foreground">Objection</strong> – Object to processing based on legitimate interests</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <span className="text-primary">privacy@rre-os.com</span>.
            We will respond within 30 days.
          </p>
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Last updated: February 2026
      </p>
    </div>
  );
}
