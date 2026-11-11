# Environment Architecture: Staging & Production
**LoneWolf Sportswear Brand Experience & Commerce Platform**

## 1. Core Operating Principles
- **Strict Isolation**: Staging and Production databases, cloud storage buckets, payment keys, shipping keys, and email sinks must NEVER intersect.
- **Two Shared Environments**: Staging (`staging.lonewolfapparel.com`) and Production (`lonewolfapparel.com`). Local machines are isolated developer workspaces.
- **Single Source Code**: Both environments run the same codebase, differentiated solely through runtime environment variables.
- **Zero Production Testing**: All testing, QA, and rehearsals occur in Staging with synthetic data.

## 2. Infrastructure Topology

| Component | Staging Environment | Production Environment |
| :--- | :--- | :--- |
| **Domain** | `staging.lonewolfapparel.com` | `lonewolfapparel.com` (and `www.`) |
| **Public Access** | Restricted (Basic Auth / IP allowlist) | Open to public customers |
| **Search Indexing** | Blocked (`X-Robots-Tag: noindex, nofollow`) | Fully indexed (SEO enabled) |
| **Database** | Managed PostgreSQL (Staging Instance) | Managed PostgreSQL (Private VPC, SSL required) |
| **Database Data** | Synthetic Seed Data (zero PII) | Real customer & order transaction data |
| **Payment Gateway**| Midtrans Sandbox / Xendit Sandbox | Midtrans Live / Xendit Live |
| **Logistics API** | Biteship Sandbox / RajaOngkir Mock | Biteship Live API + Manual Resi Fallback |
| **Transactional Email**| Test Mailbox Sink (Mailtrap.io) | Verified Domain Sender (Resend / SendGrid) |
| **Object Storage** | Cloudflare R2 / S3 (prefix: `staging/`) | Cloudflare R2 / S3 (prefix: `production/`) |
| **Deployment Gate** | Automatic on merge to `develop` | Manual approval required on release tag (`main`) |

## 3. Deployment Flow & Branch Model
1. `feature/*` branched from `develop`.
2. PR to `develop` triggers automated CI quality checks (lint, typecheck, test, schema validate).
3. Merge to `develop` automatically deploys to Staging.
4. QA and Business Owner perform UAT on Staging.
5. On Release Gate (3 Jan 2027), approved `develop` is merged to `main` with release tag `v1.0.0`.
6. Production deployment requires explicit manual approval from authorized tech lead/owner.

