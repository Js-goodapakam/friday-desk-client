# English / Kannada feature status

This feature is incomplete and must not be released as full multilingual support.

## Implemented

- Dedicated feature/user-language-preferences branch and isolated worktree.
- i18next + react-i18next with bundled English/Kannada dictionaries; no translation API or external translation requests.
- Stable keys under common, navigation, settings and dashboard namespaces. English fallback, interpolation/plural forms, date/number/currency formatters and Kannada system-font fallbacks.
- Owner and branch navigation integrated. Branch dashboard's primary labels/KPIs integrated (not its entire text). Property/guest names and stored business statuses/records are untouched.
- Settings > Application Preferences > Language with Save Changes. Also available in owner settings. Save applies the UI language only after API success; failure is visible. GET failure disables saving rather than inventing persistence.
- Session restore and successful sign-in apply the user language before showing authenticated screens. Logout resets English; no shared localStorage preference exists.
- Existing framework, design, authentication and property data storage remain.

## Pending work

- Complete labels, placeholders, tooltips, dialogs, validation/error messages and dynamic display translations throughout login, owner analytics, reservations, guests, room/calendar operations, housekeeping, enquiries/groups, payments/folios/invoices, staff, reports and channel-manager/integrations/rates screens.
- Expand namespaces by module as those screens are migrated. Never translate stored status IDs, database values, user-entered records, names or API fields; translate display labels only.
- docs/i18n-inventory.json and scripts/i18n-inventory.mjs identify heuristic static-text candidates. This is not a coverage guarantee: attributes, dynamic strings and business-data boundaries need manual review.
- Kannada hospitality terminology needs fluent-speaker review. Full desktop/tablet/mobile clipping and browser accessibility QA remain.
- Live Supabase migration, persistence across devices, authenticated end-to-end save/reload/logout/login and PostgreSQL/RLS tests await an approved staging project and reconciliation of the production schema/security findings.

## Verification performed

- Production client build passed (existing large-bundle warning remains).
- 15 client tests passed: resource key parity, independent i18next instances, English fallback/pluralisation, and existing portfolio/property/inventory/reporting rules.
- Focused ESLint check for new i18n runtime, formatters and LanguagePreferences passed. Whole-repository lint and full visual QA have not passed/been completed.
- No production migration, policy update or deployment was performed.

## Development

Use npm ci in this feature worktree, npm run build, node --test src/i18n/resources.test.js src/core/*.test.js. Start the paired API with its isolated local development mode for preference testing. The existing main-branch app and its local database were not modified by this feature work.
