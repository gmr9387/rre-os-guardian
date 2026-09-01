// src/pages/guardian/index.tsx

import React, { useState } from "react";
import { useGuardian } from "../../hooks/useGuardian";

type ClaimFormState = {
  claimId: string;
  payload: string;
};

export default function GuardianPage() {
  const [form, setForm] = useState<ClaimFormState>({
    claimId: "",
    payload: "{}",
  });

  const {
    loading,
    error,
    risk,
    rules,
    scoring,
    killSwitch,
    repair,
    health,
    rulesHealth,
    scoringHealth,
    killSwitchHealth,
    repairHealth,
    evaluateClaim,
  } = useGuardian(import.meta.env.VITE_ORG_ID || "default-org");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let parsed: Record<string, any> = {};
    try {
      parsed = JSON.parse(form.payload || "{}");
    } catch {
      parsed = {};
    }
    await evaluateClaim(form.claimId, parsed);
  };

  return (
    <div className="guardian-page">
      <header className="guardian-header">
        <h1>Guardian Risk Console</h1>
        <p>Healthcare-first deterministic risk, rules, scoring, kill-switch & repair engine.</p>

        <div className="guardian-health">
          <span>Risk Health: {health.status}</span>
          {health.timestamp && <span> · {health.timestamp}</span>}
        </div>
        <div className="guardian-health">
          <span>Rules Health: {rulesHealth.status}</span>
          {rulesHealth.timestamp && <span> · {rulesHealth.timestamp}</span>}
        </div>
        <div className="guardian-health">
          <span>Scoring Health: {scoringHealth.status}</span>
          {scoringHealth.timestamp && <span> · {scoringHealth.timestamp}</span>}
        </div>
        <div className="guardian-health">
          <span>Kill-Switch Health: {killSwitchHealth.status}</span>
          {killSwitchHealth.timestamp && <span> · {killSwitchHealth.timestamp}</span>}
        </div>
        <div className="guardian-health">
          <span>Repair Health: {repairHealth.status}</span>
          {repairHealth.timestamp && <span> · {repairHealth.timestamp}</span>}
        </div>
      </header>

      <main className="guardian-main">
        <section className="guardian-form-section">
          <h2>Evaluate Claim</h2>
          <form onSubmit={onSubmit} className="guardian-form">
            <div className="form-field">
              <label htmlFor="claimId">Claim ID</label>
              <input
                id="claimId"
                type="text"
                value={form.claimId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, claimId: e.target.value }))
                }
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="payload">Claim Payload (JSON)</label>
              <textarea
                id="payload"
                value={form.payload}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, payload: e.target.value }))
                }
                rows={8}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Evaluating..." : "Evaluate"}
            </button>
          </form>

          {error && <div className="guardian-error">Error: {error}</div>}
        </section>

        <section className="guardian-result-section">
          <h2>Risk Result</h2>
          {!risk && <p>No risk evaluation yet.</p>}
          {risk && (
            <div className="guardian-risk-card">
              <div className="risk-header">
                <span>Claim: {risk.claimId}</span>
                <span>Tier: {risk.riskTier.toUpperCase()}</span>
                <span>Score: {risk.riskScore.toFixed(3)}</span>
              </div>
              <div className="risk-flags">
                <h3>Flags</h3>
                {risk.flags.length === 0 && <p>No flags.</p>}
                {risk.flags.length > 0 && (
                  <ul>
                    {risk.flags.map((flag) => (
                      <li key={flag.code}>
                        {flag.label} ({flag.severity})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="guardian-result-section">
          <h2>Rule Engine</h2>
          {!rules && <p>No rule evaluation yet.</p>}
          {rules && (
            <div className="guardian-rules-card">
              <div className="rules-header">
                <span>Rules Evaluated: {rules.rulesEvaluated}</span>
                <span>Tier: {rules.riskTier.toUpperCase()}</span>
                <span>Score: {rules.riskScore.toFixed(3)}</span>
              </div>
              <div className="rules-body">
                <h3>Passed</h3>
                <ul>
                  {rules.passed.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <h3>Failed</h3>
                <ul>
                  {rules.failed.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        <section className="guardian-result-section">
          <h2>Risk Scoring</h2>
          {!scoring && <p>No scoring yet.</p>}
          {scoring && (
            <div className="guardian-scoring-card">
              <div className="scoring-header">
                <span>Tier: {scoring.riskTier.toUpperCase()}</span>
                <span>Score: {scoring.riskScore.toFixed(3)}</span>
              </div>
              <div className="scoring-flags">
                <h3>Weighted Flags</h3>
                <ul>
                  {Object.entries(scoring.weightedFlags).map(
                    ([flag, weight]) => (
                      <li key={flag}>
                        {flag} — {weight}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          )}
        </section>

        <section className="guardian-result-section">
          <h2>Kill-Switch Decision</h2>
          {!killSwitch && <p>No kill-switch decision yet.</p>}
          {killSwitch && (
            <div className="guardian-killswitch-card">
              <div className="killswitch-header">
                <span>Decision: {killSwitch.decision}</span>
                <span>Reason: {killSwitch.reason}</span>
                <span>Timestamp: {killSwitch.timestamp}</span>
              </div>
              <div className="killswitch-flags">
                <h3>Flags</h3>
                <ul>
                  {killSwitch.flags.map((flag) => (
                    <li key={flag.code}>
                      {flag.label} ({flag.severity})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        <section className="guardian-result-section">
          <h2>Repair Engine (Repaired Claim)</h2>
          {!repair && <p>No repair executed yet.</p>}
          {repair && (
            <div className="guardian-repair-card">
              <div className="repair-header">
                <span>Claim: {repair.claimId}</span>
                <span>Org: {repair.organizationId}</span>
                <span>Timestamp: {repair.repairLineage.timestamp}</span>
              </div>
              <div className="repair-body">
                <h3>Repair Diffs</h3>
                {repair.repairLineage.diffs.length === 0 && (
                  <p>No changes applied.</p>
                )}
                {repair.repairLineage.diffs.length > 0 && (
                  <ul>
                    {repair.repairLineage.diffs.map((diff, idx) => (
                      <li key={idx}>
                        <strong>{diff.path}</strong>:{" "}
                        <code>{JSON.stringify(diff.before)}</code> →{" "}
                        <code>{JSON.stringify(diff.after)}</code>
                      </li>
                    ))}
                  </ul>
                )}

                <h3>Repair Notes</h3>
                {repair.repairLineage.notes.length === 0 && (
                  <p>No notes recorded.</p>
                )}
                {repair.repairLineage.notes.length > 0 && (
                  <ul>
                    {repair.repairLineage.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                )}

                <h3>Repaired Claim Payload</h3>
                <pre className="guardian-repair-payload">
                  {JSON.stringify(repair.repairedClaimPayload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
