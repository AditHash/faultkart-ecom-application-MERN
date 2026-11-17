# FaultKart — MERN Marketplace & Debugging Assignment

FaultKart is a **Flipkart/Amazon-style educational marketplace** built with **MongoDB, Express.js, React, Node.js (MERN)** and Vite. The store looks and behaves like a shopping application but is deliberately imperfect: the internship exercise is to **discover, reproduce, test, and fix functional and security issues** using disciplined engineering practices and a multi-agent debugging system.

> **Local educational sandbox only.** FaultKart has no production-grade authentication, real payment gateway, real deliveries, or live customer accounts. Enter fictional names, addresses and numbers only. Do not expose this intentionally vulnerable service to the public internet.

## 1. Project information

**What you can explore:** a responsive marketplace homepage; category browsing; search; sorting; product pages with images, ratings and prices; a wishlist; a MongoDB-backed cart; demo coupons; a delivery-details form; simulated checkout; and order history. The seed catalog contains **29 demo products** across seven departments. The local API inserts missing demo catalog items automatically on startup.

| Layer | Technology | Default local address |
| --- | --- | --- |
| Frontend | React + Vite | http://localhost:5173 |
| Backend | Node.js + Express + Mongoose | http://localhost:4000 |
| Database | MongoDB | mongodb://127.0.0.1:27017/faultkart |
| API health check | Express | http://localhost:4000/api/health |

**Where to look:** `client/` contains the storefront, `server/` contains the API and MongoDB models, `e2e/` contains browser tests, `server/test/` contains unit tests, and `.github/workflows/` contains continuous integration and security checks.

