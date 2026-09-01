// src/pages/index.tsx

import React from "react";
import { Link } from "react-router-dom";

export default function IndexPage() {
  return (
    <div className="index-page">
      <header className="index-header">
        <h1>RRE OS Guardian</h1>
        <p>Welcome to the Risk & Repair Engine Console.</p>
      </header>

      <main className="index-main">
        <section className="index-section">
          <h2>Navigation</h2>
          <ul className="index-nav">
            <li>
              <Link to="/guardian">Guardian Console</Link>
            </li>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/insights">Insights</Link>
            </li>
            <li>
              <Link to="/history">History</Link>
            </li>
            <li>
              <Link to="/settings">Settings</Link>
            </li>
          </ul>
        </section>

        <section className="index-section">
          <h2>About Guardian</h2>
          <p>
            Guardian is a multi‑phase deterministic + intelligent risk engine
            designed for healthcare claims. It evaluates risk, rules, scoring,
            kill‑switch enforcement, and full‑claim repair with lineage.
          </p>
        </section>
      </main>
    </div>
  );
}
