# Staging Environment Setup Guide (100% Free Stack)
**LoneWolf Sportswear Platform**

## 1. Zero-Cost Architectural Matrix
The entire Staging environment has been engineered to run with **zero recurring cloud costs** ($0/month) while maintaining enterprise-grade isolation, automated deployments, and end-to-end sandbox testing capabilities:

| Component | Free Provider | Free Tier Limits | Staging Purpose |
| :--- | :--- | :--- | :--- |
| **Hosting & CDN** | **Vercel Hobby Tier** | Unlimited preview deploys, 100 GB bandwidth, HTTPS | Storefront & API hosting on `lonewolf-staging.vercel.app` |
| **Access Protection** | **Next.js Middleware Basic Auth** | Built into app code, unlimited users | Blocks public visitors & search bots without Vercel Pro |
| **Database** | **Neon Serverless PostgreSQL** | 0.5 GB storage, Singapore region, automated daily snapshots | Isolated relational database with synthetic seed data |
| **Payment Gateway** | **Midtrans Sandbox** | Unlimited test transactions | Simulator for QRIS, Virtual Accounts, and test CC |
| **Shipping API** | **Biteship Sandbox + Built-in Mock** | Free test endpoints & realistic Indonesian tariffs | Ongkir calculation & mock resi generation |
| **Email Sink** | **Mailtrap.io Free Tier** | 100 test emails/month | Captures order confirmations; 0% real customer delivery |
| **Media Storage** | **Cloudflare R2 Free Tier** | 10 GB storage, $0 egress fees | Product and brand photos bucket: `lonewolf-media-staging` |
| **CI/CD Checks** | **GitHub Actions** | 2,000 build minutes/month for private repo | Automated linting, typechecks, tests, and deployment |

---

## 2. Step-by-Step Free Staging Provisioning

### A. Free Hosting Setup (Vercel Hobby)
1. Go to [vercel.com](https://vercel.com) and sign in using your GitHub account.
2. Click **Add New > Project** and import the `lonewolf_john` repository.
3. In **Environment Variables**, paste the variables from `.env.staging.example`.
4. Ensure `APP_ENV=staging` is set.
5. Deploy. Vercel assigns a live HTTPS URL (e.g., `https://lonewolf-staging.vercel.app`).

### B. Free Database Setup (Neon PostgreSQL)
1. Go to [neon.tech](https://neon.tech) and sign up for the free tier.
2. Create project `lonewolf-staging` in region **Asia Pacific (Singapore) - `ap-southeast-1`**.
3. Copy the pooled connection string (`sslmode=require`).
4. Set `DATABASE_URL` and `DIRECT_URL` in Vercel project environment variables.
5. Apply schema and seed data from your machine or CI:
   ```bash
   DATABASE_URL="postgresql://neondb_owner:***@ep-staging.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" npm run db:push
   DATABASE_URL="postgresql://neondb_owner:***@ep-staging.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" npm run db:seed
   ```

### C. Free Payment Sandbox (Midtrans)
1. Register free at [dashboard.midtrans.com](https://dashboard.midtrans.com) (no KYC required for Sandbox).
2. Switch toggle to **Sandbox Environment**.
3. Go to **Settings > Access Keys** and copy:
   - Server Key (`SB-Mid-server-...`)
   - Client Key (`SB-Mid-client-...`)
4. Go to **Settings > Configuration** and set the Notification Webhook URL:
   `https://lonewolf-staging.vercel.app/api/webhooks/payment`
5. Test payments using Midtrans Simulator:
   - BCA Virtual Account: `70012` + phone
   - QRIS: Scan mock QR on screen
   - Credit Card: `4111 1111 1111 1111` (CVV 123, OTP 112233)

### D. Free Email Sink (Mailtrap)
1. Register free at [mailtrap.io](https://mailtrap.io).
2. In **Email Testing > Inboxes**, create an inbox named `LoneWolf Staging`.
3. Copy SMTP host, port, username, and password into `SMTP_USER` and `SMTP_PASSWORD`.

---

## 3. How Staging Protection & Basic Auth Works
To keep staging 100% free without purchasing Vercel Pro ($20/month for password protection), [src/middleware.ts](file:///Users/zulpadliharahap/Project/lonewolf_john/src/middleware.ts) enforces HTTP Basic Authentication:
- **Credentials are required**: set `STAGING_AUTH_USER` and `STAGING_AUTH_PASS` in the Vercel staging environment. There are no default credentials; if either is missing, every protected route returns `503` and the site stays closed.
- **Public Whitelist**:
  - `/api/health` (open for monitoring uptime)
  - `/api/webhooks/*` (open for Midtrans webhook callbacks)
  - `/_next/*` and static assets

Every response in staging automatically carries:
```http
X-Robots-Tag: noindex, nofollow, noarchive
X-Environment: staging
```

---

## 4. Resetting & Redeploying Staging Safely
If test data becomes cluttered after extensive QA:
1. To safely wipe and re-seed staging data:
   ```bash
   # Reset and re-apply clean idempotent seed
   DATABASE_URL="<STAGING_DB_URL>" npm run db:push -- --force-reset
   DATABASE_URL="<STAGING_DB_URL>" npm run db:seed
   ```
2. To redeploy staging:
   Simply push or merge your feature PR into `develop`. GitHub Actions automatically verifies quality checks and triggers staging update.

