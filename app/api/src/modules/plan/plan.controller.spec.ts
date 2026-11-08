import { Test, TestingModule } from "@nestjs/testing";
import { PlanController } from "./plan.controller";
import { PlanService } from "./plan.service";

const mockPlanData = {
  id: "plan-1",
  code: "HOBBY" as const,
  name: "Hobby",
  description: "For side projects.",
  priceCents: 0,
  currency: "USD",
  isAvailable: true,
  maxProjects: 2,
  maxRealtimeConnections: 5,
  apiRequestsMonthly: "50000",
  dbStorageBytes: "500000000",
  fileStorageBytes: "250000000",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const mockMyPlan = {
  plan: mockPlanData,
  subscription: null,
  usage: {
    dbBytes: "0",
    fileBytes: "0",
    apiRequests: "0",
    peakRealtimeConns: 0,
  },
};

const planServiceMock = {
  getMyPlan: jest.fn().mockResolvedValue(mockMyPlan),
  getPublicPlans: jest.fn().mockResolvedValue({ plans: [mockPlanData] }),
};

describe("PlanController", () => {
  let controller: PlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanController],
      providers: [{ provide: PlanService, useValue: planServiceMock }],
    }).compile();

    controller = module.get<PlanController>(PlanController);
  });

  afterEach(() => jest.clearAllMocks());

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getMyPlan", () => {
    it("delegates to PlanService.getMyPlan with the userId", async () => {
      const result = await controller.getMyPlan("user-abc");
      expect(planServiceMock.getMyPlan).toHaveBeenCalledWith("user-abc");
      expect(result.plan.code).toBe("HOBBY");
      expect(result.subscription).toBeNull();
    });
  });

  describe("getPublicPlans", () => {
    it("delegates to PlanService.getPublicPlans", async () => {
      const result = await controller.getPublicPlans();
      expect(planServiceMock.getPublicPlans).toHaveBeenCalled();
      expect(result.plans).toHaveLength(1);
      expect(result.plans[0].name).toBe("Hobby");
    });
  });
});
