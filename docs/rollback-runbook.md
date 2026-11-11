# Rollback Runbook: Emergency Procedures
**LoneWolf Sportswear Platform**

## 1. Golden Principle: Application Rollback vs. Database Recovery
- **Application Rollback**: Reverting the web/API deployment to the previous stable release commit/build. **Fast (≤ 5 minutes), zero data loss.**
- **Database Recovery**: Restoring the database to a prior snapshot. **Extreme last resort only** — restoring an old database overwrites recent legitimate orders and customer payments.

## 2. Immediate Application Rollback Trigger
Rollback immediately if any of the following occur post-deployment:
- HTTP 5xx error rate > 2% on homepage or catalog.
- Checkout or Payment Gateway integration broken (customers cannot complete payment).
- Fatal JavaScript errors crashing the application UI.

### Application Rollback Steps
#### Option A: Via Hosting Platform Dashboard (Vercel / Railway)
1. Go to Deployment History.
2. Select the previous stable deployment (e.g. `v0.9.x` or previous successful SHA).
3. Click **"Instant Rollback / Promote to Production"**.
4. Propagation time: < 60 seconds.

#### Option B: Via Git Revert
```bash
git checkout main
git revert HEAD -m 1 --no-edit
git push origin main
```

## 3. Database Emergency Containment
If a database migration caused schema incompatibilities:
1. Enable `MAINTENANCE_MODE=true` in hosting environment variables to prevent inconsistent order states.
2. If backward-compatible migration strategy was followed, roll forward with a patch fix rather than destructive rollback.
3. If data corruption occurred, consult `docs/backup-restore-runbook.md` and reconcile all payment provider transactions first.

