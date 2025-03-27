"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const projects_1 = __importDefault(require("../../../src/routes/projects"));
const Project_1 = require("../../../src/types/Project");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const projects_2 = require("../../../src/projects");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/projects', projects_1.default);
const TEST_DB_FILE = path_1.default.join(process.cwd(), 'projects.test.json');
// Ensure clean database state
async function cleanDatabase() {
    // Set the test database file path
    process.env.PROJECT_DB_FILE = TEST_DB_FILE;
    // Remove the test database file if it exists
    if (fs_1.default.existsSync(TEST_DB_FILE)) {
        fs_1.default.unlinkSync(TEST_DB_FILE);
    }
    // Initialize a fresh database
    await (0, projects_2.initializeProjects)();
}
test_1.test.describe('Project API', () => {
    // Before each test, set up a clean test database
    test_1.test.beforeEach(async () => {
        await cleanDatabase();
    });
    // After all tests, clean up the test database
    test_1.test.afterAll(async () => {
        if (fs_1.default.existsSync(TEST_DB_FILE)) {
            fs_1.default.unlinkSync(TEST_DB_FILE);
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
    (0, test_1.test)('should create and retrieve a project', async () => {
        // Create project
        const createResponse = await (0, supertest_1.default)(app)
            .post('/api/projects')
            .send(validProjectInput);
        (0, test_1.expect)(createResponse.status).toBe(201);
        (0, test_1.expect)(createResponse.body.name).toBe(validProjectInput.name);
        (0, test_1.expect)(createResponse.body.id).toBeDefined();
        (0, test_1.expect)(createResponse.body.status).toBe(Project_1.ProjectStatus.DRAFT);
        // Get project by ID
        const getResponse = await (0, supertest_1.default)(app)
            .get(`/api/projects/${createResponse.body.id}`);
        (0, test_1.expect)(getResponse.status).toBe(200);
        (0, test_1.expect)(getResponse.body).toEqual(createResponse.body);
    });
    (0, test_1.test)('should list all projects', async () => {
        // Create two projects
        const project1 = await (0, supertest_1.default)(app)
            .post('/api/projects')
            .send(validProjectInput);
        const project2 = await (0, supertest_1.default)(app)
            .post('/api/projects')
            .send({
            ...validProjectInput,
            name: 'Second Project'
        });
        // Get all projects
        const listResponse = await (0, supertest_1.default)(app)
            .get('/api/projects');
        (0, test_1.expect)(listResponse.status).toBe(200);
        (0, test_1.expect)(listResponse.body.projects).toHaveLength(2);
        (0, test_1.expect)(listResponse.body.projects).toContainEqual(project1.body);
        (0, test_1.expect)(listResponse.body.projects).toContainEqual(project2.body);
    });
    (0, test_1.test)('should update a project', async () => {
        // Create project
        const createResponse = await (0, supertest_1.default)(app)
            .post('/api/projects')
            .send(validProjectInput);
        const updatedName = 'Updated Project';
        // Update project
        const updateResponse = await (0, supertest_1.default)(app)
            .put(`/api/projects/${createResponse.body.id}`)
            .send({ name: updatedName });
        (0, test_1.expect)(updateResponse.status).toBe(200);
        (0, test_1.expect)(updateResponse.body.name).toBe(updatedName);
        (0, test_1.expect)(updateResponse.body.updatedAt).not.toBe(createResponse.body.updatedAt);
    });
    (0, test_1.test)('should delete a project', async () => {
        // Create project
        const createResponse = await (0, supertest_1.default)(app)
            .post('/api/projects')
            .send(validProjectInput);
        // Delete project
        const deleteResponse = await (0, supertest_1.default)(app)
            .delete(`/api/projects/${createResponse.body.id}`);
        (0, test_1.expect)(deleteResponse.status).toBe(200);
        // Try to get deleted project
        const getResponse = await (0, supertest_1.default)(app)
            .get(`/api/projects/${createResponse.body.id}`);
        (0, test_1.expect)(getResponse.status).toBe(404);
    });
    (0, test_1.test)('should update project status', async () => {
        // Create project
        const createResponse = await (0, supertest_1.default)(app)
            .post('/api/projects')
            .send(validProjectInput);
        // Update status
        const updateResponse = await (0, supertest_1.default)(app)
            .patch(`/api/projects/${createResponse.body.id}/status`)
            .send({ status: Project_1.ProjectStatus.ACTIVE });
        (0, test_1.expect)(updateResponse.status).toBe(200);
        (0, test_1.expect)(updateResponse.body.status).toBe(Project_1.ProjectStatus.ACTIVE);
    });
    (0, test_1.test)('should manage test files', async () => {
        // Create project
        const createResponse = await (0, supertest_1.default)(app)
            .post('/api/projects')
            .send(validProjectInput);
        const newFiles = ['tests/example2.spec.ts', 'tests/example3.spec.ts'];
        // Add test files
        const addResponse = await (0, supertest_1.default)(app)
            .post(`/api/projects/${createResponse.body.id}/test-files`)
            .send({ testFiles: newFiles });
        (0, test_1.expect)(addResponse.status).toBe(200);
        (0, test_1.expect)(addResponse.body.testFiles).toContain(newFiles[0]);
        (0, test_1.expect)(addResponse.body.testFiles).toContain(newFiles[1]);
        (0, test_1.expect)(addResponse.body.testFiles).toContain(validProjectInput.testFiles[0]);
        // Remove test files
        const removeResponse = await (0, supertest_1.default)(app)
            .delete(`/api/projects/${createResponse.body.id}/test-files`)
            .send({ testFiles: [newFiles[0]] });
        (0, test_1.expect)(removeResponse.status).toBe(200);
        (0, test_1.expect)(removeResponse.body.testFiles).not.toContain(newFiles[0]);
        (0, test_1.expect)(removeResponse.body.testFiles).toContain(newFiles[1]);
    });
    (0, test_1.test)('should handle invalid project data', async () => {
        // Try to create project with invalid data
        const invalidResponse = await (0, supertest_1.default)(app)
            .post('/api/projects')
            .send({
            name: '', // Empty name should fail validation
            siteAddress: 'not-a-url' // Invalid URL should fail validation
        });
        (0, test_1.expect)(invalidResponse.status).toBe(400);
        (0, test_1.expect)(invalidResponse.body.error).toBeDefined();
    });
    (0, test_1.test)('should handle non-existent project operations', async () => {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';
        // Try to get non-existent project
        const getResponse = await (0, supertest_1.default)(app)
            .get(`/api/projects/${nonExistentId}`);
        (0, test_1.expect)(getResponse.status).toBe(404);
        // Try to update non-existent project
        const updateResponse = await (0, supertest_1.default)(app)
            .put(`/api/projects/${nonExistentId}`)
            .send({ name: 'New Name' });
        (0, test_1.expect)(updateResponse.status).toBe(404);
        // Try to delete non-existent project
        const deleteResponse = await (0, supertest_1.default)(app)
            .delete(`/api/projects/${nonExistentId}`);
        (0, test_1.expect)(deleteResponse.status).toBe(404);
    });
});
