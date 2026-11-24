# FaultKart Defect Register — Branch B (Discovered Bug Inventory)

This document is the **comprehensive defect inventory** for **Branch B (`branch-b-bugs`)**. It catalogues all **42 functional, calculation, concurrency, and cybersecurity vulnerabilities** discovered in the FaultKart MERN application baseline (`main`).

In **Branch B**, the codebase remains in its original unpatched state as reproducible evidence. All verified fixes, regression tests, and certified patches are published in **Branch A (`branch-a-fixes`)**.

---

## 1. Master Defect Table (42 Identified Issues)

| ID | Title / Description | Component | Affected File & Lines | Severity | Status (Branch B) |
|---|---|---|---|---|---|
| **FK-101** | Price sorting order inverted | Server | `server/src/app.js` (lines 51-52) | High | Documented / Reproduced |
| **FK-102** | Cart item quantity exceeds product stock | Server | `server/src/app.js` (lines 70-78) | High | Documented / Reproduced |
| **FK-103** | Fixed discount allows negative order total | Server | `server/src/pricing.js` (lines 5-6) | High | Documented / Reproduced |
| **FK-104** | Order history sorted oldest first | Server | `server/src/app.js` (line 160) | Medium | Documented / Reproduced |
| **FK-105** | Concurrency race condition oversells last stock item | Server | `server/src/app.js` (line 146) | High | Documented / Reproduced |
| **FK-106** | "Buy Now" button checks out entire existing cart | Client | `client/src/main.jsx` (lines 93-99) | High | Documented / Reproduced |
| **FK-107** | Orders allowed without delivery address via API | Server | `server/src/app.js` (lines 120-127) | High | Documented / Reproduced |
| **FK-108** | Invalid coupon codes show success without error | Server/Client | `server/src/pricing.js` (lines 4-6) | Medium | Documented / Reproduced |
| **FK-109** | Malformed/non-string coupon causes server crash (500) | Server | `server/src/pricing.js` (lines 4-5) | High | Documented / Reproduced |
| **FK-110** | Applied coupon state lost on page refresh | Client | `client/src/main.jsx` (lines 31, 120-133) | Medium | Documented / Reproduced |
| **FK-111** | Brand search query fails to match products | Server | `server/src/app.js` (line 39) | Medium | Documented / Reproduced |
| **FK-112** | Ratings sort ranks worst-rated items first | Server | `server/src/app.js` (line 53) | Medium | Documented / Reproduced |
| **FK-113** | Category filter reset on shop navigation | Client | `client/src/pages/Shop.jsx` (line 30) | Low | Documented / Reproduced |
| **FK-114** | Mobile product filters drawer inaccessible | Client | `client/src/pages/Shop.jsx` | Medium | Documented / Reproduced |
| **FK-115** | Mobile header missing Wishlist shortcut | Client | `client/src/Header.jsx` (line 137) | Low | Documented / Reproduced |
| **FK-116** | Pagination drops 12th item of every page | Client | `client/src/pages/Shop.jsx` (line 57) | High | Documented / Reproduced |
| **FK-117** | Image zoom transform origin miscalculated | Client | `client/src/pages/Product.jsx` (lines 6-7) | Low | Documented / Reproduced |
| **FK-118** | Missing session header shares state across users | Server | `server/src/http.js` (lines 3-5) | Critical | Documented / Reproduced |
| **FK-119** | Malformed wishlist-delete product ID unvalidated | Server | `server/src/app.js` (lines 110-113) | Medium | Documented / Reproduced |
| **FK-201** | Subtotal calculation floating-point precision error | Server | `server/src/pricing.js` (line 2) | Medium | Documented / Reproduced |
| **FK-202** | Deleting nonexistent cart item does not 404 | Server | `server/src/app.js` (lines 92-96) | Low | Documented / Reproduced |
| **FK-203** | "Move to Cart" from saved list ignores stock status | Server | `server/src/app.js` (lines 197-205) | Medium | Documented / Reproduced |
| **FK-204** | Rapid double-click on Place Order duplicates order | Client | `client/src/pages/Checkout.jsx` (lines 30-58) | High | Documented / Reproduced |
| **FK-205** | Gift card balance deduction race condition | Server | `server/src/app.js` (lines 132-135) | High | Documented / Reproduced |
| **FK-206** | Free delivery banner displays when below threshold | Client | `client/src/pages/Cart.jsx` (line 14) | Low | Documented / Reproduced |
| **FK-207** | Delivery pincode validator accepts invalid characters | Server | `server/src/account.js` (line 120) | Medium | Documented / Reproduced |
| **FK-208** | Unsupported payment type silently substitutes COD | Server | `server/src/app.js` (line 128) | Medium | Documented / Reproduced |
| **FK-209** | Order cancellation does not restore applied coupons | Server | `server/src/app.js` (lines 173-180) | Medium | Documented / Reproduced |
| **FK-210** | Out-of-stock badge still permits Add to Cart | Client | `client/src/pages/Product.jsx` (lines 95, 107) | Medium | Documented / Reproduced |
| **FK-SEC-01** | OWASP ZAP: Missing secure HTTP response headers | Server | `server/src/app.js` (lines 11-13) | High | Documented / Reproduced |
| **FK-SEC-02** | Mass Assignment vulnerability in user profile endpoint | Server | `server/src/account.js` (lines 88, 93) | Critical | Documented / Reproduced |
| **FK-SEC-03** | Prototype Pollution in mergeSettings helper | Server | `server/src/account.js` (lines 98-107) | Critical | Documented / Reproduced |
| **FK-SEC-04** | Stored XSS in customer review render | Client | `client/src/pages/Product.jsx` (line 66) | High | Documented / Reproduced |
| **FK-SEC-05** | Cache directory traversal vulnerability | Server | `server/src/images.js` (lines 11-15) | Medium | Documented / Reproduced |
| **FK-SEC-06** | Missing rate limiting on demo authentication endpoint | Server | `server/src/account.js` (lines 66-81) | Medium | Documented / Reproduced |
| **FK-SEC-07** | IDOR vulnerability on Wishlist endpoint | Server | `server/src/app.js` (lines 104-113) | Medium | Documented / Reproduced |
| **FK-SEC-08** | Permissive CORS configuration allows any origin | Server | `server/src/app.js` (line 12) | High | Documented / Reproduced |
| **FK-SEC-09** | PII leakage in public review response | Server | `server/src/account.js` (lines 56-62) | Medium | Documented / Reproduced |
| **FK-SEC-10** | SuperCoins calculation integer overflow vulnerability | Server | `server/src/app.js` (line 150) | High | Documented / Reproduced |
| **FK-SEC-11** | Unauthenticated review submission allows impersonation | Server | `server/src/account.js` | Medium | Documented / Reproduced |
| **FK-SEC-12** | Unsanitized address input stored in database | Server | `server/src/account.js` (lines 124-126) | Medium | Documented / Reproduced |
| **FK-SEC-13** | Lack of CSRF protection on mutation endpoints | Server | `server/src/app.js` | High | Documented / Reproduced |

