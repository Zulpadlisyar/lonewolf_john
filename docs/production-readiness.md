# Production Readiness Checklist (Strictly Non-Secret)
**LoneWolf Sportswear Platform**

## 1. Security Baseline
- [ ] HTTPS enforced on root domain and www with auto-renewal.
- [ ] Custom 404 and 500 error pages implemented (zero stack trace leakage).
- [ ] Secure cookie attributes: `Secure`, `HttpOnly`, `SameSite=Lax`.
- [ ] Database credentials, payment live keys, and API tokens stored ONLY in hosting platform Secret Manager.
- [ ] Database port not accessible from public internet (Private networking / VPC allowlist).
- [ ] Admin panel protected by role-based access control and MFA.

## 2. Payment & Shipping Integration
- [ ] Payment gateway live webhook URL registered and verified.
- [ ] Webhook signature verification implemented with HMAC.
- [ ] Webhook idempotency handler active (duplicate events return 200 OK without double processing).
- [ ] Courier live API credentials active; fallback manual input of tracking numbers tested.

## 3. Email & Domain Reputation
- [ ] SPF TXT record configured: `v=spf1 include:... ~all`.
- [ ] DKIM public keys added and verified in DNS.
- [ ] DMARC record published: `v=DMARC1; p=quarantine; rua=...`.

## 4. Disaster Recovery & Rollback
- [ ] Automated daily database backup active.
- [ ] Restore rehearsal completed and verified in staging database.
- [ ] Application rollback procedure tested (< 5 minute redeployment of prior build).
- [ ] Emergency maintenance toggle tested (`CHECKOUT_DISABLED=true`).
