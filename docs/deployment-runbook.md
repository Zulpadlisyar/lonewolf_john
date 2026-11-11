# Deployment Runbook: Staging & Production
**LoneWolf Sportswear Platform**

## 1. Staging Deployment Procedure (Automated)
Staging deploys automatically upon merging pull requests into the `develop` branch.

### Manual Staging Re-deploy (if needed)
```bash
git checkout develop
git pull origin develop
npm run preflight
# Trigger GitHub Action "Deploy to Staging" or via Vercel CLI
```

## 2. Production Deployment Procedure (Strict Approval Required)
Target Go-Live: **4 January 2027 (Task T23)**
Prerequisite: Signed Go/No-Go Decision from Task T22 (3 January 2027).

### Pre-Deployment Checklist
1. [ ] UAT signed off by Business Owner on Staging.
2. [ ] Zero open Critical or High defects.
3. [ ] Pre-deployment database backup snapshot taken and verified.
4. [ ] Production environment variables verified in Secret Manager (no missing keys).
5. [ ] Release notes prepared with commit SHA and migration list.

### Step-by-Step Production Release Execution
1. Create release branch and tag:
   ```bash
   git checkout main
   git merge develop
   git tag -a v1.0.0 -m "Release v1.0.0 - Production Go-Live"
   git push origin main --tags
   ```
2. In GitHub Actions, navigate to **Deploy to Production** and approve deployment gate.
3. Observe live build logs and database migration execution.
4. Execute Production Smoke Test immediately:
   - Check `https://lonewolfapparel.com/api/health`
   - Verify Homepage and Brand Stories rendering.
   - Verify Catalog browsing and variant price/stock display.
   - Verify Payment Gateway live webhook handshake.
5. Notify Owner & Team via communication channel.

