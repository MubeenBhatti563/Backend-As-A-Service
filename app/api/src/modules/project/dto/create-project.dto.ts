import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PROJECT_REGIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia) - AWS High Performance' },
  { value: 'us-west-2', label: 'US West (Oregon) - AWS' },
  { value: 'eu-west-1', label: 'EU West (Ireland) - AWS' },
  { value: 'eu-central-1', label: 'EU Central (Frankfurt) - AWS' },
  { value: 'ap-south-1', label: 'Asia Pacific (Mumbai) - AWS' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore) - AWS' },
] as const;

const REGION_VALUES = PROJECT_REGIONS.map((r) => r.value) as [
  (typeof PROJECT_REGIONS)[number]['value'],
  ...(typeof PROJECT_REGIONS)[number]['value'][],
];

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .min(3, 'Use at least 3 characters')
    .max(40, 'Use 40 characters or fewer')
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers and single hyphens (e.g. my-saas-app)',
    ),
  description: z
    .string()
    .trim()
    .max(200, 'Use 200 characters or fewer')
    .optional()
    .default(''),
  region: z.enum(REGION_VALUES, { message: 'Select a deployment region' }),
});

// Create Class DTO from Zod Schema
export class CreateProjectDto extends createZodDto(createProjectSchema) {}
