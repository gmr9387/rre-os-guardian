# RRE-OS Guardian

> Rapid Re-Entry Operations System for structured post-stopout decision support, candidate scoring, risk controls, and execution workflows.

RRE-OS Guardian is a trading operations system designed to address a specific operational problem: what happens immediately after a trader experiences a stopout?

Rather than leaving the trader to manually reconstruct the situation and decide whether another opportunity exists, Guardian turns the post-stopout workflow into a structured sequence:

~~~text
Stopout Event
      ↓
Market / Trade Context
      ↓
Candidate Generation
      ↓
Deterministic Scoring
      ↓
Risk Evaluation
      ↓
Execution Path
      ↓
Outcome / Performance Tracking
~~~

Guardian combines deterministic candidate scoring, risk-aware execution workflows, trader performance analytics, and a real-time operator interface.

This is an independent engineering project developed around a real client-driven product concept. It is currently under active development and is not represented as a production-connected brokerage execution platform.

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Design Objective](#design-objective)
- [Core Capabilities](#core-capabilities)
- [Architecture](#architecture)
- [Decision Model](#decision-model)
- [Execution Model](#execution-model)
- [Risk Controls](#risk-controls)
- [Trader Intelligence](#trader-intelligence)
- [Data Architecture](#data-architecture)
- [Security](#security)
- [Realtime Operations](#realtime-operations)
- [Engineering Decisions](#engineering-decisions)
- [Engineering Incidents](#engineering-incidents)
- [Validation](#validation)
- [Current Capability Status](#current-capability-status)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Configuration](#configuration)
- [Project Status](#project-status)
- [Documentation and Evidence](#documentation-and-evidence)
- [Author](#author)

---

# Overview

Guardian explores a different approach to post-stopout trading operations.

A stopout can create a short decision window in which the trader must determine:

1. What happened?
2. Is another opportunity actually present?
3. Does the candidate satisfy the strategy?
4. Does the candidate satisfy the risk rules?
5. Should the trade be executed?
6. If executed, what happened afterward?

Traditional workflows can leave these decisions distributed across charts, broker interfaces, notes, spreadsheets, and trader memory.

Guardian centralizes the decision workflow.

The objective is not to predict the market with an opaque model.

The objective is to make the decision process structured, deterministic where appropriate, inspectable, and operationally actionable.

---

# The Problem

The system originated from a practical observation:

> A stopout does not necessarily end the trading opportunity, but the decision immediately afterward can become difficult to execute consistently.

The operational sequence can become:

~~~text
Stopout
   ↓
Emotional / cognitive disruption
   ↓
Reassessment
   ↓
Unstructured decision-making
   ↓
Hesitation
   ↓
Potential opportunity lost
~~~

Guardian was designed to replace that unstructured reaction with an explicit workflow:

~~~text
Stopout
   ↓
Context reconstruction
   ↓
Candidate generation
   ↓
Candidate scoring
   ↓
Risk evaluation
   ↓
Execution decision
   ↓
Performance feedback
~~~

The system therefore treats the post-stopout event as an operations problem, not simply a charting problem.

---

# Design Objective

Guardian is designed around five principles.

## 1. Deterministic Decision Logic

Scoring logic should be reproducible.

Given the same candidate inputs and scoring rules, the system should produce the same result.

## 2. Inspectability

A trader should not be expected to blindly trust a score.

The system is designed so candidate evaluation can be inspected rather than represented as an unexplained prediction.

## 3. Risk-Aware Execution

A candidate score does not automatically mean a trade should execute.

Candidate quality and execution authorization are separate concerns.

## 4. Separation of Domain State and Presentation

Database state represents the actual system state.

The UI can translate that state into human-readable terminology without corrupting the underlying domain model.

For example:

~~~text
Database state:
executed

UI presentation:
Confirmed
~~~

This distinction prevents presentation terminology from leaking into domain-state contracts.

## 5. Future Integration

The architecture is designed to support future broker/API integrations without making the current prototype dependent on a live broker connection.

---

# Core Capabilities

## Stopout Detection

Guardian models the stopout event as the beginning of a workflow rather than the end of one.

The event becomes the input to downstream candidate generation and analysis.

## Candidate Generation

The system generates re-entry candidates from available trading context.

Candidates can then move through scoring and risk evaluation before reaching an execution pathway.

## Deterministic Scoring

Guardian evaluates candidates using explicit scoring logic.

The scoring model is intended to provide:

- consistency
- repeatability
- inspectability
- explainability
- comparable candidate evaluation

The score is an operational decision-support mechanism, not a guarantee of profitability.

## Execution Modes

Guardian supports multiple execution modes so candidate evaluation can be separated from execution authorization.

The system distinguishes between workflows such as:

~~~text
Candidate
   ↓
Scored
   ↓
Risk Evaluation
   ↓
Manual / Controlled Execution
~~~

and future automated execution pathways.

This creates a boundary between:

- analytical decision support
- risk authorization
- trade execution

## Risk Controls

Guardian incorporates risk-aware workflow controls intended to prevent candidate scoring from becoming an unrestricted execution mechanism.

Risk-related behavior is treated as a first-class part of the system rather than an afterthought.

## Playbook Strategy Engine

Guardian includes a strategy/playbook model for reusable trading logic.

The intent is to move strategy behavior from informal trader memory into explicit operational structures that can be evaluated consistently.

## P&L and Equity Tracking

The system tracks performance information including:

- P&L
- equity curve
- trade outcomes
- candidate outcomes
- execution activity

This creates a feedback loop between decision-making and observed performance.

## Alpha Fingerprinting

Guardian includes an alpha fingerprinting model for representing trader-performance patterns.

Fingerprint data can contain structured characteristics that describe observed strengths and weaknesses.

The system uses flexible JSONB representation where the domain requires evolving analytical structures.

The UI defensively handles incomplete or empty fingerprint data.

## Operator Dashboard

The React application provides an operational interface for reviewing:

- candidates
- scoring
- execution state
- history
- settings
- performance
- insights

The interface is designed around reducing cognitive load rather than exposing every underlying database concept to the trader.

---

# Architecture

~~~text
┌──────────────────────────────────────────────────────────┐
│                     React Application                    │
│                                                          │
│ Dashboard · Candidates · History · Settings · Insights   │
│ Execution · P&L · Equity · Trader Intelligence           │
└─────────────────────────┬────────────────────────────────┘
                          │
                          │ Supabase Client
                          ▼
┌──────────────────────────────────────────────────────────┐
│                    Supabase Platform                     │
│                                                          │
│  PostgreSQL        Auth        Realtime        Storage    │
│                                                          │
│  Domain State      Identity   Event Updates   Data       │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                    Server Logic                          │
│                                                          │
│ Candidate Generation · Scoring · Execution · Verification│
│ Risk Controls · Broker Integration Boundaries            │
└──────────────────────────────────────────────────────────┘
~~~

---

# Decision Model

Guardian separates the decision process into distinct stages.

~~~text
1. Event
   ↓
2. Candidate
   ↓
3. Score
   ↓
4. Risk Evaluation
   ↓
5. Execution Decision
   ↓
6. Outcome
~~~

This separation is intentional.

A high candidate score does not inherently authorize execution.

Likewise, execution state does not redefine the underlying candidate score.

This separation allows each layer to evolve independently.

---

# Execution Model

Execution is modeled as an explicit workflow rather than a single UI action.

A simplified model:

~~~text
Candidate
   ↓
Eligible?
   │
   ├── No → Reject / Monitor
   │
   └── Yes
        ↓
     Risk Check
        │
        ├── Fail → Block
        │
        └── Pass
             ↓
        Execution Mode
             │
             ├── Manual
             │
             └── Automated / Future Broker Integration
~~~

The current system is designed around controlled execution pathways.

Direct live brokerage execution is not represented as a completed production capability.

---

# Risk Controls

Trading systems require explicit boundaries around execution.

Guardian therefore treats risk controls separately from candidate scoring.

Examples of control concerns include:

- execution mode
- candidate eligibility
- risk-state evaluation
- account context
- execution authorization
- kill-switch behavior
- persisted configuration

The objective is to prevent the UI from becoming the sole enforcement layer.

---

# Trader Intelligence

Guardian does not only evaluate individual candidates.

It also provides a framework for analyzing performance over time.

~~~text
Trades
   ↓
Outcomes
   ↓
Performance Data
   ↓
Patterns
   ↓
Alpha Fingerprint
   ↓
Trader Insights
~~~

This allows the system to explore questions such as:

- Which strategies perform consistently?
- Where does the trader tend to make mistakes?
- Which candidate characteristics correlate with stronger outcomes?
- Does performance change after stopouts?
- Which playbooks appear to perform better?

The current implementation should be treated as an analytical framework rather than a statistically validated predictive model.

---

# Data Architecture

Guardian uses Supabase/PostgreSQL as the primary persistence layer.

The data model represents functional domains including:

- accounts
- account settings
- kill-switch state
- webhook configuration
- stopout events
- re-entry candidates
- execution state
- trade history
- performance data
- P&L
- equity
- playbooks
- trader insights
- alpha fingerprints

The database represents durable system state while the React application provides the operational interface.

---

# Security

Guardian uses Supabase authentication and database-backed application state.

Security-related design concerns include:

- authenticated access
- account boundaries
- database persistence
- protected configuration
- controlled execution pathways
- webhook secret handling

Webhook secrets are generated and hashed before persistence rather than storing the generated secret in plaintext.

The system should not be interpreted as a production brokerage security certification.

---

# Realtime Operations

Guardian uses Supabase Realtime to provide responsive updates to the operator interface.

Realtime behavior is intended to reduce the need for manual refresh or continuous polling.

The general flow is:

~~~text
Database Event
      ↓
Supabase Realtime
      ↓
React Subscription
      ↓
UI Update
~~~

Subscription lifecycle and client state are treated as application concerns rather than assuming realtime connectivity is permanent.

---

# Engineering Decisions

## Centralized Scoring

### Problem

Candidate scores need to remain consistent regardless of which interface initiates the workflow.

### Options Considered

- client-side scoring
- duplicated scoring logic
- shared frontend/backend library
- centralized server-side scoring

### Decision

Centralize the authoritative scoring workflow in server-side logic.

### Why

This creates one authoritative decision path and reduces the risk of different clients producing different scores.

### Tradeoff

Centralization increases the importance of clear backend contracts and validation.

---

## RLS / Database Boundary

### Problem

Security should not depend exclusively on React UI behavior.

### Decision

Use database authorization boundaries rather than treating hidden UI controls as the security mechanism.

### Why

A malicious or malfunctioning client should not automatically gain access simply because a frontend control is bypassed.

### Tradeoff

Database authorization introduces additional schema and policy complexity.

---

## JSONB for Alpha Fingerprints

### Problem

Trader-performance fingerprints may evolve as the analytical model changes.

### Decision

Use JSONB for flexible fingerprint representation.

### Why

The structure can evolve without requiring a rigid relational schema for every analytical attribute.

### Tradeoff

JSONB reduces compile-time structural guarantees.

### Mitigation

The application handles missing and malformed structures defensively and applies safe defaults.

---

## Persistent Settings

### Problem

Configuration stored only in the UI is not authoritative.

### Decision

Persist operational settings in the database.

### Why

System behavior should not depend solely on browser-local state.

This is particularly important for controls such as execution modes and kill-switch state.

---

# Engineering Incidents

Real engineering work produced several useful failures and corrections.

## Domain State vs. Presentation State

The execution workflow initially created confusion between database state and UI terminology.

The database uses the domain state:

~~~text
executed
~~~

while the UI presents:

~~~text
Confirmed
~~~

The solution was to preserve the database's actual state model and explicitly map it to presentation terminology.

---

## Settings Were Not Authoritative

The initial Settings implementation did not fully persist operational configuration.

The solution was to connect the Settings interface to authoritative database records including:

- account settings
- kill-switch state
- webhook configuration

This moved important configuration from presentation state into durable system state.

---

## History Required Durable Data

The History interface needed to reconstruct previous candidate and trading activity from persisted records rather than relying on transient UI state.

The solution was to build the history workflow around durable database records and pagination.

---

## Authentication Recovery State

Password reset emails were successfully delivered, but the application did not correctly transition into the password-recovery interface.

The solution was to explicitly detect recovery state and render the password-update workflow.

---

## Backend Availability

The Supabase backend entering an inactive state produced symptoms that initially looked like application failures.

The investigation separated:

~~~text
Application Failure
        from
Backend Availability Failure
~~~

This led to clearer availability checks and troubleshooting.

---

## Empty Analytical Data

`alpha_fingerprint` could legitimately contain an empty JSON object.

The UI originally assumed expected arrays existed and attempted to call `.map()` on undefined values.

The solution was defensive handling with optional access and empty-array fallbacks.

---

## Build-Time Configuration

Removing the local `.env` file exposed an important distinction between:

- documented configuration
- build-time environment variables
- runtime configuration

The issue was corrected by restoring the required build configuration while keeping configuration guidance documented separately.

---

## Type-Safe UI Contracts

Status and mode values passed into the Badge component did not match the component's accepted variant types.

The solution was to introduce explicit mapping helpers rather than weakening TypeScript types.

This preserved the domain/UI boundary and made invalid presentation states harder to introduce.

---

# Validation

Guardian has been validated through several layers.

## Application Validation

Validation includes:

- TypeScript compilation
- production builds
- linting
- UI workflow testing
- candidate generation
- execution workflow testing
- settings persistence
- authentication recovery
- history reconstruction
- insight rendering

## Database Validation

Database-backed functionality includes verification of:

- persisted settings
- account state
- candidate records
- execution state
- historical records
- risk-related configuration
- webhook configuration

## Workflow Validation

Representative workflow:

~~~text
Stopout
   ↓
Candidate Generated
   ↓
Candidate Scored
   ↓
Risk Evaluated
   ↓
Execution Path Selected
   ↓
Outcome Recorded
   ↓
Performance Updated
~~~

The objective of validation is not simply to prove that individual screens render.

It is to verify that state transitions remain coherent across the workflow.

---

# Current Capability Status

| Capability | Status |
|---|---|
| React operator dashboard | Implemented |
| Candidate generation | Implemented |
| Deterministic candidate scoring | Implemented |
| Stopout workflow | Implemented |
| Execution modes | Implemented |
| Risk controls | Implemented / evolving |
| P&L tracking | Implemented |
| Equity tracking | Implemented |
| Playbook engine | Implemented |
| Trader insights | Implemented |
| Alpha fingerprinting | Implemented |
| Persistent settings | Implemented |
| Kill switch configuration | Implemented |
| Webhook secret generation | Implemented |
| Supabase persistence | Implemented |
| Realtime updates | Implemented |
| Authentication | Implemented |
| Password recovery | Implemented |
| Broker API integration | Future |
| Live brokerage execution | Future |
| Production trading deployment | Not claimed |
| Statistically validated predictive model | Not claimed |

---

# Known Limitations

Guardian is an active engineering project.

The following limitations are intentionally documented.

## Broker Integration

Live broker API integration remains future work.

The current architecture is designed to accommodate broker integration without claiming that a live brokerage connection already exists.

## Production Execution

Guardian should not be interpreted as a production brokerage execution system.

The execution architecture is being developed toward that capability.

## Predictive Validation

The scoring system is deterministic, but deterministic does not mean profitable.

Formal statistical validation across sufficiently large trading datasets remains future work.

## Production Load Testing

Formal high-volume production load testing has not been completed.

## UX

The current interface is functional but remains subject to continued refinement based on trader/operator feedback.

---

# Roadmap

## Near Term

- Expand automated workflow coverage
- Harden execution state transitions
- Expand risk-control verification
- Improve operational error handling
- Expand candidate-history analytics
- Improve trader insight visualization

## Broker Integration

Future integration may include:

- broker authentication
- account synchronization
- order submission
- order status synchronization
- execution confirmation
- position reconciliation
- broker error handling

## Advanced Risk

Future work may include:

- account-level risk budgets
- strategy-specific limits
- exposure controls
- daily loss controls
- execution throttling
- automated circuit breakers
- broker-side reconciliation

## Intelligence

Future work may explore:

- statistical candidate validation
- strategy performance analysis
- trader behavior modeling
- adaptive playbooks
- anomaly detection
- AI-assisted operational analysis

The core execution path should remain explainable and governed by explicit controls.

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Recharts

## Backend

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Realtime
- Supabase Storage
- Supabase Edge Functions

## Validation

- TypeScript
- ESLint
- Vitest
- database-level validation where applicable

## Development

- Git
- GitHub
- Lovable
- npm
- Bun

---

# Project Structure

~~~text
rre-os-guardian/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   ├── integrations/
│   └── ...
│
├── supabase/
│   ├── migrations/
│   └── ...
│
├── public/
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.ts
└── README.md
~~~

---

# Local Development

## Prerequisites

- Node.js
- npm
- Supabase project
- Git

## Clone

~~~bash
git clone https://github.com/gmr9387/rre-os-guardian.git
cd rre-os-guardian
~~~

## Install Dependencies

~~~bash
npm install
~~~

## Start Development Server

~~~bash
npm run dev
~~~

The Vite development server will provide the local application URL.

---

# Configuration

Guardian requires Supabase configuration for database-backed functionality.

Typical configuration includes:

~~~text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
~~~

Environment files containing credentials should not be committed to source control.

Server-side secrets must remain outside browser-exposed environment variables.

---

# Project Status

**Status:** Active development

Guardian began as a proposed workflow concept and progressed into a functional software system.

The client engagement is currently paused due to client health circumstances.

The system remains under development toward a future commercial deployment and potential broker integration.

Current development priorities focus on:

- execution-state hardening
- risk-control validation
- workflow reliability
- analytics
- broker integration architecture

---

# Documentation and Evidence

The primary engineering evidence for Guardian includes:

- source code
- database migrations
- application workflows
- Git history
- TypeScript types
- validation results
- Supabase configuration
- dashboard implementation
- candidate workflows
- execution workflows

Additional visual documentation may include:

- architecture diagrams
- dashboard screenshots
- candidate detail views
- scoring interfaces
- execution workflows
- P&L/equity views
- database schema views

---

# Engineering Approach

Guardian has been developed using an iterative engineering loop:

~~~text
Observe
   ↓
Form a System Model
   ↓
Identify Constraints
   ↓
Choose an Architectural Boundary
   ↓
Implement
   ↓
Validate
   ↓
Observe Failure
   ↓
Update the Model
   ↓
Remediate
   ↓
Retest
~~~

The emphasis is on correcting the underlying system model rather than treating every failure as an isolated UI bug.

Examples include:

- separating domain state from presentation state
- moving configuration into authoritative persistence
- separating backend availability from application failures
- distinguishing candidate scoring from execution authorization
- treating risk controls as system boundaries
- using defensive handling for flexible analytical data

---

# Engineering Positioning

Guardian demonstrates an end-to-end product engineering approach:

~~~text
Business Problem
      ↓
Domain Model
      ↓
System Architecture
      ↓
Database Design
      ↓
Application Logic
      ↓
Security Boundaries
      ↓
Operational Workflow
      ↓
Validation
      ↓
Iteration
~~~

The project is intentionally documented according to what is implemented and defensible today rather than presenting roadmap capabilities as completed functionality.

---

# Author

**George Rios**

Independent product engineer focused on building complete software systems across product design, application architecture, database systems, workflow automation, security boundaries, and operational tooling.

RRE-OS Guardian is an independent engineering project developed around a real client-driven product concept.
