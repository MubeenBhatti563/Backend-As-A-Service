import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { PlanService } from "./plan.service";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { ZodSerializerDto } from "nestjs-zod";
import {
  MyPlanResponseDto,
  PublicPlansResponseDto,
} from "./dto/plan-response.dto";

@Controller("plan")
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  /**
   * GET /plan/my-plan
   * Returns the authenticated user's active plan, subscription, and usage.
   */
  @Get("my-plan")
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MyPlanResponseDto)
  async getMyPlan(@GetUser("userId") userId: string) {
    return this.planService.getMyPlan(userId);
  }

  /**
   * GET /plan/plans
   * Returns all publicly available plans (for a pricing/upgrade page).
   */
  @Get("plans")
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PublicPlansResponseDto)
  async getPublicPlans() {
    return this.planService.getPublicPlans();
  }
}
