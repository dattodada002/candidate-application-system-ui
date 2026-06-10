import { test, expect } from '@playwright/test';

test('Home Page Verification', async ({ page }) => {
  // Open application
  await page.goto('http://localhost:4200/');

  // Verify Login button visible
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  // await expect(page).toHaveURL(/login/);
  // Verify Registration button visible
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  // await expect(page).toHaveURL(/registration/);

  await page.locator('div').nth(2).click();
  await page.getByText('STATE INSTITUTE FOR').click();
  await page.locator('div').nth(2).click();
  await page.getByRole('img').nth(1).click();
  await page.getByRole('link', { name: 'Register' }).click();
  await page.goto('http://localhost:4200/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByTestId('identifier').click();
  await page.getByTestId('identifier').fill('26000073');
  await page.getByTestId('password').click();
  await page.getByTestId('password').press('CapsLock');
  await page.getByTestId('password').fill('G');
  await page.getByTestId('password').press('CapsLock');
  await page.getByTestId('password').fill('Gautam@12345');
  await page.getByTestId('loginBtn').click();
  await page.getByRole('button', { name: '← Back to Form' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => { });
  });
  await page.getByText('Logout').click();

});