import { test, expect } from '@playwright/test';

test('Registration form validation and submit', async ({ page }) => {
  await page.goto('http://localhost:4200/registration');

  // submit empty form
  await page.click('[data-testid="registerBtn"]');

  await expect(page.getByText('Full Name is required')).toBeVisible();
  await expect(page.getByText('Email is required')).toBeVisible();

  // fill form
  await page.fill('[data-testid="fullName"]', 'Lakhan Wathore');
  await page.fill('[data-testid="email"]', 'lakhan@test.com');
  await page.fill('[data-testid="mobile"]', '9876543210');
  await page.fill('[data-testid="password"]', 'Test@123');

  // submit
  await page.click('[data-testid="registerBtn"]');

  // redirected to login
  await expect(page).toHaveURL(/login/);
});