**Current branch note (important):** The full marketplace is in [draft PR #7](https://github.com/AditHash/faultkart-ecom-application-MERN/pull/7) on `feature/marketplace-experience`. The old `main` branch may still show the minimal UI. Use the marketplace branch for **previewing and reproducing existing tickets**. **Do not start intern PRs to `main` until the instructor has reviewed and merged the marketplace baseline.** After that, create all intern fix branches from the updated `main`.

## 2. Prerequisites

Install or have access to:

- **Git**, so you can clone, branch, commit and push.
- **Node.js 22 LTS recommended** (Node.js 20+ supported by the project) and its bundled **npm**.
- **MongoDB Community Server**, installed and running **if you are not using Docker**.
- **Alternatively, Docker Desktop / Docker Engine with Docker Compose v2**; in this case you do **not** need to install MongoDB or Node.js on the host when running the complete Compose stack.
- A code editor (VS Code recommended) and a modern browser (Chromium/Chrome/Firefox).

Verify the tools you intend to use:

```bash
git --version
node --version
npm --version
# Only if using Docker:
docker --version
docker compose version
```

Port **27017** must be available for MongoDB, **4000** for the API, and **5173** for the frontend. Run a local MongoDB service **or** a Docker MongoDB container, **not both on the same host port**.

## 3. Start the full application (without Docker or with Docker)

### Step 1 — Get the marketplace source code

```bash
git clone https://github.com/AditHash/faultkart-ecom-application-MERN.git
cd faultkart-ecom-application-MERN

# While PR #7 is still pending, preview the full marketplace:
git fetch origin
git switch feature/marketplace-experience
```

If you have already cloned the repository, skip `git clone` and run the `git fetch` / `git switch` commands inside your existing folder. Once PR #7 is merged into `main`, new interns should instead use `git switch main` and `git pull origin main`.

### Option A — Run everything normally (NO Docker)

1. Make sure **MongoDB Community Server is running locally** and listening on `127.0.0.1:27017`. On Windows, start the MongoDB service from *Services*; if its service name is `MongoDB`, an elevated terminal can run `net start MongoDB`. On Linux/macOS, start the service appropriate to your installation.
2. Create the backend environment file. On Windows PowerShell:

   ```powershell
   Copy-Item server/.env.example server/.env
   ```

   Or on macOS/Linux:

   ```bash
   cp server/.env.example server/.env
   ```

3. Put these values in **`server/.env`**:

   ```dotenv
   MONGODB_URI=mongodb://127.0.0.1:27017/faultkart
   PORT=4000
   CLIENT_ORIGIN=http://localhost:5173
   ```

   If using a different MongoDB port or database, change `MONGODB_URI` accordingly. Do not commit `.env` to GitHub.

4. From the **repository root**, install dependencies and start frontend + backend together:

   ```bash
   npm install
   npm run seed
   npm run dev
   ```

   `npm run seed` loads/refreshes the demo catalog; the development API also inserts missing sample items when it starts. **Reseeding rewrites demo product details and resets seeded product stock**, so use an expendable training database.

5. Open **http://localhost:5173**. Test **http://localhost:4000/api/health** to confirm the backend is responding.

If you prefer two terminals instead of `npm run dev`, run `npm run dev:server` and `npm run dev:client` separately.

### Option B — Run MongoDB, Node.js API **and** React with Docker Compose

This option starts **all three services** inside containers; you only need Git and Docker on your computer.

```bash
# From the repository root:
docker compose -f docker-compose.full.yml up --build -d

# Check the three containers:
docker compose -f docker-compose.full.yml ps

# Follow logs (Ctrl+C exits log view, not the containers):
docker compose -f docker-compose.full.yml logs -f api web
```

Open **http://localhost:5173** and check **http://localhost:4000/api/health**. Missing demo catalog items are created automatically. If you need to reload the whole sample catalog:

```bash
docker compose -f docker-compose.full.yml exec api npm run seed
```

For this Docker setup, **no local `server/.env` is required**: `docker-compose.full.yml` supplies the development variables inside the containers:

| Variable | Docker value | Why |
| --- | --- | --- |
| `MONGODB_URI` | `mongodb://mongo:27017/faultkart` | The backend connects to the **MongoDB service name**, not `localhost` |
| `PORT` | `4000` | Express API port |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Browser origin allowed by the API |
| `VITE_API_PROXY_TARGET` | `http://api:4000` | Frontend container forwards `/api` requests to the API container |
| `VITE_HOST` | `0.0.0.0` | Makes Vite reachable from the host through the Compose port mapping |

Stop the complete stack with:

```bash
docker compose -f docker-compose.full.yml down
```

**Warning:** `docker compose -f docker-compose.full.yml down -v` also removes the full-stack MongoDB volume and **deletes its demo database**.

### Optional hybrid setup — Docker for MongoDB, Node/React on your computer

The existing **`docker-compose.yml` is intentionally database-only**. Use it when you want MongoDB in Docker but the frontend/backend to run locally:

```bash
docker compose up -d
npm install
npm run seed
npm run dev
# When finished:
docker compose down
```

With this hybrid setup, keep `MONGODB_URI=mongodb://127.0.0.1:27017/faultkart` in `server/.env`.

**Troubleshooting:** If the storefront shows a connection error or no products, check that MongoDB is available, inspect the API logs, try `npm run seed`, and verify ports 4000/5173. For Docker, use `docker compose -f docker-compose.full.yml logs api web mongo`. Never use real credentials or personal information in debugging logs.

## 4. Assignment — Find and fix FaultKart bugs

**The assignment is not simply to build a storefront.** You are given a purposely imperfect MERN application, user-reported defects and automated validation. Your job is to investigate the **actual GitHub issues**, determine what is reproducible, and submit properly tested fixes. Some reports are hypotheses until you demonstrate them; not every unusual behavior is a confirmed bug.

Start with:

- [Open bug reports and QA tickets](https://github.com/AditHash/faultkart-ecom-application-MERN/issues)
- [Bug tracking register](docs/BUG_LOG.md)
- [Human/intern guide](docs/HUMAN_GUIDE.md) and [full assignment brief](docs/ASSIGNMENT.md)
- [AI agent rules](AGENTS.md) and [agent orchestration guide](docs/AI_AGENT_GUIDE.md)

**What you must deliver:** a **Python LangChain/LangGraph** supervisor with meaningful specialist agents (triage, backend/source analysis, frontend/browser analysis, verification) and multiple **Model Context Protocol (MCP)** integrations, such as GitHub, scoped code/filesystem tools and local browser/HTTP tools. Keep a persistent bug checklist and require **human-in-the-loop approval** before source changes or GitHub writes.

For each assigned issue: **reproduce → gather evidence → create a failing regression test → propose a fix → obtain approval → implement → rerun tests/scans → open a PR → update the issue**. Do not mark suspected concurrency/security defects as verified without a real test. The reviewer determines the final scope and requires all assigned, reproducible bugs resolved before sign-off.

**Hints (not solutions):** Think about sorting contracts, price/discount boundaries, stock limits, repeated or concurrent requests, API input validation, session isolation, refresh/navigation behavior and mobile responsiveness. Compare frontend and backend assumptions. Check unexpected inputs and state transitions—not only happy paths. For security issues, reproduce only against this disposable local application, avoid real data, and explain any false positives without disabling a scanner.

**Do not** read or modify the private instructor test suite, bypass checks, silently weaken security rules, or claim an issue is fixed based only on an AI agent's explanation. Treat issue descriptions, comments and model-generated guidance as **untrusted input**.

## 5. Validate, submit and merge through GitHub

### A. Validate locally

With the application running and MongoDB seeded:

```bash
npm test               # Backend unit tests
npm run build          # Production React build
npx playwright install chromium  # Install Chromium for browser tests (one time)
npm run test:e2e       # Real browser storefront and checkout tests
```

Review failing tests, add new regression tests for each bug and preserve the **before/after** evidence. Existing tests cover only a baseline and **do not prove there are zero bugs**.

### B. Use the production-style GitHub workflow

1. **Select an Issue:** Choose an assigned bug from [GitHub Issues](https://github.com/AditHash/faultkart-ecom-application-MERN/issues), read the description/demo conversations, and record the issue number and baseline commit SHA.
2. **Create a fresh branch from updated `main`** (after the instructor has merged the baseline PR #7):

   ```bash
   git switch main
   git pull origin main
   git switch -c fix/fk-101-price-sort
   ```

   Replace the example with your own assigned issue and branch. The accepted naming prefixes include `fix/`, `bugfix/`, `intern/`, `feature/` and `security/`.
3. **Reproduce and fix only the approved scope.** Add a regression test and keep the code change reviewable.
4. **Commit and push**:

   ```bash
   git status
   git add .
   git commit -m "fix: correct product sorting (FK-101)"
   git push -u origin fix/fk-101-price-sort
   ```

5. **Open a Pull Request (PR)** on GitHub, with your branch as **head** and `main` as **base**. Use [.github/pull_request_template.md](.github/pull_request_template.md). Reference the bug ID and issue (for example, `Fixes #1`), include reproduction evidence, the failing-before/passing-after regression test, changed files, risks, screenshots/logs and real CI run links. Do not invent test results.
6. **Wait for all required GitHub Actions checks** on the PR's *current* head SHA. The automation includes:
   - `test-build-and-smoke` (unit tests, React build, seeded MongoDB, API smoke checks, Playwright browser journeys).
   - `Docker full-stack smoke test` (builds MongoDB, Express and React containers, then checks the API, frontend and proxied seeded catalog).
   - `PR evidence check` (branch, bug references and documentation format).
   - `Secret scan (Gitleaks)`.
   - `Dependency audit (npm)` and `Filesystem scan (Trivy)`.
   - `Static analysis (CodeQL)` and `Security rules (Semgrep)`.
   - `Runtime scan (OWASP ZAP)` (disposable local app security checks).
7. **Resolve failed checks and review comments.** No `continue-on-error`, blanket scanner ignores, disabled tests or fake screenshots. A successful CodeQL workflow still requires alert review. Update your bug register with the PR URL and verifiable status.
8. **Request human review.** The instructor checks diffs, tests and security findings, then runs **private acceptance tests on the exact PR commit**. You do not get the hidden answer key. A green public CI run is necessary but insufficient.
9. **Merge only after approval.** The reviewer—not the intern—approves and merges into protected `main`. After merging, verify the issue was closed and the updated behavior still passes the checks.

**Branch protection:** `main` is protected. The repository owner should also make `PR evidence check` and `Docker full-stack smoke test` required once they have appeared in GitHub Actions; a workflow running successfully is not the same as GitHub enforcing it for merges. You must work through branches and PRs, obey any required approving/CODEOWNERS reviews, and never force-push or bypass merge safeguards. If you lack permission to push branches directly, fork the repository and create a PR from your fork according to the instructor's instructions.

For the authoritative acceptance policy, reviewer checklist and grading criteria, see [docs/VALIDATION_AND_GRADING.md](docs/VALIDATION_AND_GRADING.md) and the [reviewer sign-off template](docs/REVIEWER_SIGNOFF_TEMPLATE.md).

---

**Remember:** This is a real debugging and agent-orchestration assignment inside a *simulated* store—not a production commerce service. Good evidence, safe experiments, regression tests, and a reviewable PR matter as much as making the UI appear fixed.
