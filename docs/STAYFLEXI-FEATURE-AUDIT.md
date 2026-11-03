# Friday Hospitality — feature comparison and release scope

Reviewed on 3 November 2026. Source: [Stayflexi documentation](https://support.stayflexi.com/docs/documentation/dashboard/).

## Coverage and limits

303 linked documentation URLs were attempted: 302 returned readable HTML and one returned HTTP 404. The index records every readable article and its image-reference count. There are 877 unique image URLs among 1,038 image references. Six key screenshots were visually inspected for rule pricing, demand pricing, housekeeping, night audit, stock and POS; the remaining images are inventoried, not individually verified. This is not a claim that all Stayflexi workflows or snapshots have been fully reproduced.

## Deployment scope

This release adds approval-based revenue rules and an Operations hub to the property workspace. Existing workflows remain in place. The modules use the current workspace storage model and existing authorization. No production database migration, payment-provider connection or live channel publishing is performed. The configured seeded workspaces have server-backed storage; the pre-existing browser-only fallback for other properties is unchanged and is not enterprise database parity.

The user selected approval-based pricing inside Friday. No predictive/market-demand AI or automatic pricing is claimed. The external Stayflexi implementation and algorithms are not available; the deterministic Friday engine is independently implemented.

## Detailed module comparison

### dashboard

**Status:** Existing, partial. **Friday source:** `Dashboard.jsx`.

Arrivals, departures, occupancy, guest balance and room status exist. City demand intelligence and provider-delivered guest links remain unconnected.

12 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/dashboard/).

### reservation calendar

**Status:** Existing, partial. **Friday source:** `pages/Calendar.jsx; CreateReservation.jsx; ReservationActions.jsx`.

Calendar, booking creation, room selection, date changes, cancellations and history exist. This release adds daily-rate quotes for new bookings. Enquiry expiry, room swaps, room locks, imports, signatures and complete hourly-stay workflows still need dedicated work.

32 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/reservation-calendar/).

### rates inventory

**Status:** Existing, partial. **Friday source:** `pages/RatesInventory.jsx; core/inventory.js`.

Daily rates and sellable inventory, validation and audit exist. Revenue changes now write these rates. OTA restrictions, channel parity, provider acknowledgements and full bulk operations remain incomplete.

40 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/rates-inventory/).

### housekeeping

**Status:** Core extension in this release. **Friday source:** `pages/HospitalityHub.jsx`.

Adds assignment, priority, instructions, individual cleaning status, vacant dirty-room bulk cleaning and CSV export. Advanced pivots, selective bulk operations and workforce scheduling are not included.

10 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/housekeeping/).

### conversations

**Status:** Existing, partial. **Friday source:** `pages/BusinessOperations.jsx`.

Internal guest communications and notes exist. Provider inbox sync, delivery receipts and OTA guest-message replies need supported messaging integrations.

6 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/conversations/what-is-the-conversation-feature-in-stayflexi-and-how-can-it-help-a-property/).

### review management

**Status:** Core extension in this release. **Friday source:** `pages/HospitalityHub.jsx`.

Manual feedback capture, 1–5 rating, source, handling status, response drafts and CSV export. No review ingestion, AI generation or publishing to review platforms.

4 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/review-management/).

### shops pos

**Status:** Core extension in this release. **Friday source:** `pages/HospitalityHub.jsx; core/hospitality.js`.

Menu catalogue, item availability, table orders, quantities, discount/service/tax calculation, full manually-recorded settlement, posting to an in-house guest folio and CSV export. KOT/printer routing, QR orders, transfers, partial payments and multi-outlet configuration are not included.

16 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/shops-pos/).

### reports

**Status:** Existing, partial. **Friday source:** `pages/Reports.jsx; pages/OwnerInsights.jsx`.

Occupancy, booking and finance reporting, owner comparisons and export exist. New operational CSV exports and nightly review snapshots added. Scheduled distribution, complete outlet accounting and prior-year comparable reporting require further work.

20 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/reports/).

### direct billing

**Status:** Core extension in this release. **Friday source:** `pages/HospitalityHub.jsx`.

Company/agent account, email/mobile/GSTIN, credit limit/days, linked reservations, outstanding balance and export. Linking does not settle guest folios. Consolidated invoices, account receivables ageing and batch settlement remain incomplete.

9 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/direct-billing/).

### revenue management

**Status:** Approval-based internal release. **Friday source:** `pages/RevenueManager.jsx; server src/revenue-engine.js`.

Occupancy, lead-time and weekday rules; category/date scope; percentage/fixed adjustment; deterministic priority; rate floor/ceiling; manual-price protection; preview/save/apply; version conflict checks; audit. New bookings quote applied daily prices. No market-demand AI, competitors feed, scheduler, coupons/promotions, absolute rate templates or OTA publication. User selected approval-based Friday-only pricing.

15 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/revenue-management/).

### expense manager

**Status:** Core extension in this release. **Friday source:** `pages/HospitalityHub.jsx`.

Expense date/category/description/amount/method, cash top-ups and withdrawals with purpose, recorded cash receipts/balance, movement history and CSV exports. No bank feed, reconciliation or accounting software integration.

