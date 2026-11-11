# Local Development Standard & Onboarding Guide
**LoneWolf Sportswear Platform**

## Prerequisites
- Node.js 20.x or 22.x LTS (`node -v`)
- npm 10.x or pnpm 9.x (`npm -v`)
- Local PostgreSQL 16+ or Docker Desktop
- Git 2.40+

## Quickstart for Developer A & Developer B

### 1. Clone & Branch Setup
```bash
git clone <repository_url> lonewolf_john
cd lonewolf_john
git checkout develop
```

### 2. Configure Environment Variables
Copy the template and verify local placeholders:
```bash
cp .env.example .env.local
```
Update `.env.local` with your local database credentials if needed. Never commit `.env.local`.

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Synthetic Seeding
Generate Prisma client, apply schema migrations, and seed synthetic data:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront.
Open [http://localhost:3000/api/health](http://localhost:3000/api/health) to verify system health.

## Standard Development Commands
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Next.js dev server with hot reload |
| `npm run preflight`| Runs ESLint and TypeScript typecheck |
| `npm test` | Runs unit and integration test suites |
| `npm run build` | Compiles production build |
| `npm run db:studio`| Launches Prisma Studio GUI for database inspection |
| `npm run db:seed` | Idempotent synthetic data re-seeding |

