# LoneWolf Sportswear — Brand Experience & Commerce Platform
> High-performance sportswear e-commerce platform and athlete community built with Next.js 15, TypeScript, Tailwind CSS, and PostgreSQL.

---

## 1. Project Overview & Schedule
- **Team**: 2 Developers (Person A & Person B).
- **Environment Topology**: 2 Shared Environments: Staging (`staging.lonewolfapparel.com`) and Production (`lonewolfapparel.com`).
- **Target Go-Live**: 4 January 2027.
- **Babysitting Window**: 4 January – 3 February 2027.
- **Project Master Database**: [Google Sheets Timeline & Checklist](https://docs.google.com/spreadsheets/d/1DDOC7zc41W8UmTDof-ZLzKvn18YSSHK46b15w4hQegs/edit?usp=sharing)
- **Local Timeline Copy**: [Lonewolf Gantt Timeline.xlsx](file:///Users/zulpadliharahap/Project/lonewolf_john/Lonewolf%20Gantt%20Timeline.xlsx)

---

## 2. Quickstart for Developers

### Prerequisites
- Node.js 20.x or 22.x LTS
- npm 10.x or pnpm 9.x
- Local PostgreSQL 16+ or Docker

### Installation & Run
```bash
# 1. Clone & checkout development branch
git checkout develop

# 2. Setup environment variables (never commit .env.local)
cp .env.example .env.local

# 3. Install dependencies
npm install

# 4. Generate Prisma client & apply database schema
npm run db:generate
npm run db:push

# 5. Seed synthetic sportswear catalog & test users (idempotent, zero PII)
npm run db:seed

# 6. Start local dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/api/health](http://localhost:3000/api/health) for system health check.

---

## 3. Git Branch & Release Flow
```text
feature/* (Developer Task)
    ↓ Pull Request (CI Checks: Lint, Typecheck, Test, Secret Scan)
develop (Auto-deploy to Shared Staging Environment)
    ↓ QA / E2E Testing / Business Owner UAT
main (Release Candidate Tag v*.*.*)
    ↓ Manual Approval Gate
Production Deployment (Target: 4 Jan 2027)
```

---

## 4. Documentation Index
- [Architecture & Environment Setup](file:///Users/zulpadliharahap/Project/lonewolf_john/docs/environment-architecture.md)
- [Local Development Standards](file:///Users/zulpadliharahap/Project/lonewolf_john/docs/local-development.md)
- [Deployment Runbook](file:///Users/zulpadliharahap/Project/lonewolf_john/docs/deployment-runbook.md)
- [Rollback Runbook](file:///Users/zulpadliharahap/Project/lonewolf_john/docs/rollback-runbook.md)
- [Disaster Recovery & Backup/Restore](file:///Users/zulpadliharahap/Project/lonewolf_john/docs/backup-restore-runbook.md)
- [Incident Response & Babysitting Guide](file:///Users/zulpadliharahap/Project/lonewolf_john/docs/incident-response.md)
- [Operations Handover Protocol](file:///Users/zulpadliharahap/Project/lonewolf_john/docs/operations-handover.md)
- [Production Readiness Checklist](file:///Users/zulpadliharahap/Project/lonewolf_john/docs/production-readiness.md)

