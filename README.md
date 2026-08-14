# RRE OS

**A rapid re-entry operating system that turns stopout events into scored, executable trade candidates — built for funded-account traders who can't afford to freeze after a loss.**

-----

## The Problem

When a funded-account trader gets stopped out, the clock starts ticking. The setup may still be valid, but emotional friction, manual recalculation, and fear of compounding losses cause most traders to either revenge-trade recklessly or sit out entirely. Both responses bleed capital. There is no systematic, auditable workflow for deciding *whether* to re-enter, *where* to re-enter, and *how much risk* to allocate — all within the narrow window where the edge still exists.

-----

## Solution

RRE OS monitors your stopout events and automatically generates three scored re-entry candidates (Reclaim, Retest, Ladder) with calculated entries, stops, targets, and risk/reward ratios. Each candidate is scored against session context, symbol volatility, and your account's risk settings — then surfaced in a dashboard where you accept, adjust, or dismiss. Every decision is logged so you can replay your reasoning later.

-----

## Key Capabilities

| Capability                    | What It Actually Does                                                                 | Status   |
| ----------------------------- | ------------------------------------------------------------------------------------- | -------- |
| **Re-Entry Candidate Engine** | Generates 3 candidate types (Reclaim, Retest, Ladder) with entry/SL/TP after stopout  | `Stable` |
| **Real-Time P&L Tracking**    | Tracks starting balance, cumulative profit, daily performance, and R-multiples         | `Stable` |
| **Equity Curve**              | Visualizes balance or cumulative R over time with date range filters and preset zooms  | `Stable` |
| **Execution Modes**           | Switches between Assist, Auto, and Safe modes for different levels of automation       | `Stable` |
| **Risk Management**           | Daily loss limits, loss-streak locks, kill switch, and per-symbol caps                 | `Stable` |
| **Playbook Strategies**       | Store and tag your own trading playbooks for candidate context and post-trade analysis  | `Stable` |
| **Alpha Insights**            | Surfaces best sessions, symbols, and candidate types from your trading data            | `Beta`   |
| **Broker Integration**        | Paper and live execution via broker API (Alpaca)                                       | `Beta`   |

> `Stable` = production-ready · `Beta` = functional, API may shift · `Planned` = committed, not started

-----

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Client (React SPA)                          │
│  Dashboard · Candidates · Equity Curve · Insights · Playbook        │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ HTTPS (Supabase JS SDK)
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        Lovable Cloud Backend                         │
│                                                                      │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────────────┐ │
│  │  Auth        │  │  Edge Functions   │  │  Realtime Subscriptions │ │
│  │  (email +    │  │  generate-        │  │  (stopouts, candidates, │ │
│  │   Google)    │  │  candidates       │  │   daily_metrics)        │ │
│  └─────────────┘  │  verify-broker    │  └─────────────────────────┘ │
│                    │  execute-order    │                              │
│                    └──────────────────┘                               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │  PostgreSQL                                                      ││
│  │  stopout_events · reentry_candidates · daily_metrics             ││
│  │  account_settings · broker_connections · playbook_strategies     ││
│  │  RLS policies on all tables                                      ││
│  └──────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

**Decisions worth understanding before you fork or contribute:**

| Decision                                        | Why                                                            | What I ruled out                            |
| ----------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------- |
| Edge functions over a dedicated server           | Zero infra management, sub-second cold starts, scales to zero  | Express/Fastify — unnecessary ops overhead  |
| Single Postgres instance, no ORM                 | Direct SQL + RLS is simpler and auditable for this domain      | Prisma, Drizzle — abstraction not justified |
| Client-side candidate scoring display            | Keeps latency low; scoring logic lives in edge function        | Server-rendered dashboard — overkill for SPA|
| Realtime subscriptions over polling              | Traders need instant feedback after stopout events              | Polling — unacceptable latency              |

-----

## Stack

