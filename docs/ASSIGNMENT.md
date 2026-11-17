# FaultKart multi-agent debugging challenge

This document is the main **assignment brief**. Read [the human guide](HUMAN_GUIDE.md) for the five-day timeline, environment setup, submission requirements and grading rubric. Read [AI-agent guidance](AI_AGENT_GUIDE.md) and [AGENTS.md](../AGENTS.md) for tool restrictions and approval gates.

**Problem:** A deliberately imperfect MERN demo storefront must be investigated and repaired using coordinated LangChain/LangGraph agents and multiple Model Context Protocol (MCP) integrations.

**Expected system:** A supervisor delegates to triage, backend analysis, frontend inspection and verification specialists. Every suspected defect moves through an evidence-backed [bug register](BUG_LOG.md). Source code edits require human authorization. Include durable state, error recovery, regression tests and an end-to-end recorded demo.

**Scope:** Only this repository, a local disposable MongoDB instance, and local HTTP/browser sessions. Do not deploy, accept real payments, or connect to third-party production systems.

**Definition of done:** At least one demonstrated complete bug lifecycle plus a submitted list of reproducible findings (three is a target), a documented agent architecture, MCP permission matrix, approval trace, tests, logs and code for the orchestrator.

**Important:** This repo contains the *target application*, not a finished LangChain multi-agent solution. The intern builds the orchestration project as the assignment.