---

## 2. Detailed Technical Breakdown & Reproduction Notes

### Group 1: Storefront, Search & Catalog

#### FK-101 — Price Sorting Order Inverted
* **Location:** `server/src/app.js:51-52`
* **Defect:** `price-asc` executes `b.price - a.price` (descending) and `price-desc` executes `a.price - b.price` (ascending).
* **Observed:** Sorting by "Price: Low to High" renders the most expensive items first.
* **Expected:** Low to high should sort `a.price - b.price`.

#### FK-102 — Cart Exceeds Stock
* **Location:** `server/src/app.js:70-78`
* **Defect:** `POST /api/cart/items` verifies `quantity <= 20` but never checks if `quantity > product.stock`.
* **Observed:** Shoppers can add 20 units of an item with only 1 unit in stock.

#### FK-103 — Fixed Discount Negative Total
* **Location:** `server/src/pricing.js:5-6`
* **Defect:** `FLAT100` subtracts 100 from `subtotal` without flooring at zero.
* **Observed:** Adding a ₹40 item with coupon `FLAT100` yields a total of `-₹60`.
* **Expected:** Total should never drop below zero: `Math.max(0, subtotal - discount)`.

#### FK-104 — Order History Sorted Oldest First
* **Location:** `server/src/app.js:160`
* **Defect:** Query uses `.sort({ createdAt: 1 })`.
* **Observed:** Users must scroll past years of historical orders to find their latest purchase.
* **Expected:** Should sort `.sort({ createdAt: -1 })` (newest first).

