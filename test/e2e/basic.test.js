import { test, expect } from '@playwright/test';

test.describe('Health Check', () => {
    test('should return OK status', async ({ page }) => {
        await page.goto('/health');
        await expect(page.locator('body')).toContainText('OK');
    });
});

test.describe('API Endpoints', () => {
    test('should return 404 for unknown routes', async ({ page }) => {
        const response = await page.request.get('http://localhost:3000/api/unknown');
        expect(response.status()).toBe(404);
    });

    test('should have rate limiting headers', async ({ page }) => {
        const response = await page.request.get('http://localhost:3000/health');
        expect(response.headers()).toHaveProperty('ratelimit-limit');
    });
});