11 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/expense-manager/).

### payments

**Status:** Existing sample-ledger support; external dependencies. **Friday source:** `pages/Finance.jsx; pages/FolioActions.jsx`.

Existing payment/refund records and folio balances are retained. New POS settlement records money already collected; it does not charge a card. Gateway payments, preauthorisation, saved-card tokens, payment links, automated charges, terminals and settlement webhooks need payment-provider integration.

18 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/payments/freedompay-integration/).

### configuration

**Status:** Existing, partial. **Friday source:** `pages/Settings.jsx; OwnerAdmin.jsx; RoomManagement.jsx; RatePlans.jsx`.

Property, category, rate-plan, staff and invoice settings exist. Advanced dependency pricing, shifts, hourly slots, notification delivery and full tax-policy compliance require dedicated validation and integration.

25 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/configuration/).

### night audit

**Status:** Review snapshots in this release. **Friday source:** `pages/HospitalityHub.jsx; core/hospitality.js`.

Date-based room-night value, occupancy, IST receipts, pending arrivals, overdue departures, missing-folio checklist, saved reviews and history. Does not close a business date, post daily charges, automatically mark no-shows or run unattended.

7 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/night-audit/).

### stock management

**Status:** Core extension in this release. **Friday source:** `pages/HospitalityHub.jsx`.

Items, units, opening stock, reorder levels, receipts/issues/wastage, reasons, movement history, nonnegative balance validation and CSV. Vendors, purchase orders, goods receipts, recipes, automatic POS consumption and multi-outlet stock remain incomplete.

8 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/stock-management/).

### folio

**Status:** Existing, partial. **Friday source:** `pages/FolioActions.jsx; ReservationActions.jsx; Invoices.jsx`.

Charges, payment/refund records, taxes, totals, reservation changes and invoices exist. POS room posting now links one order to one pre-tax folio charge with a matching tax rate. Saved cards, gateway operations, signatures, complex split/merge and bulk folio operations remain incomplete.

49 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/folio/).

### booking engine

**Status:** Not implemented. **Friday source:** `None`.

Requires a public availability/quote/hold/booking service, rate and promotion rules, fraud/rate limits, gateway integration, concurrency controls and guest confirmation flow. Existing admin booking forms are not a public booking engine.

5 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/booking-engine/).

### magic link

**Status:** Not implemented. **Friday source:** `None`.

Requires scoped expiring guest tokens, revocation, secure guest self-service endpoints, booking isolation, consent/notifications and self-check-in data retention. No guest URL is fabricated.

6 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/magic-link/).

### group dashboard

**Status:** Existing, partial. **Friday source:** `pages/PortfolioWorkspace.jsx; OwnerComparisonViews.jsx; OwnerTimeline.jsx`.

Portfolio filters, date scopes, scorecards, graphs, pie/data views and branch comparisons exist. Attribution by room nights versus cash and some year-on-year reporting still need consistent source ledgers.

7 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/group-dashboard/).

### help line

**Status:** Existing help screen, no vendor relationship. **Friday source:** `pages/Help.jsx`.

Friday help is separate from Stayflexi support services. No Stayflexi relationship manager or helpline is represented as a Friday service.

1 documentation pages inventoried. [Source](https://support.stayflexi.com/docs/documentation/help-line/).

## Revenue behavior

1. Create or edit a rule and set category/date scope, condition, adjustment and priority.
2. Set category minimum and maximum prices.
3. Preview reads current server inventory; it does not write rates.
4. Save persists the configuration, or Apply saves the configuration and changed rates after explicit confirmation.
5. A stale workspace version returns a conflict instead of overwriting concurrent changes.
6. The lowest priority number wins; prices use category base rates so repeated runs do not compound. Manual daily prices are skipped.
7. Prices apply to future inventory only. Existing reservation rates remain unchanged. New reservation quotes read the daily rates and preserve rate-plan supplements.
8. Disable/delete affects future evaluations and does not undo an already applied daily rate.

## What remains before full parity

- Full article-by-article acceptance criteria and visual review of every snapshot.
- Internal workflows listed as incomplete above, including promotions/templates, room swaps/locks, imports, consolidated direct billing, POS partial settlement/KOT, purchasing/recipes and business-date closing.
- External OTA, market data, messaging/reviews, gateway and terminal providers; contracts, credentials configured securely and provider sandbox acceptance tests.
- Public booking and guest magic-link services with secure identity, expiry, payment and inventory concurrency controls.
- A dedicated staging database and separately authorized schema rollout where needed; the prior production migration hold remains in effect.
- Full non-sample production persistence and broader role-specific financial controls.

## Validation

46 backend tests and 15 client business-rule tests passed. Focused lint and the production client build passed. Headless Chrome tests at 390px, 768px and 1440px exercised record creation, saving/reloading, stock, feedback, night-audit reviews, POS totals/settlement and revenue preview/application against isolated seeded records and the actual validators/handlers. These checks do not substitute for a live payment/OTA integration test or authenticated production database write verification. Source article inventory: `stayflexi-documentation-index.json`. No competitor screenshots are copied into Friday’s application assets.
