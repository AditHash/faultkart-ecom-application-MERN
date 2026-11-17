# FaultKart — E-commerce Debugging Playground

**FaultKart is an intentionally imperfect MERN (MongoDB, Express, React, Node.js) e-commerce demo for a one-week multi-agent debugging assignment.**

This is a **local development / educational application**, not a production storefront. There is no real authentication or payment processing. It deliberately contains functional defects for an intern to discover, reproduce, prioritize, test, fix, and document. Do not deploy this demo publicly as a real store.

## What the demo does
- Browse a seeded catalog, filter/search/sort products.
- Add/update/remove items in a demo shopping cart.
- Apply a demo discount coupon, inspect totals, and place simulated orders.
- View order history and stock changes.

## Quick start
Requirements: Node.js 20+, npm, Docker (for local MongoDB), or a local MongoDB server.

```bash
git clone https://github.com/AditHash/faultkart-ecom-application-MERN.git
cd faultkart-ecom-application-MERN
docker compose up -d
npm install
npm run seed
npm run dev
```

Open http://localhost:5173. The API runs at http://localhost:4000.

If not using Docker, copy `server/.env.example` to `server/.env` and point `MONGODB_URI` at your MongoDB instance. Demo seed is idempotent and resets the demo catalog (not orders or cart).

## Assignment
See [docs/ASSIGNMENT.md](docs/ASSIGNMENT.md) for the one-week challenge, architecture, quality bar and deliverables. Use [docs/BUG_LOG.md](docs/BUG_LOG.md) to track reproducible findings and [docs/BUG_REPORT_TEMPLATE.md](docs/BUG_REPORT_TEMPLATE.md) for detailed reports.

**No answer key is committed to the public repository.** The intern should discover bugs via test-driven investigation, not hints embedded in source comments.

## Scripts
- `npm run dev` — start API and Vite web client
- `npm run seed` — load/reset demo products
- `npm test` — run baseline API unit tests
- `npm run dev:server` / `npm run dev:client` — run either service
