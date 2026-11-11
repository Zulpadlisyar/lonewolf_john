# Incident Response & Babysitting Operations Guide
**Period: 4 January – 3 February 2027 (Tasks T24–T28)**

## 1. Incident Severity Matrix & SLA
| Severity | Description | Target Response | Target Resolution | Action Plan |
| :--- | :--- | :---: | :---: | :--- |
| **P0 (Critical)** | Entire storefront down; checkout or payment failing completely; data breach suspected. | ≤ 30 Mins | ≤ 2 Hours | Enable maintenance toggle; notify Owner; investigate payment/DB logs; rollback or deploy hotfix. |
| **P1 (High)** | Specific payment method failing (e.g. QRIS); stock mismatch/oversell; admin cannot fulfill orders. | ≤ 1 Hour | ≤ 4 Hours | Disable broken payment method; activate manual fallback; hotfix via `hotfix/*` branch. |
| **P2 (Medium)** | Courier tracking delayed; non-critical UI glitch on mobile; minor email delay. | ≤ 4 Hours | ≤ 24 Hours | Log issue; schedule patch release in next daily window. |
| **P3 (Low)** | Copy typo; minor styling imperfection. | Next Day | Next Sprint | Add to backlog. |

## 2. Emergency Checkout Killswitch
If checkout or payment recording fails, prevent customer frustration by toggling the emergency killswitch in hosting environment variables:
```env
CHECKOUT_DISABLED=true
```
This keeps the catalog and brand stories browsable while displaying an informative notice:
*"Our checkout is temporarily undergoing scheduled maintenance. Please check back shortly."*

## 3. Daily Babysitting Routine (4 Jan – 3 Feb 2027)
1. **08:30 WIB**: Check Uptime monitor & Sentry error rates from previous 24h.
2. **12:00 WIB**: Reconcile orders with Payment Gateway dashboard (match paid transactions vs recorded orders).
3. **17:00 WIB**: Verify courier booking & tracking update ages (flag orders paid >24h without resi).
4. **21:00 WIB**: Verify automated daily database backup status.
