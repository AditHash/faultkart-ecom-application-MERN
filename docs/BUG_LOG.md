# FaultKart bug register

This register links **public customer/QA issue reports**, not verified fixes or hidden instructor answers. The target baseline for intern investigations is now **`main`** (commit `bc49b53` or later), which contains the full marketplace storefront merged through [PR #23](https://github.com/AditHash/faultkart-ecom-application-MERN/pull/23). The older draft [PR #7](https://github.com/AditHash/faultkart-ecom-application-MERN/pull/7) is superseded. Use disposable demo data only.

**How to work:** Pick an open ticket; confirm the symptom in the browser or via API, record the exact SHA and reproducible evidence, add a regression test, request scoped approval, fix on your own feature branch, attach the PR, and run every required functional/security workflow. **Do not mark suspected concurrency issues reproduced until demonstrated.**

| ID | Brief report | Priority | GitHub issue | Verification | Intern owner | Regression test | Fix PR |
|---|---|---|---|---|---|---|---|
| FK-101 | Price sorting wrong | Medium | [#1](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/1) | Needs intern evidence | Unassigned | Pending | — |
| FK-102 | Cart exceeds stock | High | [#2](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/2) | Needs intern evidence | Unassigned | Pending | — |
| FK-103 | Fixed discount allows negative total | High | [#3](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/3) | Needs intern evidence | Unassigned | Pending | — |
| FK-104 | Order history oldest first | Low | [#4](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/4) | Needs intern evidence | Unassigned | Pending | — |
| FK-105 | Last item can be oversold (concurrency) | High | [#5](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/5) | Needs intern evidence | Unassigned | Pending | — |
| FK-106 | Buy Now includes unrelated cart contents | Medium | [#9](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/9) | Needs intern evidence | Unassigned | Pending | — |
| FK-107 | Delivery address omitted via API | High | [#10](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/10) | Needs intern evidence | Unassigned | Pending | — |
| FK-108 | Invalid coupon shows success | Medium | [#11](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/11) | Needs intern evidence | Unassigned | Pending | — |
| FK-109 | Malformed coupon causes server error | Medium | [#12](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/12) | Needs intern evidence | Unassigned | Pending | — |
| FK-110 | Coupon lost on refresh | Medium | [#13](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/13) | Needs intern evidence | Unassigned | Pending | — |
| FK-111 | Brand-name search misses products | Medium | [#14](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/14) | Needs intern evidence | Unassigned | Pending | — |
| FK-112 | Ratings sort ranks worst first | Medium | [#15](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/15) | Needs intern evidence | Unassigned | Pending | — |
| FK-113 | Category filter lost on refresh | Medium | [#16](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/16) | Needs intern evidence | Unassigned | Pending | — |
| FK-114 | Mobile product filters unavailable | Medium | [#17](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/17) | Needs intern evidence | Unassigned | Pending | — |
| FK-115 | Mobile wishlist header shortcut missing | Low | [#18](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/18) | Needs intern evidence | Unassigned | Pending | — |
| FK-116 | Concurrent same-cart checkout duplicate risk | High | [#19](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/19) | Needs intern evidence | Unassigned | Pending | — |
| FK-117 | Unsupported payment type silently substituted | Medium | [#20](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/20) | Needs intern evidence | Unassigned | Pending | — |
| FK-118 | Missing session header shares anonymous shopping state | High | [#21](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/21) | Needs intern evidence | Unassigned | Pending | — |
| FK-119 | Malformed wishlist-delete ID unvalidated | Medium | [#22](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/22) | Needs intern evidence | Unassigned | Pending | — |
| FK-SEC-01 | OWASP ZAP browser-header review | High | [#8](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/8) | Needs intern evidence | Unassigned | Pending | — |

## Separate design issue

[FK-100 — Marketplace redesign (#6)](https://github.com/AditHash/faultkart-ecom-application-MERN/issues/6) was delivered in [PR #23](https://github.com/AditHash/faultkart-ecom-application-MERN/pull/23) and is closed. It is a **design upgrade**, not a bug that an intern must automatically re-fix.

## Undisclosed defects

The marketplace modules (accounts, rewards, reviews, travel, support, seller, wishlist sharing, invoices, order tracking) contain additional **functional bugs and security vulnerabilities that are intentionally not listed here**. Discovering them is part of the assignment. Add each confirmed finding to this table with a new `FK-` ID (use `FK-SEC-` for security findings) and open a GitHub issue using the [bug report template](BUG_REPORT_TEMPLATE.md). Do not copy exploit payloads into public issues; describe the impact and the reproduction steps at the level a reviewer needs.

## Workflow status lifecycle

`unverified` → `reproduced` → `triaged` → `approved` → `fix_in_progress` → `in_review` → `verified` → `closed`. Use `blocked` if evidence is incomplete. An issue is not fixed just because its title appears in this register. Record reproduction, tests, code-review approval, and the evaluated PR SHA.

Do not publish the instructor's private acceptance tests, full hidden oracle, secret credentials, or security tokens in this file. Scanner findings must be triaged by a human reviewer.
