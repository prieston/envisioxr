// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configure connection pool for serverless environments
// In production (Vercel/serverless), limit connections to prevent exhaustion
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return url;

  // If URL already has connection_limit, use it
  if (url.includes("connection_limit")) {
    return url;
  }

  // Add connection pool parameters for serverless
  // connection_limit: max connections per Prisma Client instance
  // pool_timeout: how long to wait for a connection
  // connect_timeout: how long to wait when connecting to the database
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}connection_limit=5&pool_timeout=10&connect_timeout=10`;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : ["error"],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

// Always set the singleton to reuse connections in serverless environments
// This prevents connection pool exhaustion in production
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

// In production, ensure we disconnect on process termination
if (process.env.NODE_ENV === "production") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
