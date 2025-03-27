import { z } from 'zod';

// Project status enum
export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DRAFT = 'draft'
}

// Base Project interface
export interface Project {
  id: string;
  name: string;
  testSite: string;
  testFiles: string[];
  version: string;
  siteAddress: string;
  status: ProjectStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Zod schema for project validation
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Project name is required'),
  testSite: z.string().min(1, 'Test site is required'),
  testFiles: z.array(z.string()),
  version: z.string().min(1, 'Version is required'),
  siteAddress: z.string().url('Invalid site address URL'),
  status: z.nativeEnum(ProjectStatus),
  description: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Type for creating a new project (omits auto-generated fields)
export type CreateProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>;

// Type for updating an existing project
export type UpdateProjectInput = Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>;

// Schema for creating a new project
const createProjectSchema = ProjectSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  status: true 
});

// Schema for updating a project
const updateProjectSchema = ProjectSchema.partial().omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Validation function for project creation
export function validateCreateProject(input: CreateProjectInput): z.SafeParseReturnType<typeof createProjectSchema, typeof createProjectSchema._type> {
  return createProjectSchema.safeParse(input);
}

// Validation function for project updates
export function validateUpdateProject(input: UpdateProjectInput): z.SafeParseReturnType<typeof updateProjectSchema, typeof updateProjectSchema._type> {
  return updateProjectSchema.safeParse(input);
} 