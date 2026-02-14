import { ArrowLeft, Shield, AlertTriangle, Scale, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Legal() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Legal & Compliance</h1>
          <p className="text-sm text-muted-foreground">Terms of Service & Risk Disclosure</p>
        </div>
      </div>

      {/* Risk Disclaimer Banner */}
      <div className="glass-card border-warning/30 bg-warning/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-warning" />
          <div>
            <h2 className="text-lg font-semibold text-warning">Risk Disclaimer</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Trading financial instruments involves substantial risk of loss and is not suitable for every investor.
              Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      </div>

      {/* Terms of Service */}
      <section className="glass-card space-y-4 p-5">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Terms of Service</h2>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">1. Acceptance of Terms.</strong>{" "}
            By accessing or using RRE OS ("the Service"), you agree to be bound by these Terms.
            If you do not agree, do not use the Service.
          </p>
          <p>
            <strong className="text-foreground">2. Service Description.</strong>{" "}
            RRE OS is a trade re-entry intelligence platform that provides analytical signals,
            risk management tools, and optional automated order routing via connected brokerages.
            The Service does not provide financial advice, investment recommendations, or
            portfolio management.
          </p>
          <p>
            <strong className="text-foreground">3. No Fiduciary Relationship.</strong>{" "}
            RRE OS is not a registered broker-dealer, investment adviser, or financial planner.
            No fiduciary relationship is created between you and RRE OS by using the Service.
          </p>
          <p>
            <strong className="text-foreground">4. User Responsibility.</strong>{" "}
            You are solely responsible for all trading decisions made using the Service.
            You acknowledge that all trades—whether executed manually or via automated
            order routing—are your responsibility.
          </p>
          <p>
            <strong className="text-foreground">5. Brokerage Accounts.</strong>{" "}
            RRE OS does not hold, manage, or have withdrawal access to your funds. All
            capital remains within your connected brokerage account. Order execution is
            facilitated through your brokerage's API under your authorization.
          </p>
          <p>
            <strong className="text-foreground">6. Accuracy of Information.</strong>{" "}
            While we strive for accuracy, RRE OS makes no guarantees regarding the
            completeness, reliability, or timeliness of any data, signals, or analytics
            provided through the Service.
          </p>
          <p>
            <strong className="text-foreground">7. Service Availability.</strong>{" "}
            The Service is provided "as-is" without warranties of any kind. We do not
            guarantee uninterrupted access and are not liable for losses resulting from
            service outages, API failures, or connectivity issues.
          </p>
          <p>
            <strong className="text-foreground">8. Limitation of Liability.</strong>{" "}
            In no event shall RRE OS be liable for any direct, indirect, incidental,
            special, or consequential damages arising from the use of the Service,
            including but not limited to trading losses, lost profits, or data loss.
          </p>
          <p>
            <strong className="text-foreground">9. Modifications.</strong>{" "}
            We reserve the right to modify these Terms at any time. Continued use of the
            Service after changes constitutes acceptance of the updated Terms.
          </p>
        </div>
      </section>

      {/* Risk Disclosure */}
      <section className="glass-card space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-danger" />
          <h2 className="text-lg font-semibold">Risk Disclosure Statement</h2>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Market Risk.</strong>{" "}
            Trading in foreign exchange (Forex), contracts for difference (CFDs), indices,
            and commodities carries a high level of risk. Leveraged products can result in
            losses exceeding your initial deposit. You should not trade with money you
            cannot afford to lose.
          </p>
          <p>
            <strong className="text-foreground">Automated Execution Risk.</strong>{" "}
            When using Auto execution mode, orders are placed programmatically via your
            brokerage API. System errors, network latency, API rate limits, or brokerage
            outages may result in orders not being executed, partially filled, or executed
            at different prices than intended (slippage).
          </p>
          <p>
            <strong className="text-foreground">Signal Accuracy.</strong>{" "}
            Re-entry candidates, scores, and confidence ratings generated by RRE OS are
            algorithmic assessments based on historical patterns and market conditions.
            They are not predictions or guarantees of future performance.
          </p>
          <p>
            <strong className="text-foreground">Emotional & Behavioral Risk.</strong>{" "}
            The Emotional Volatility Index (EVI) and behavioral metrics are tools to promote
            trading discipline. They do not replace professional psychological or financial
            counseling.
          </p>
          <p>
            <strong className="text-foreground">Third-Party Dependencies.</strong>{" "}
            RRE OS relies on third-party services including brokerage APIs, data providers,
            and cloud infrastructure. We are not responsible for disruptions or errors
            originating from these services.
          </p>
        </div>
      </section>

      {/* Regulatory Notice */}
      <section className="glass-card space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Regulatory Notice</h2>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            RRE OS is a software tool and does not constitute a regulated financial service.
            Users are responsible for ensuring their use of the Service complies with
            applicable laws and regulations in their jurisdiction.
          </p>
          <p>
            If you are unsure whether trading is appropriate for your financial situation,
            consult a qualified financial advisor before using the Service.
          </p>
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Last updated: February 2026
      </p>
    </div>
  );
}
