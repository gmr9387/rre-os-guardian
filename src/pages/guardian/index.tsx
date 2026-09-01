// src/pages/guardian/index.tsx
// add lifecycle section at the bottom

<section className="guardian-result-section">
  <h2>Claim Lifecycle</h2>
  {!lifecycle && <p>No lifecycle run yet.</p>}
  {lifecycle && (
    <div className="guardian-lifecycle-card">
      <div className="lifecycle-header">
        <span>Claim: {lifecycle.claimId}</span>
        <span>Org: {lifecycle.organizationId}</span>
        <span>State: {lifecycle.unifiedClaim.lifecycleState}</span>
      </div>
      <div className="lifecycle-events">
        <h3>Lifecycle Events</h3>
        <ul>
          {lifecycle.unifiedClaim.lifecycleEvents.map((evt, idx) => (
            <li key={idx}>
              <strong>
                {evt.from} → {evt.to}
              </strong>{" "}
              at {evt.timestamp} — {evt.reason}
            </li>
          ))}
        </ul>
      </div>
      <div className="lifecycle-claim">
        <h3>Original Claim Payload</h3>
        <pre>{JSON.stringify(lifecycle.unifiedClaim.originalClaimPayload, null, 2)}</pre>
        <h3>Repaired Claim Payload</h3>
        <pre>{JSON.stringify(lifecycle.unifiedClaim.repairedClaimPayload, null, 2)}</pre>
      </div>
    </div>
  )}
</section>
