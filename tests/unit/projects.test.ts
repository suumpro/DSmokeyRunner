import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import {
  initializeProjects,
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  addTestFiles,
  removeTestFiles
} from '../../src/projects';
import { ProjectStatus } from '../../src/types/Project';

const TEST_DB_FILE = path.join(process.cwd(), 'projects.test.json');

// Ensure clean database state
async function cleanDatabase() {
  if (fs.existsSync(TEST_DB_FILE)) {
    fs.unlinkSync(TEST_DB_FILE);
  }
  await initializeProjects();
}

test.describe('Project Persistence', () => {
  // Before each test, set up a clean test database
  test.beforeEach(async () => {
    // Override the database file path for testing
    process.env.PROJECT_DB_FILE = TEST_DB_FILE;
    await cleanDatabase();
  });

  // After all tests, clean up the test database
  test.afterAll(async () => {
    await cleanDatabase();
  });

  const validProjectInput = {
    name: 'Test Project',
    testSite: 'Staging',
    testFiles: ['tests/example1.spec.ts'],
    version: 'v1.0.0',
    siteAddress: 'https://staging.example.com',
    description: 'A test project'
  };

  test('should create and retrieve a project', async () => {
    const project = await createProject(validProjectInput);
    expect(project.id).toBeDefined();
    expect(project.status).toBe(ProjectStatus.DRAFT);
    expect(project.name).toBe(validProjectInput.name);

    const retrieved = await getProject(project.id);
    expect(retrieved).toEqual(project);
  });

  test('should list all projects', async () => {
    const project1 = await createProject(validProjectInput);
    const project2 = await createProject({
      ...validProjectInput,
      name: 'Second Project'
    });

    const projects = await getProjects();
    expect(projects).toHaveLength(2);
    expect(projects).toContainEqual(project1);
    expect(projects).toContainEqual(project2);
  });

  test('should update a project', async () => {
    const project = await createProject(validProjectInput);
    const updatedName = 'Updated Project';
    
    const updated = await updateProject(project.id, { name: updatedName });
    expect(updated).toBeDefined();
    expect(updated?.name).toBe(updatedName);
    expect(updated?.updatedAt).not.toBe(project.updatedAt);
  });

  test('should delete a project', async () => {
    const project = await createProject(validProjectInput);
    const deleted = await deleteProject(project.id);
    expect(deleted).toBe(true);

    const retrieved = await getProject(project.id);
    expect(retrieved).toBeNull();
  });

  test('should update project status', async () => {
    const project = await createProject(validProjectInput);
    const updated = await updateProjectStatus(project.id, ProjectStatus.ACTIVE);
    expect(updated?.status).toBe(ProjectStatus.ACTIVE);
  });

  test('should add test files to a project', async () => {
    const project = await createProject(validProjectInput);
    const newFiles = ['tests/example2.spec.ts', 'tests/example3.spec.ts'];
    
    const updated = await addTestFiles(project.id, newFiles);
    expect(updated?.testFiles).toContain(newFiles[0]);
    expect(updated?.testFiles).toContain(newFiles[1]);
    expect(updated?.testFiles).toContain(validProjectInput.testFiles[0]);
  });

  test('should remove test files from a project', async () => {
    const project = await createProject({
      ...validProjectInput,
      testFiles: ['test1.spec.ts', 'test2.spec.ts', 'test3.spec.ts']
    });

    const filesToRemove = ['test1.spec.ts', 'test2.spec.ts'];
    const updated = await removeTestFiles(project.id, filesToRemove);
    expect(updated?.testFiles).toEqual(['test3.spec.ts']);
  });

  test('should handle invalid project updates', async () => {
    const project = await createProject(validProjectInput);
    await expect(updateProject(project.id, { 
      siteAddress: 'not-a-url' 
    })).rejects.toThrow('Invalid project data');
  });

  test('should handle non-existent project operations', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    
    const retrieved = await getProject(nonExistentId);
    expect(retrieved).toBeNull();

    const updated = await updateProject(nonExistentId, { name: 'New Name' });
    expect(updated).toBeNull();

    const deleted = await deleteProject(nonExistentId);
    expect(deleted).toBe(false);
  });
}); 