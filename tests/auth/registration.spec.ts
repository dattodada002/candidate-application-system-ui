import{ test, expect} from '@playwright/test';

test('Registration Page Test', async({page})=>{

 // Open application URL
 await page.goto('http://localhost:4200/');

 // Click Registration button
 await page.click('text=Registration');

  // Verify registration page heading
await expect(page.locator('h2')).toContainText('Welcome to SIAC CET Portal');

});