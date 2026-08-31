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
    health,
    rulesHealth,
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
        <p>Healthcare-first deterministic risk and compliance engine.</p>
        <div className="guardian-health">
          <span>Risk Health: {health.status}</span>
          {health.timestamp && <span> · {health.timestamp}</span>}
        </div>
        <div className="guardian-health">
          <span>Rules Health: {rulesHealth.status}</span>
          {rulesHealth.timestamp && <span> · {rulesHealth.timestamp}</span>}
        </div>
      </header>

      <main className="guardian-main">
        <section className="guardian-form-section">
          <h2>Evaluate Claim Risk & Rules</h2>
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
              {loading ? "Evaluating..." : "Evaluate Risk & Rules"}
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
                        <strong>{flag.label}</strong> — {flag.severity}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {risk.details && (
                <div className="risk-details">
                  <h3>Details</h3>
                  <pre>{JSON.stringify(risk.details, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="guardian-result-section">
          <h2>Deterministic Rule Engine</h2>
          {!rules && <p>No rule evaluation yet.</p>}
          {rules && (
            <div className="guardian-rules-card">
              <div className="rules-header">
                <span>Claim: {rules.claimId}</span>
                <span>Org: {rules.organizationId}</span>
                <span>Rules Evaluated: {rules.rulesEvaluated}</span>
                <span>Tier: {rules.riskTier.toUpperCase()}</span>
                <span>Score: {rules.riskScore.toFixed(3)}</span>
              </div>
              <div className="rules-lists">
                <div>
                  <h3>Passed Rules</h3>
                  {rules.passed.length === 0 && <p>No passed rules.</p>}
                  {rules.passed.length > 0 && (
                    <ul>
                      {rules.passed.map((rule) => (
                        <li key={rule}>{rule}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3>Failed Rules</h3>
                  {rules.failed.length === 0 && <p>No failed rules.</p>}
                  {rules.failed.length > 0 && (
                    <ul>
                      {rules.failed.map((rule) => (
                        <li key={rule}>{rule}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="rules-flags">
                <h3>Flags</h3>
                {rules.flags.length === 0 && <p>No flags.</p>}
                {rules.flags.length > 0 && (
                  <ul>
                    {rules.flags.map((flag) => (
                      <li key={flag.code}>
                        <strong>{flag.label}</strong> — {flag.severity}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {rules.details && (
                <div className="rules-details">
                  <h3>Details</h3>
                  <pre>{JSON.stringify(rules.details, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
