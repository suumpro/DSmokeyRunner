import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import dayjs from 'dayjs';
import { Project, ProjectStatus, CreateProjectInput, UpdateProjectInput, validateCreateProject, validateUpdateProject } from './types/Project';

interface DbSchema {
  projects: Project[];
}

// Database instance
let db: Low<DbSchema>;

// Initialize or reinitialize the database
function initDb() {
  const dbFile = process.env.PROJECT_DB_FILE || path.join(process.cwd(), 'projects.json');
  const adapter = new JSONFile<DbSchema>(dbFile);
  db = new Low<DbSchema>(adapter, { projects: [] });
}

// Initialize the database on module load
initDb();

// Initialize the projects database if it doesn't exist
export async function initializeProjects(): Promise<void> {
  // Reinitialize the database instance
  initDb();
  await db.read();
  if (!db.data) {
    db.data = { projects: [] };
    await db.write();
  }
}

// Create a new project
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const validation = validateCreateProject(input);
  if (!validation.success) {
    throw new Error(`Invalid project data: ${validation.error.message}`);
  }

  await db.read();

  const newProject: Project = {
    ...input,
    id: uuidv4(),
    status: 'draft',
    statusHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  db.data.projects.push(newProject);
  await db.write();
  return newProject;
}

// Get all projects
export async function getProjects(): Promise<Project[]> {
  await db.read();
  return db.data.projects;
}

// Get a project by ID
export async function getProject(id: string): Promise<Project | null> {
  await db.read();
  return db.data.projects.find(project => project.id === id) || null;
}

// Update a project
export async function updateProject(id: string, input: Partial<Project>): Promise<Project | null> {
  const validation = validateUpdateProject(input);
  if (!validation.success) {
    throw new Error(`Invalid project data: ${validation.error.message}`);
  }

  await db.read();
  const index = db.data.projects.findIndex(project => project.id === id);
  
  if (index === -1) {
    return null;
  }

  const updatedProject: Project = {
    ...db.data.projects[index],
    ...input,
    updatedAt: new Date()
  };

  db.data.projects[index] = updatedProject;
  await db.write();
  return updatedProject;
}

// Delete a project
export async function deleteProject(id: string): Promise<boolean> {
  await db.read();
  const initialLength = db.data.projects.length;
  db.data.projects = db.data.projects.filter(project => project.id !== id);
  
  if (db.data.projects.length === initialLength) {
    return false;
  }
  
  await db.write();
  return true;
}

// Update project status
export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<Project | null> {
  return updateProject(id, { status });
}

// Add test files to a project
export async function addTestFiles(id: string, testFiles: string[]): Promise<Project | null> {
  await db.read();
  const project = await getProject(id);
  
  if (!project) {
    return null;
  }

  const updatedFiles = [...new Set([...project.testFiles, ...testFiles])];
  return updateProject(id, { testFiles: updatedFiles });
}

// Save projects to database
export async function saveProjects(projects: Project[]): Promise<void> {
  db.data.projects = projects;
  await db.write();
}

// Remove test files from a project
export async function removeTestFiles(id: string, testFiles: string[]): Promise<Project | null> {
  await db.read();
  const project = await getProject(id);
  
  if (!project) {
    return null;
  }

  const updatedFiles = project.testFiles.filter(file => !testFiles.includes(file));
  return updateProject(id, { testFiles: updatedFiles });
} 