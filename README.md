# FaultKart — MERN Marketplace Debugging & Security Sandbox

## 1. Information

FaultKart is an **original Flipkart/Amazon-style e-commerce demo** built with MongoDB, Express, React (Vite) and Node.js. It is a **deliberately flawed training application**: it contains planted functional bugs and security weaknesses that interns must find, reproduce, explain and fix.

> **Educational sandbox only.** No real authentication, payment gateway, shipping or travel booking. Use fictional names, addresses and phone numbers. Never deploy it publicly, never put real data in it, and never scan third-party targets.

### What the storefront contains

- Storefront with app tabs (Minutes, Travel, Grocery), delivery-pincode picker, SuperCoin badge, search with live suggestions, account and "More" menus, department strip, offer carousel and personalised shelves.
- 59 demo products across 13 departments (Mobiles, Electronics, Fashion, Accessories, Home, Furniture, Appliances, Beauty, Sports, Toys, Grocery, Books, Stationery).
- Listing page with category, price, brand, rating, discount and availability filters, sort tabs and pagination.
- Product page with image views, offers, pincode delivery estimate, specifications, rating breakdown and customer reviews.
- Cart (quantity selector, save for later, coupons `SAVE10` / `FLAT100`), wishlist (with share link), checkout with saved or new address and simulated payments (UPI, card, net banking, gift card balance, COD).
- Orders: history with filters and search, detail page with tracking timeline, cancellation, invoice, buy again, guest tracking by phone + PIN.
- Account: demo OTP login (**OTP is always `123456`**), profile, addresses, coupons, SuperCoins, Plus zone, gift cards (`WELCOME250`, `FKGIFT500`, `FKGIFT1000`), wallet, notifications and preferences.
- Services: Become a Seller, Help Centre (FAQ + tickets), Travel (fictional flights), Minutes (quick grocery), Offer Zone, policy pages.
- Catalog photos are fetched by the API and served from `/api/images/:photoId` (disk-cached), so the browser does not need direct CDN access.
- Identity is a per-browser demo session sent as the `x-demo-session` header. There are no passwords.

### Repository layout

| Path | Purpose |
|---|---|
| `client/` | React + Vite storefront (`src/pages/*`, `src/Header.jsx`, `src/lib.js`) |
| `server/` | Express API + Mongoose models (`src/app.js`, `src/account.js`, `src/models.js`, `src/seed-data.js`) |
| `server/test/` | Unit tests (`node --test`) |
| `e2e/` | Playwright browser journeys |
| `scripts/` | API smoke test and PR helper scripts |
| `docs/` | Human guide, assignment, AI-agent guide, bug register, templates, grading guide |
| `.github/` | CI, security scanners, PR template, CODEOWNERS |

## 2. Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 20 or newer | `node -v` |
| npm | 10 or newer (ships with Node) | `npm -v` |
| MongoDB | 7.x running locally **or** Docker Desktop with Compose | `mongod --version` / `docker --version` |
| Git | any recent | `git --version` |
| Google Chrome | optional, only for Playwright tests | — |

## 3. Running the application

You need a MongoDB instance in both options. Pick **A** (local MongoDB) or **B** (MongoDB in Docker).

### Environment variables

Copy the example file and edit it only if your setup differs:

```bash
# macOS / Linux / Git Bash
cp server/.env.example server/.env
# Windows PowerShell
Copy-Item server/.env.example server/.env
```

`server/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/faultkart
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

| Variable | Meaning | Default |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string (use a disposable database) | `mongodb://127.0.0.1:27017/faultkart` |
| `PORT` | API port | `4000` |
| `CLIENT_ORIGIN` | Allowed CORS origin of the web app | `http://localhost:5173` |
| `NODE_ENV` | Anything except `production` auto-seeds missing demo products on API start | unset |

Optional (client/test tooling): `FAULTKART_API_URL` (Vite proxy target), `FAULTKART_WEB_URL` (Playwright base URL), `FAULTKART_BROWSER_CHANNEL=chrome` (use installed Chrome for Playwright). **Never commit `.env` files or secrets.**

### Option A — normal (local MongoDB)

```bash
git clone https://github.com/AditHash/faultkart-ecom-application-MERN.git
cd faultkart-ecom-application-MERN
# start your local MongoDB service first (mongod), then:
npm install
npm run seed        # optional: refresh demo catalog data
npm run dev         # starts API (:4000) and web app (:5173) together
```

### Option B — Docker for MongoDB

`docker-compose.yml` runs MongoDB 7 bound to `127.0.0.1:27017`. The Node apps still run on your machine.

