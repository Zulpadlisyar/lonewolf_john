import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "unknown";
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await db.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = "healthy";
  } catch (error) {
    dbStatus = "unhealthy";
    console.error("[HealthCheck] Database check failed:", error);
  }

  const isHealthy = dbStatus === "healthy";
  const status = isHealthy ? 200 : 503;

  const payload = {
    status: isHealthy ? "ok" : "degraded",
    environment: process.env.APP_ENV || process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    latencyMs: Date.now() - startTime,
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      system: {
        nodeVersion: process.version,
        memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
    },
    version: process.env.npm_package_version || "0.1.0",
  };

  return NextResponse.json(payload, { status });
}

