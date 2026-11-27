# Engage Stay mandatory UI release acceptance
All applicable checks require PASS and evidence for the exact release commit. N/A requires a documented reason. Pending or failed checks block UI acceptance.

| Check | Required evidence | Status |
| --- | --- | --- |
| Visual consistency | Module screenshots and review | PENDING |
| Typography | Native SF system stack and computed styles | PENDING |
| Colours | Approved tokens and contrast measurements | PENDING |
| Spacing and layout | Alignment and overflow review | PENDING |
| Components | Shared component adoption and interaction tests | PENDING |
| Iconography | Consistent family, sizing and stroke review | PENDING |
| Responsive UI | Browser tests at 360, 390, 430, 768, 1024, 1280, 1366, 1440, 1920 CSS pixels | PENDING |
| Accessibility | WCAG 2.2 AA automated and manual keyboard/screen reader checks | PENDING |
| UI states | Loading, empty, error and success tests | PENDING |
| Design system | Token and reusable component audit | PENDING |

Record commit SHA, preview URL, test environment, reviewer, evidence links and defects. Use isolated test data; never run destructive tests against production. Build, lint and core regression tests must pass. Browser automation, visual regression and required branch checks must be configured and verified before claiming an enforced release gate.
