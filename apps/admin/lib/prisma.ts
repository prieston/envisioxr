import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// TEMPORARY SETUP: Direct connection to Digital Ocean database
// TODO: Migrate to Prisma Accelerate for proper connection pooling
// When Accelerate is set up:
// 1. Remove getDatabaseUrl() function entirely
// 2. Remove datasources override from PrismaClient config
// 3. Use clean singleton pattern (see plan Setup A)
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return url;

  if (url.includes("connection_limit")) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  // Be conservative – 1 connection per PrismaClient
  // TEMPORARY: Until Accelerate is implemented
  return `${url}${separator}connection_limit=1&pool_timeout=10&connect_timeout=10`;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

globalForPrisma.prisma = prisma;

// No $disconnect() in serverless