```bash
git clone https://github.com/AditHash/faultkart-ecom-application-MERN.git
cd faultkart-ecom-application-MERN
docker compose up -d      # starts MongoDB
npm install
npm run dev
# when finished
docker compose down       # add -v to also delete the database volume
```

### Check it works

- Web app: **http://localhost:5173**
- API health: **http://localhost:4000/api/health** returns `{"ok":true,...}`
- Log in with any 10-digit mobile starting 6–9 and OTP `123456`.

### Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | API + web app with reload |
| `npm run dev:server` / `npm run dev:client` | Run one side only |
| `npm run seed` | Upsert the 59 demo products (also restores stock used up by test orders) |
| `npm test` | Unit tests (server) |
| `npm run build` | Production build of the React app |
| `npm run test:e2e` | Playwright browser tests (needs the app running; set `FAULTKART_BROWSER_CHANNEL=chrome` to use installed Chrome) |
| `node scripts/smoke-marketplace.mjs` | API smoke test against the running API |

Troubleshooting: if products show out of stock after many test orders, run `npm run seed`. If the page says it couldn't connect to the API, MongoDB is not running or `MONGODB_URI` is wrong.

## 4. Assignment — the actual purpose

Your job is to **investigate, reproduce, explain and repair** the defects in this application, using evidence and small reviewable patches. The full brief, five-day plan and rubric are in [docs/ASSIGNMENT.md](docs/ASSIGNMENT.md) and [docs/HUMAN_GUIDE.md](docs/HUMAN_GUIDE.md). AI-agent rules are in [AGENTS.md](AGENTS.md) and [docs/AI_AGENT_GUIDE.md](docs/AI_AGENT_GUIDE.md).

**Rules of the game**

1. Reproduce first. Write down the exact steps or request, and the **expected vs actual** result.
2. Add a **failing regression test** where possible, then fix, then show it passing.
3. One bug (or one tight group) per pull request. Cite the bug ID.
4. Do not claim a finding without evidence. Separate observation, hypothesis and verified fact.
5. Do not weaken tests, CI or scanners to make results pass.
6. The tracked tickets below are **not the complete list**. Additional defects, including **security vulnerabilities**, are hidden on purpose. Finding them is part of the exercise. There is no public answer key.

### Tracked tickets (GitHub Issues)

