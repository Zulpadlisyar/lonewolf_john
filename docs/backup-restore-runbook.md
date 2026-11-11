# Backup & Restore Runbook: Disaster Recovery
**LoneWolf Sportswear Platform**

## 1. Targets & Retention
- **RPO (Recovery Point Objective)**: ≤ 24 hours (Automated Daily Snapshot) / ≤ 15 minutes (with PITR).
- **RTO (Recovery Time Objective)**: ≤ 4 hours for full application & database restoration.
- **Retention Policy**: 30 daily automated snapshots retained off-site.

## 2. Automated Backup Strategy
Managed PostgreSQL (Neon / Supabase / Railway) executes daily automated snapshots at 02:00 AM WIB (low traffic window).

### Pre-Deployment On-Demand Snapshot Command
Before any release or migration is applied to production:
```bash
# Call provider snapshot API or CLI
# Example: neon branches create --from main --name pre-deploy-$(date +%Y%m%d%H%M)
```

## 3. Database Restore Rehearsal Procedure (Mandatory on Task T21)
Before Production Go-Live, a complete restore rehearsal MUST be conducted into an isolated scratch/staging database:
1. Identify target snapshot timestamp.
2. Restore snapshot to a separate temporary database instance (`lonewolf_restore_test`).
3. Connect test worker and run verification queries:
   ```sql
   SELECT count(*) FROM users;
   SELECT count(*) FROM orders;
   SELECT count(*) FROM products;
   ```
4. Record restore duration, data integrity status, and date in `Preflight Checklist` on Google Sheets.
5. Terminate temporary restore database instance.

## 4. Post-Restore Payment Reconciliation
If a production database restore is ever required:
1. Export transaction logs from Midtrans / Xendit Merchant Dashboard for the incident period.
2. Cross-reference order numbers and settlement statuses.
3. Manually re-apply confirmed paid orders into the database via administrative script.
4. **NEVER ask customers to pay twice for an order already settled at the gateway.**