#### FK-105 — Stock Overselling Concurrency Flaw
* **Location:** `server/src/app.js:146`
* **Defect:** Stock decrement uses unconditional `$inc: { stock: -item.quantity }` after validation.
* **Observed:** Two simultaneous checkouts for a product with stock=1 will both succeed, leaving stock at -1.
* **Expected:** Atomic condition `Product.updateOne({ _id: item.productId, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } })`.

#### FK-106 — Buy Now Includes Full Cart Contents
* **Location:** `client/src/main.jsx:93-99`
* **Defect:** `addToCart(product, true)` pushes the item into the current shared cart and navigates to checkout.
* **Observed:** Any items previously placed in the cart are purchased alongside the "Buy Now" item.

#### FK-107 — Missing Delivery Address on API Orders
* **Location:** `server/src/app.js:120-127`
* **Defect:** Address validation only runs `if (delivery)`: if `delivery` is undefined or null, the order succeeds with no shipping address.

#### FK-109 — Server Crash on Malformed Coupon
* **Location:** `server/src/pricing.js:4-5`
* **Defect:** Direct invocation of `coupon.toUpperCase()` without type checks.
* **Observed:** Passing `coupon: null` or `coupon: { code: 'SAVE' }` triggers `TypeError: coupon.toUpperCase is not a function`, returning HTTP 500.

#### FK-111 — Brand Search Misses Products
* **Location:** `server/src/app.js:39`
* **Defect:** Text search concatenates `p.name + ' ' + p.category` and ignores `p.brand`.
* **Observed:** Searching for "Apple" or "Nike" returns empty if the brand name is not in the title or category.

#### FK-112 — Ratings Sort Ranks Worst First
* **Location:** `server/src/app.js:53`
* **Defect:** `sort === 'rating'` performs `a.rating - b.rating` (ascending).
* **Observed:** Products with 1.2 stars are shown ahead of products with 4.9 stars.

#### FK-116 — Pagination Drops 12th Item
* **Location:** `client/src/pages/Shop.jsx:57`
* **Defect:** `visible.slice(start, page * PAGE_SIZE - 1)`. In JavaScript, `slice` does not include the end index.
* **Observed:** On page 1 (PAGE_SIZE 12), `slice(0, 11)` only returns 11 items. The 12th product is omitted from all pages.

---

### Group 2: Cybersecurity & Session Flaws

#### FK-SEC-01 — Shared Anonymous Session State
* **Location:** `server/src/http.js:3-5`
* **Defect:** If `x-demo-session` header is missing, `session(req)` returns `'demo'`.
* **Observed:** Any visitor or API client omitting the header shares the identical cart, addresses, orders, and saved items with all other anonymous users.

#### FK-SEC-02 — Mass Assignment Vulnerability in Profile API
* **Location:** `server/src/account.js:88, 93`
* **Defect:** `const update = { ...req.body }; await User.updateOne({ sessionId }, { $set: update });`
* **Observed:** Callers can inject `{ "supercoins": 999999, "plusMember": true, "giftCardBalance": 50000 }` to arbitrarily escalate rewards and balances.

#### FK-SEC-03 — Prototype Pollution in mergeSettings
* **Location:** `server/src/account.js:98-107`
* **Defect:** Recursive property copy without filtering `__proto__`, `constructor`, or `prototype`.
* **Observed:** An attacker can pollute the `Object` prototype via nested preference JSON payloads.

#### FK-SEC-04 — Stored Cross-Site Scripting (XSS) in Reviews
* **Location:** `client/src/pages/Product.jsx:66`
* **Defect:** Review body rendered via `dangerouslySetInnerHTML={{ __html: review.body.replace(/\n/g, '<br/>') }}` without DOMPurify or HTML escaping.
* **Observed:** HTML `<img src=x onerror=alert(1)>` executes arbitrary script in the context of any viewer reading product reviews.

---

## 3. Branch Structure & Deliverables

* **Branch B (`branch-b-bugs`)**: This branch contains this comprehensive 42-defect inventory. Source files preserve the original unpatched logic for auditing and reproduction.
* **Branch A (`branch-a-fixes`)**: Contains clean, certified, and regression-tested patches resolving all listed flaws with passing unit and integration suites.
