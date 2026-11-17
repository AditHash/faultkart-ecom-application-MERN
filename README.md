# FaultKart — Full MERN Marketplace & Debugging Challenge

FaultKart is an **original Flipkart/Amazon-style e-commerce demo**, built with MongoDB, Express, React, Node.js and Vite. It is an intentionally imperfect training application used for an intern's multi-agent debugging and security validation assessment.

> **Educational demo only.** There is no production authentication, payment gateway, shipping service, or real delivery. Use fictional addresses and phone numbers only.

## Marketplace features

- Responsive blue-and-yellow shopping storefront with promotions, category navigation, and product photography.
- 28 demo products across Electronics, Fashion, Accessories, Home, Appliances, Beauty, and Sports.
- Category browse, keyword search, sorting, product details, star ratings, offers and product highlights.
- MongoDB-backed shopping cart, quantity control, coupon previews (`SAVE10` and `FLAT100`), and wishlist.
- Delivery-address form, mock payment selection, order confirmation, and order history.
- Automatic **missing catalog** population on local API startup; no empty screen when MongoDB starts fresh.
- Explicit API connection error and image fallbacks.

## Getting started

Requirements: Node.js 20+, npm, Docker Desktop with Compose (or a local MongoDB service).

```bash
git clone https://github.com/AditHash/faultkart-ecom-application-MERN.git
cd faultkart-ecom-application-MERN
docker compose up -d
npm install
npm run dev
```

Open **http://localhost:5173**. API: **http://localhost:4000/api/health**. In development the API seeds missing sample items automatically. If your database is already populated, run `npm run seed` to refresh the demo catalog metadata.

If not using Docker, copy `server/.env.example` to `server/.env` and set `MONGODB_URI` to your local MongoDB. This isn't a hosted storefront.

### Branch preview

The redesigned marketplace is initially delivered in the `feature/marketplace-experience` branch for review. To try it before merge:

```bash
git fetch origin
git switch feature/marketplace-experience
docker compose up -d
npm install
npm run dev
```

For repeatable testing: `npm test` runs unit tests, `npm run build` builds the React frontend. CI also runs API smoke tests against disposable MongoDB.

## Student / human / AI documentation

- [Intern/human guide](docs/HUMAN_GUIDE.md)
- [AI agent guidelines](AGENTS.md) and [multi-agent operational guide](docs/AI_AGENT_GUIDE.md)
- [Assignment instructions](docs/ASSIGNMENT.md)
- [Bug register](docs/BUG_LOG.md) and [bug report template](docs/BUG_REPORT_TEMPLATE.md)
- [Instructor's QA and security review procedure](docs/VALIDATION_AND_GRADING.md)

Do not silently fix every seeded bug as part of the storefront design. The intern must discover, reproduce and repair the intentionally imperfect behavior. Maintain the instructor's hidden acceptance suite privately.

## Security and pull-request validation

The GitHub workflows check frontend build, backend tests, MongoDB-backed smoke paths, secret scanning, dependency and filesystem vulnerabilities, CodeQL, Semgrep and OWASP ZAP. A successful build is **not** proof that all bugs are fixed. The instructor must approve each final pull request after private acceptance tests and security review.

For development and testing use an isolated MongoDB instance and non-sensitive sample information. Don't deploy this app publicly as a commercial storefront.
