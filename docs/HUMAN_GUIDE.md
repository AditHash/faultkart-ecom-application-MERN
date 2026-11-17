# Human guide — FaultKart intern assignment

## Audience and goal
This guide is for the **intern and reviewer**, not for an autonomous coding agent. The intern must implement or orchestrate a multi-agent debugging workflow that investigates and repairs an intentionally flawed MERN e-commerce application. The hard part is designing evidence-based agent coordination, not prompting a single agent to rewrite the repo.

## Environment and setup
Requirements: Node.js 20+, npm, Docker (or MongoDB reachable locally), Git.

```bash
git clone https://github.com/AditHash/faultkart-ecom-application-MERN.git
cd faultkart-ecom-application-MERN
docker compose up -d
npm install
npm run seed
npm run dev
```

Open `http://localhost:5173` (web) and `http://localhost:4000/api/health` (API). If you run MongoDB without Docker set `MONGODB_URI`. Use simulated products, orders, and users only. If dependencies or Docker are unavailable, report the blocker with the exact command and output.

## What you must build
- A Python-based LangChain/LangGraph orchestrator with at least **three meaningful specialized agents**: triage/reproduction, backend/source analysis, and test/verification. A fourth agent for frontend/browser testing is encouraged.
- Multiple Model Context Protocol (MCP) connections, with clear separation of responsibility: GitHub for issues/PRs, filesystem or code-search for scoped source inspection, and browser or HTTP test tools for black-box validation.
- A durable **bug register** using `docs/BUG_LOG.md` or equivalent JSON/SQLite state, with IDs, severity, evidence, reproduction steps, ownership, status, test evidence and PR link.
- Human approval gates before source changes, issue/PR writes, external calls, or potentially destructive operations.
- At least one full demonstration: report → reproduce → failing test → proposed patch → human approval → verified fix → updated register.

## Five-day suggested schedule
| Day | Deliverable |
|---|---|
| 1 | Architecture and tool inventory; run app; baseline test results |
| 2 | Working MCP adapters, triage agent, reproducible bug checklist |
| 3 | Analysis and verification agents with handoffs and scoped evidence |
| 4 | Safe patch loop, regression tests, approval checkpoints, error handling |
| 5 | Recorded end-to-end demo, documentation, bug summary, reviewer handoff |

## Review criteria (100 points)
- Reproducible findings and test quality — 25
- Agent specialization and orchestration — 25
- MCP integration and tool boundaries — 20
- Human approval and safe writes — 15
- Logging, recovery, docs and demonstration — 15

## Rules for the intern
Do not claim a finding without a reproducible test or a clear manual sequence. Do not ask an LLM to invent a bug inventory. Separate observations, hypotheses and verified facts. Create focused PRs and preserve deliberately unfixed bugs for later exercises. Do not run scans outside this local educational application.

## Submission
Submit a link to your orchestrator code, architecture diagram, MCP inventory, bug register, at least three reproducible findings (or a documented limitation), regression tests, sample agent traces with secrets redacted, and a demo showing a human approval step.

**Reviewer note:** There is no public instructor answer key. Review evidence and working behavior; do not grade based on an assumed fixed number of bugs.
