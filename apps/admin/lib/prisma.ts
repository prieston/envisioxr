import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Always set the singleton to reuse connections in serverless environments
// This prevents connection pool exhaustion in production
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

