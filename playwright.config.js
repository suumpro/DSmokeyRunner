"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    testDir: './tests',
    timeout: 30000,
    reporter: 'list',
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
    },
    projects: [
        {
            name: 'chromium',
            use: {
                browserName: 'chromium',
            },
        },
    ],
};
exports.default = config;
