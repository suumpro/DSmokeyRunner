import { test, expect } from '@playwright/test';
import {
  Project,
  ProjectStatus,
  validateCreateProject,
  validateUpdateProject,
  CreateProjectInput
} from '../../../src/types/Project';

test.describe('Project Type Validation', () => {
  const validProjectInput: CreateProjectInput = {
    name: 'Test Project',
    testSite: 'Staging',
    testFiles: ['tests/example1.spec.ts', 'tests/example2.spec.ts'],
    version: 'v1.0.0',
    siteAddress: 'https://staging.example.com',
    description: 'A test project'
  };

  test.describe('validateCreateProject', () => {
    test('should validate a correct project input', () => {
      const result = validateCreateProject(validProjectInput);
      expect(result.success).toBe(true);
    });

    test('should reject empty project name', () => {
      const result = validateCreateProject({
        ...validProjectInput,
        name: ''
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Project name is required');
      }
    });

    test('should reject invalid site address', () => {
      const result = validateCreateProject({
        ...validProjectInput,
        siteAddress: 'not-a-url'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid site address URL');
      }
    });

    test('should accept empty test files array', () => {
      const result = validateCreateProject({
        ...validProjectInput,
        testFiles: []
      });
      expect(result.success).toBe(true);
    });
  });

  test.describe('validateUpdateProject', () => {
    test('should validate partial updates', () => {
      const result = validateUpdateProject({
        name: 'Updated Name'
      });
      expect(result.success).toBe(true);
    });

    test('should reject invalid version format', () => {
      const result = validateUpdateProject({
        version: ''
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Version is required');
      }
    });

    test('should validate status updates', () => {
      const result = validateUpdateProject({
        status: ProjectStatus.ARCHIVED
      });
      expect(result.success).toBe(true);
    });

    test('should reject invalid status', () => {
      const result = validateUpdateProject({
        // @ts-expect-error Testing invalid status
        status: 'invalid-status'
      });
      expect(result.success).toBe(false);
    });
  });
}); 