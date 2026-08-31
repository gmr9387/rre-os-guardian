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
    health,
    rulesHealth,
    scoringHealth,
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

        <div className="guardian-health">
          <span>Scoring Health: {scoringHealth.status}</span>
          {scoringHealth.timestamp && <span> · {scoringHealth.timestamp}</span>}
        </div>
      </header>

      <main className="guardian-main">
        <section className="guardian-form-section">
          <h2>Evaluate Claim Risk, Rules & Scoring</h2>
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
                      <li key
