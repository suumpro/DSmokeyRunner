"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
test_1.test.describe('Example Test Suite', () => {
    (0, test_1.test)('should pass', async () => {
        (0, test_1.expect)(true).toBe(true);
    });
});
