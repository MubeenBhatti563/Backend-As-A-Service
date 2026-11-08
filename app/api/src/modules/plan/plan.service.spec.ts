import { Test, TestingModule } from "@nestjs/testing";
import { PlanService } from "./plan.service";
import { PrismaService } from "../../infra/prisma/prisma.service";

const mockPlan = {
  id: "plan-1",
  code: "HOBBY",
  name: "Hobby",
  description: "For side projects and experiments.",
  priceCents: 0,
  currency: "USD",
  isAvailable: true,
  maxProjects: 2,
  maxRealtimeConnections: 5,
  apiRequestsMonthly: BigInt(50_000),
  dbStorageBytes: BigInt(500_000_000),
  fileStorageBytes: BigInt(250_000_000),
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const prismaMock = {
  plan: {
    findMany: jest.fn().mockResolvedValue([mockPlan]),
    findUniqueOrThrow: jest.fn().mockResolvedValue(mockPlan),
  },
  subscription: {
    findUnique: jest.fn().mockResolvedValue(null),
  },
  projectUsage: {
    findMany: jest.fn().mockResolvedValue([]),
  },
};

describe("PlanService", () => {
  let service: PlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PlanService>(PlanService);
  });

  afterEach(() => jest.clearAllMocks());

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ── getPublicPlans ──────────────────────────────────────────────────────────

  describe("getPublicPlans", () => {
    it("returns serialised plans with BigInt as string", async () => {
      const result = await service.getPublicPlans();
      expect(result.plans).toHaveLength(1);
      expect(result.plans[0].code).toBe("HOBBY");
      expect(result.plans[0].apiRequestsMonthly).toBe("50000");
      expect(result.plans[0].dbStorageBytes).toBe("500000000");
    });

    it("queries only available plans ordered by price", async () => {
      await service.getPublicPlans();
      expect(prismaMock.plan.findMany).toHaveBeenCalledWith({
        where: { isAvailable: true },
        orderBy: { priceCents: "asc" },
      });
    });
  });

  // ── getMyPlan ───────────────────────────────────────────────────────────────

  describe("getMyPlan", () => {
    it("falls back to Hobby plan when no subscription exists", async () => {
      const result = await service.getMyPlan("user-1");
      expect(result.plan.code).toBe("HOBBY");
      expect(result.subscription).toBeNull();
    });

    it("returns zero usage when no usage rows exist", async () => {
      const result = await service.getMyPlan("user-1");
      expect(result.usage.dbBytes).toBe("0");
      expect(result.usage.fileBytes).toBe("0");
      expect(result.usage.apiRequests).toBe("0");
      expect(result.usage.peakRealtimeConns).toBe(0);
    });

    it("returns subscription data when subscription exists", async () => {
      const sub = {
        id: "sub-1",
        userId: "user-1",
        planId: "plan-1",
        status: "ACTIVE",
        currentPeriodStart: new Date("2026-11-01"),
        currentPeriodEnd: new Date("2026-11-30"),
        cancelAtPeriodEnd: false,
        plan: mockPlan,
      };
      prismaMock.subscription.findUnique.mockResolvedValueOnce(sub);

      const result = await service.getMyPlan("user-1");
      expect(result.subscription).not.toBeNull();
      expect(result.subscription!.id).toBe("sub-1");
      expect(result.subscription!.status).toBe("ACTIVE");
      expect(result.subscription!.plan.code).toBe("HOBBY");
    });

    it("aggregates usage across multiple projects (sum bytes, max realtime)", async () => {
      prismaMock.projectUsage.findMany.mockResolvedValueOnce([
        {
          dbBytes: BigInt(1_000_000),
          fileBytes: BigInt(2_000_000),
          apiRequests: BigInt(100),
          peakRealtimeConns: 5,
        },
        {
          dbBytes: BigInt(500_000),
          fileBytes: BigInt(1_000_000),
          apiRequests: BigInt(200),
          peakRealtimeConns: 10,
        },
      ]);

      const result = await service.getMyPlan("user-1");
      expect(result.usage.dbBytes).toBe("1500000");
      expect(result.usage.fileBytes).toBe("3000000");
      expect(result.usage.apiRequests).toBe("300");
      expect(result.usage.peakRealtimeConns).toBe(10); // max, not sum
    });
  });
});
