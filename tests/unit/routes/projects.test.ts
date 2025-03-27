import { test, expect } from '@playwright/test';
import express from 'express';
import request from 'supertest';
import projectsRouter from '../../../src/routes/projects';
import { ProjectStatus } from '../../../src/types/Project';
import path from 'path';
import fs from 'fs';
import { initializeProjects } from '../../../src/projects';

const app = express();
app.use(express.json());
app.use('/api/projects', projectsRouter);

const TEST_DB_FILE = path.join(process.cwd(), 'projects.test.json');

// Ensure clean database state
async function cleanDatabase() {
  // Set the test database file path
  process.env.PROJECT_DB_FILE = TEST_DB_FILE;
  
  // Remove the test database file if it exists
  if (fs.existsSync(TEST_DB_FILE)) {
    fs.unlinkSync(TEST_DB_FILE);
  }
  
  // Initialize a fresh database
  await initializeProjects();
}

test.describe('Project API', () => {
  // Before each test, set up a clean test database
  test.beforeEach(async () => {
    await cleanDatabase();
  });

  // After all tests, clean up the test database
  test.afterAll(async () => {
    if (fs.existsSync(TEST_DB_FILE)) {
      fs.unlinkSync(TEST_DB_FILE);
    }
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
    // Create project
    const createResponse = await request(app)
      .post('/api/projects')
      .send(validProjectInput);
    
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.name).toBe(validProjectInput.name);
    expect(createResponse.body.id).toBeDefined();
    expect(createResponse.body.status).toBe(ProjectStatus.DRAFT);

    // Get project by ID
    const getResponse = await request(app)
      .get(`/api/projects/${createResponse.body.id}`);
    
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual(createResponse.body);
  });

  test('should list all projects', async () => {
    // Create two projects
    const project1 = await request(app)
      .post('/api/projects')
      .send(validProjectInput);

    const project2 = await request(app)
      .post('/api/projects')
      .send({
        ...validProjectInput,
        name: 'Second Project'
      });

    // Get all projects
    const listResponse = await request(app)
      .get('/api/projects');
    
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.projects).toHaveLength(2);
    expect(listResponse.body.projects).toContainEqual(project1.body);
    expect(listResponse.body.projects).toContainEqual(project2.body);
  });

  test('should update a project', async () => {
    // Create project
    const createResponse = await request(app)
      .post('/api/projects')
      .send(validProjectInput);

    const updatedName = 'Updated Project';
    
    // Update project
    const updateResponse = await request(app)
      .put(`/api/projects/${createResponse.body.id}`)
      .send({ name: updatedName });
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe(updatedName);
    expect(updateResponse.body.updatedAt).not.toBe(createResponse.body.updatedAt);
  });

  test('should delete a project', async () => {
    // Create project
    const createResponse = await request(app)
      .post('/api/projects')
      .send(validProjectInput);

    // Delete project
    const deleteResponse = await request(app)
      .delete(`/api/projects/${createResponse.body.id}`);
    
    expect(deleteResponse.status).toBe(200);

    // Try to get deleted project
    const getResponse = await request(app)
      .get(`/api/projects/${createResponse.body.id}`);
    
    expect(getResponse.status).toBe(404);
  });

  test('should update project status', async () => {
    // Create project
    const createResponse = await request(app)
      .post('/api/projects')
      .send(validProjectInput);

    // Update status
    const updateResponse = await request(app)
      .patch(`/api/projects/${createResponse.body.id}/status`)
      .send({ status: ProjectStatus.ACTIVE });
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.status).toBe(ProjectStatus.ACTIVE);
  });

  test('should manage test files', async () => {
    // Create project
    const createResponse = await request(app)
      .post('/api/projects')
      .send(validProjectInput);

    const newFiles = ['tests/example2.spec.ts', 'tests/example3.spec.ts'];
    
    // Add test files
    const addResponse = await request(app)
      .post(`/api/projects/${createResponse.body.id}/test-files`)
      .send({ testFiles: newFiles });
    
    expect(addResponse.status).toBe(200);
    expect(addResponse.body.testFiles).toContain(newFiles[0]);
    expect(addResponse.body.testFiles).toContain(newFiles[1]);
    expect(addResponse.body.testFiles).toContain(validProjectInput.testFiles[0]);

    // Remove test files
    const removeResponse = await request(app)
      .delete(`/api/projects/${createResponse.body.id}/test-files`)
      .send({ testFiles: [newFiles[0]] });
    
    expect(removeResponse.status).toBe(200);
    expect(removeResponse.body.testFiles).not.toContain(newFiles[0]);
    expect(removeResponse.body.testFiles).toContain(newFiles[1]);
  });

  test('should handle invalid project data', async () => {
    // Try to create project with invalid data
    const invalidResponse = await request(app)
      .post('/api/projects')
      .send({
        name: '',  // Empty name should fail validation
        siteAddress: 'not-a-url'  // Invalid URL should fail validation
      });
    
    expect(invalidResponse.status).toBe(400);
    expect(invalidResponse.body.error).toBeDefined();
  });

  test('should handle non-existent project operations', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    
    // Try to get non-existent project
    const getResponse = await request(app)
      .get(`/api/projects/${nonExistentId}`);
    expect(getResponse.status).toBe(404);

    // Try to update non-existent project
    const updateResponse = await request(app)
      .put(`/api/projects/${nonExistentId}`)
      .send({ name: 'New Name' });
    expect(updateResponse.status).toBe(404);

    // Try to delete non-existent project
    const deleteResponse = await request(app)
      .delete(`/api/projects/${nonExistentId}`);
    expect(deleteResponse.status).toBe(404);
  });
}); 