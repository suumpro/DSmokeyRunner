import { z } from 'zod';

// Define valid project statuses
export const ProjectStatus = z.enum(['draft', 'active', 'completed', 'archived']);
export type ProjectStatus = z.infer<typeof ProjectStatus>;

// Define status transition
export const StatusTransition = z.object({
  from: ProjectStatus,
  to: ProjectStatus,
  timestamp: z.date(),
  reason: z.string().optional(),
});
export type StatusTransition = z.infer<typeof StatusTransition>;

// Define allowed status transitions
export const ALLOWED_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  draft: ['active'],
  active: ['completed'],
  completed: ['archived'],
  archived: [],
};

// Update Project schema
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string(),
  testSite: z.string().min(1, 'Test site name is required'),
  siteAddress: z.string().url('Invalid URL format'),
  version: z.string(),
  testFiles: z.array(z.string()),
});

export const Project = createProjectSchema.extend({
  id: z.string().uuid(),
  status: ProjectStatus,
  statusHistory: z.array(StatusTransition),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Project = z.infer<typeof Project>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = Partial<CreateProjectInput>;

// Validation functions
export function validateCreateProject(data: unknown) {
  return createProjectSchema.safeParse(data);
}

export function validateUpdateProject(data: unknown) {
  return createProjectSchema.partial().safeParse(data);
}

export function validateStatusTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[from];
  return allowedTransitions.includes(to);
}

export function getAvailableStatusTransitions(currentStatus: ProjectStatus): ProjectStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
} 