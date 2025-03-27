"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const Project_1 = require("../../../src/types/Project");
test_1.test.describe('Project Type Validation', () => {
    const validProjectInput = {
        name: 'Test Project',
        testSite: 'Staging',
        testFiles: ['tests/example1.spec.ts', 'tests/example2.spec.ts'],
        version: 'v1.0.0',
        siteAddress: 'https://staging.example.com',
        description: 'A test project'
    };
    test_1.test.describe('validateCreateProject', () => {
        (0, test_1.test)('should validate a correct project input', () => {
            const result = (0, Project_1.validateCreateProject)(validProjectInput);
            (0, test_1.expect)(result.success).toBe(true);
        });
        (0, test_1.test)('should reject empty project name', () => {
            const result = (0, Project_1.validateCreateProject)({
                ...validProjectInput,
                name: ''
            });
            (0, test_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, test_1.expect)(result.error.issues[0].message).toBe('Project name is required');
            }
        });
        (0, test_1.test)('should reject invalid site address', () => {
            const result = (0, Project_1.validateCreateProject)({
                ...validProjectInput,
                siteAddress: 'not-a-url'
            });
            (0, test_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, test_1.expect)(result.error.issues[0].message).toBe('Invalid site address URL');
            }
        });
        (0, test_1.test)('should accept empty test files array', () => {
            const result = (0, Project_1.validateCreateProject)({
                ...validProjectInput,
                testFiles: []
            });
            (0, test_1.expect)(result.success).toBe(true);
        });
    });
    test_1.test.describe('validateUpdateProject', () => {
        (0, test_1.test)('should validate partial updates', () => {
            const result = (0, Project_1.validateUpdateProject)({
                name: 'Updated Name'
            });
            (0, test_1.expect)(result.success).toBe(true);
        });
        (0, test_1.test)('should reject invalid version format', () => {
            const result = (0, Project_1.validateUpdateProject)({
                version: ''
            });
            (0, test_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, test_1.expect)(result.error.issues[0].message).toBe('Version is required');
            }
        });
        (0, test_1.test)('should validate status updates', () => {
            const result = (0, Project_1.validateUpdateProject)({
                status: Project_1.ProjectStatus.ARCHIVED
            });
            (0, test_1.expect)(result.success).toBe(true);
        });
        (0, test_1.test)('should reject invalid status', () => {
            const result = (0, Project_1.validateUpdateProject)({
                // @ts-expect-error Testing invalid status
                status: 'invalid-status'
            });
            (0, test_1.expect)(result.success).toBe(false);
        });
    });
});