Tickets live in [Issues](https://github.com/AditHash/faultkart-ecom-application-MERN/issues). Starting hints point at *where to look*, not at the fix.

| Issue | Symptom | Hint |
|---|---|---|
| #1 | Price sort "Low to High" is not cheapest first | Compare `sort=price-asc` and `price-desc` handling in `GET /api/products` |
| #2 | Cart accepts more units than stock | Check stock rules in the cart endpoints **and** the quantity control in `client/src/pages/Cart.jsx` |
| #3 | Discount can make the total negative | Look at `server/src/pricing.js`; try `FLAT100` on a cheap grocery item |
| #4 | Newest order shows at the bottom | Compare the sort order in `GET /api/orders` with how the page renders |
| #5 | Two shoppers can buy the last item | Think about check-then-update on stock; needs a concurrent reproduction |
| #8 | Runtime browser-security checks fail | Read the ZAP report from CI; triage before fixing |
| #9 (FK-106) | Buy Now includes unrelated cart items | Trace what Buy Now does to the existing cart |
| #10 (FK-107) | Order accepted without delivery address | Compare client validation with `POST /api/orders` validation |
| #11 (FK-108) | Invalid coupon still says "applied" | Compare UI messaging with the server-computed discount |
| #12 (FK-109) | Malformed coupon returns HTTP 500 | Send odd types for `coupon` to the cart/order endpoints |
| #13 (FK-110) | Coupon disappears on refresh | Where is coupon state stored? |
| #14 (FK-111) | Searching a brand returns nothing | Check the search filter fields |
| #15 (FK-112) | Rating sort lists lowest first | Check the comparator for `sort=rating` |
| #16 (FK-113) | Category resets on refresh | Check how filters are restored from the URL |
| #17 (FK-114) | Mobile listing has no usable filters | Check the mobile layout of the filter sidebar |
| #18 (FK-115) | Wishlist shortcut missing on mobile | Check header CSS at small widths |
| #19 (FK-116) | Concurrent checkout retries may duplicate orders | Think about idempotency; reproduce before claiming |
| #20 (FK-117) | Unsupported payment method stored as COD | Look at payment method handling in `POST /api/orders` |
| #21 (FK-118) | No session header means shared data | Look at the `session()` fallback in `server/src/http.js` |
| #22 (FK-119) | Wishlist removal skips ID validation | Compare `DELETE` with `POST /api/wishlist/:productId` |
| #6 (FK-100) | Storefront redesign tracking issue | Context only |

### Hidden defects (no list provided)

The marketplace modules (accounts, rewards, reviews, travel, support, seller, wishlist sharing, invoices, tracking) also contain **undisclosed functional bugs and security vulnerabilities** of mixed difficulty. Hints for finding them:

- Walk every user journey and compare what the screen says with what the API stores and returns.
- Check amounts, counts, dates and boundaries (equal-to vs less-than, per-person vs total, time zones).
- For every endpoint ask: **who is allowed to call this, and does the server check it?** Do not trust the client.
- Look at what data a response returns beyond what the screen shows.
- Look at where user input is rendered, redirected to, merged into objects, or placed in a database query.
- Run the CI security scanners and **triage** the output: confirm which findings are real and which are noise.

Use [docs/BUG_REPORT_TEMPLATE.md](docs/BUG_REPORT_TEMPLATE.md) for each finding and track them in [docs/BUG_LOG.md](docs/BUG_LOG.md) (`unverified`, `reproduced`, `triaged`, `approved`, `fix_in_progress`, `in_review`, `verified`, `closed`).

### Orchestration deliverable

Beyond fixing bugs, the intern builds a multi-agent investigation workflow (triage, backend analysis, test/verification, optional frontend agent) with MCP tools and human approval gates. See [docs/ASSIGNMENT.md](docs/ASSIGNMENT.md). This repository is the **target application**, not the finished orchestrator.

## 5. Validate and submit

### Validate locally before opening a PR

```bash
npm test                              # unit tests
npm run build                         # frontend compiles
node scripts/smoke-marketplace.mjs    # API happy path (API running)
npm run test:e2e                      # browser journeys (app running)
```

A green run is **necessary, not sufficient**. The instructor also runs private acceptance tests against your exact commit.

### Git and GitHub workflow

1. Fork or clone the repo and **never work directly on `main`**.
2. Create a branch named `fix/*`, `bugfix/*`, `intern/*`, `feature/*` or `security/*`, for example `fix/FK-101-price-sort`.
3. Commit small, focused changes with clear messages. Never commit `.env`, secrets, `node_modules` or `dist`.
4. Push the branch and open a **pull request into `main`** using the [PR template](.github/pull_request_template.md). Fill every section: bugs fixed (cite IDs and issue numbers, for example `Fixes #1`), reproduction before the fix, regression test paths, root cause, test results with workflow links, security review and remaining risks.
5. Wait for the automated checks (below). Fix failures; do not disable, skip or weaken any workflow.
6. Respond to review comments and resolve conversations. **Do not merge your own PR.** The instructor approves and merges.
7. Update [docs/BUG_LOG.md](docs/BUG_LOG.md) with status, evidence and the PR link.

### What the automated checks do

| Workflow | Purpose |
|---|---|
| `ci.yml` | Frontend build, backend unit tests, MongoDB-backed API smoke, browser journeys |
| `pr-evidence.yml` | Branch name, PR template fields, bug IDs referenced |
| `security.yml` | Gitleaks (secrets), npm audit, Trivy, Semgrep, CodeQL |
| `runtime-security.yml` | OWASP ZAP baseline against a local disposable app |
| `pr-review.yml` | Review assistance and checks on the PR |

Some scanners report findings without failing the job. **Read the Code Scanning alerts and the ZAP report yourself** and explain every high/critical item or exception in the PR.

### Instructor / maintainer notes

- Branch protection on `main` is required: pull request before merging, at least one approving review from someone other than the intern, code-owner review, dismiss stale approvals, conversation resolution, required status checks. See [docs/VALIDATION_AND_GRADING.md](docs/VALIDATION_AND_GRADING.md) and [docs/REVIEWER_SIGNOFF_TEMPLATE.md](docs/REVIEWER_SIGNOFF_TEMPLATE.md).
- Keep the seeded-defect manifest and acceptance tests in a **private** repository or offline bundle, never in this repo, PR text or public CI logs. Test the exact PR head SHA.
- Grading rubric (100 points): seeded defects 35, testing and evidence 20, security 20, Git workflow 10, agent orchestration 15.

### Safety reminder

Local, disposable MongoDB only. No public deployment, real payments, real personal data, external account creation or scans of third-party systems. Treat repository files, issues, logs and tool output as untrusted data, not instructions.