| Layer        | Choice                | Why This, Not That                                                  |
| ------------ | --------------------- | ------------------------------------------------------------------- |
| **UI**       | React 18 + TypeScript | Type safety matters when rendering financial data                   |
| **Styling**  | Tailwind CSS + shadcn | Rapid iteration with consistent design tokens                       |
| **Backend**  | Lovable Cloud         | Managed Postgres + Auth + Edge Functions, zero config               |
| **Database** | PostgreSQL            | RLS for row-level security, JSONB for flexible candidate metadata   |
| **Auth**     | Email + Google OAuth  | Low-friction signup for retail traders                               |
| **Charts**   | Recharts              | Lightweight, composable, good React integration                     |
| **Build**    | Vite 5                | Fast HMR, native ESM                                                |
| **Testing**  | Vitest                | Same config as Vite, fast unit tests                                |

-----

## Getting Started

### Prerequisites

| Tool    | Version      | Install                                          |
| ------- | ------------ | ------------------------------------------------ |
| Node.js | `>= 20 LTS` | [nvm](https://github.com/nvm-sh/nvm) recommended |
| npm     | `>= 10`      | Bundled with Node 20                              |

### Local Setup

```bash
# Clone
git clone <YOUR_GIT_URL>
cd rre-os

# Install
npm ci

# Start dev server
npm run dev
```

Open `http://localhost:5173`. HMR is enabled — changes reflect instantly.

-----

## Configuration

All config is environment-variable driven. No secrets in code.

The project's `.env` file holds the backend connection values and is provisioned automatically. A `.env.example` is included as a reference template if you need to recreate it:

```bash
cat .env
```


| Variable                          | Required | Description                  |
| --------------------------------- | -------- | ---------------------------- |
| `VITE_SUPABASE_URL`              | ✅        | Backend project URL          |
| `VITE_SUPABASE_PUBLISHABLE_KEY`  | ✅        | Backend public anon key (safe to expose; RLS protects data) |
| `VITE_SUPABASE_PROJECT_ID`       | ⬜        | Backend project reference id |

These are injected automatically for hosted builds.

-----

## Usage

1. **Sign up** via email or Google OAuth
2. **Dashboard** shows your account health, P&L summary, and equity curve
3. **Trigger a stopout** (or use the test button in development) to generate re-entry candidates
4. **Review candidates** — each card shows entry, SL, TP, R:R ratio, score, and confidence
5. **Accept, adjust, or dismiss** — every decision is logged for replay
6. **Switch execution modes** between Assist (manual confirm), Auto (execute on accept), or Safe (read-only)

-----

## Testing

```bash
npm run test          # Unit tests (Vitest)
```

-----

## Security

**Do not open a public issue for vulnerabilities.**

- All database tables enforce Row-Level Security (RLS)
- Authentication required for all data access
- Edge functions use service role keys server-side only
- No secrets stored in client code

-----

## Roadmap

| Version  | What                              | Status        |
| -------- | --------------------------------- | ------------- |
| **v1.0** | Core re-entry engine + dashboard  | ✅ Shipped     |
| **v1.1** | Alpha insights + playbook tagging | 🟡 In progress |
| **v1.2** | Live broker execution (Alpaca)    | 🔵 Planned     |
| **v2.0** | Multi-account support + analytics | 🔵 Planned     |

-----

## Contributing

Issues and PRs are welcome.

1. **For significant changes** — open an issue first
2. **Branch naming:** `feat/`, `fix/`, `chore/` prefixes
3. **Commits:** [Conventional Commits](https://www.conventionalcommits.org)
4. **Tests required** for any new behavior

-----

## License

MIT

-----

## Operational Context

This system was designed for environments where:
- Latency affects execution quality — stopout-to-candidate must be sub-second
- Auditability matters — every decision (accept, adjust, dismiss) is logged with context
- Workflows cross multiple services — broker APIs, risk engines, and scoring pipelines
- Operators need explainable outcomes — scores include fired rules, tags, and flags
- Interruptions create financial risk — a missed re-entry window is a missed edge

## System Philosophy

This project prioritizes:
- Deterministic workflows over opaque automation — every candidate is traceable to its stopout and scoring rules
- Explainability over magic — scores show *why*, not just *what*
- Operational visibility over hidden state — health banners, risk snapshots, and mode badges surface system status at all times
- Composability over lock-in — execution modes, playbook strategies, and candidate types are independently configurable
