"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const projects_1 = require("../../src/projects");
const Project_1 = require("../../src/types/Project");
const TEST_DB_FILE = path_1.default.join(process.cwd(), 'projects.test.json');
// Ensure clean database state
async function cleanDatabase() {
    if (fs_1.default.existsSync(TEST_DB_FILE)) {
        fs_1.default.unlinkSync(TEST_DB_FILE);
    }
    await (0, projects_1.initializeProjects)();
}
test_1.test.describe('Project Persistence', () => {
    // Before each test, set up a clean test database
    test_1.test.beforeEach(async () => {
        // Override the database file path for testing
        process.env.PROJECT_DB_FILE = TEST_DB_FILE;
        await cleanDatabase();
    });
    // After all tests, clean up the test database
    test_1.test.afterAll(async () => {
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
    (0, test_1.test)('should create and retrieve a project', async () => {
        const project = await (0, projects_1.createProject)(validProjectInput);
        (0, test_1.expect)(project.id).toBeDefined();
        (0, test_1.expect)(project.status).toBe(Project_1.ProjectStatus.DRAFT);
        (0, test_1.expect)(project.name).toBe(validProjectInput.name);
        const retrieved = await (0, projects_1.getProject)(project.id);
        (0, test_1.expect)(retrieved).toEqual(project);
    });
    (0, test_1.test)('should list all projects', async () => {
        const project1 = await (0, projects_1.createProject)(validProjectInput);
        const project2 = await (0, projects_1.createProject)({
            ...validProjectInput,
            name: 'Second Project'
        });
        const projects = await (0, projects_1.getProjects)();
        (0, test_1.expect)(projects).toHaveLength(2);
        (0, test_1.expect)(projects).toContainEqual(project1);
        (0, test_1.expect)(projects).toContainEqual(project2);
    });
    (0, test_1.test)('should update a project', async () => {
        const project = await (0, projects_1.createProject)(validProjectInput);
        const updatedName = 'Updated Project';
        const updated = await (0, projects_1.updateProject)(project.id, { name: updatedName });
        (0, test_1.expect)(updated).toBeDefined();
        (0, test_1.expect)(updated?.name).toBe(updatedName);
        (0, test_1.expect)(updated?.updatedAt).not.toBe(project.updatedAt);
    });
    (0, test_1.test)('should delete a project', async () => {
        const project = await (0, projects_1.createProject)(validProjectInput);
        const deleted = await (0, projects_1.deleteProject)(project.id);
        (0, test_1.expect)(deleted).toBe(true);
        const retrieved = await (0, projects_1.getProject)(project.id);
        (0, test_1.expect)(retrieved).toBeNull();
    });
    (0, test_1.test)('should update project status', async () => {
        const project = await (0, projects_1.createProject)(validProjectInput);
        const updated = await (0, projects_1.updateProjectStatus)(project.id, Project_1.ProjectStatus.ACTIVE);
        (0, test_1.expect)(updated?.status).toBe(Project_1.ProjectStatus.ACTIVE);
    });
    (0, test_1.test)('should add test files to a project', async () => {
        const project = await (0, projects_1.createProject)(validProjectInput);
        const newFiles = ['tests/example2.spec.ts', 'tests/example3.spec.ts'];
        const updated = await (0, projects_1.addTestFiles)(project.id, newFiles);
        (0, test_1.expect)(updated?.testFiles).toContain(newFiles[0]);
        (0, test_1.expect)(updated?.testFiles).toContain(newFiles[1]);
        (0, test_1.expect)(updated?.testFiles).toContain(validProjectInput.testFiles[0]);
    });
    (0, test_1.test)('should remove test files from a project', async () => {
        const project = await (0, projects_1.createProject)({
            ...validProjectInput,
            testFiles: ['test1.spec.ts', 'test2.spec.ts', 'test3.spec.ts']
        });
        const filesToRemove = ['test1.spec.ts', 'test2.spec.ts'];
        const updated = await (0, projects_1.removeTestFiles)(project.id, filesToRemove);
        (0, test_1.expect)(updated?.testFiles).toEqual(['test3.spec.ts']);
    });
    (0, test_1.test)('should handle invalid project updates', async () => {
        const project = await (0, projects_1.createProject)(validProjectInput);
        await (0, test_1.expect)((0, projects_1.updateProject)(project.id, {
            siteAddress: 'not-a-url'
        })).rejects.toThrow('Invalid project data');
    });
    (0, test_1.test)('should handle non-existent project operations', async () => {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';
        const retrieved = await (0, projects_1.getProject)(nonExistentId);
        (0, test_1.expect)(retrieved).toBeNull();
        const updated = await (0, projects_1.updateProject)(nonExistentId, { name: 'New Name' });
        (0, test_1.expect)(updated).toBeNull();
        const deleted = await (0, projects_1.deleteProject)(nonExistentId);
        (0, test_1.expect)(deleted).toBe(false);
    });
});
