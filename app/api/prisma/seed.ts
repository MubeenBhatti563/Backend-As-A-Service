import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

const GB = (n: number) => BigInt(Math.round(n * 1_000_000_000));

async function main() {
  const plans = [
    {
      code: "HOBBY" as const,
      name: "Hobby",
      description: "For side projects and experiments.",
      priceCents: 0,
      isAvailable: true,
      maxProjects: 2,
      maxRealtimeConnections: 10,
      apiRequestsMonthly: BigInt(50_000),
      dbStorageBytes: GB(0.5),
      fileStorageBytes: GB(1),
    },
    {
      code: "PRO" as const,
      name: "Pro",
      description: "For production apps.",
      priceCents: 2000, // $20 / month
      isAvailable: true,
      maxProjects: 10,
      maxRealtimeConnections: 200,
      apiRequestsMonthly: BigInt(1_000_000),
      dbStorageBytes: GB(8),
      fileStorageBytes: GB(10),
    },
    {
      code: "ENTERPRISE" as const,
      name: "Enterprise",
      description: "Custom limits and pricing. Coming soon.",
      priceCents: null,
      isAvailable: false,
      maxProjects: null,
      maxRealtimeConnections: null,
      apiRequestsMonthly: null,
      dbStorageBytes: null,
      fileStorageBytes: null,
    },
  ];

  for (const p of plans) {
    await prisma.plan.upsert({ where: { code: p.code }, update: p, create: p });
  }

  console.log("✅ Plans seeded successfully.");
}

main().finally(() => prisma.$disconnect());
