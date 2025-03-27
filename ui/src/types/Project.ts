export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string;
  testSite: string;
  version: string;
  status: ProjectStatus;
  testFiles: string[];
  siteAddress: string;
  createdAt: string;
  updatedAt: string;
} 