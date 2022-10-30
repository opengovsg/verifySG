import { chromium, expect, FullConfig } from '@playwright/test'
import { gmailHelper } from './gmail-helper'

const STAGING_URL = 'https://staging.checkwho.gov.sg'
export const checkwhoUrl =
  process.env.CHECKWHO_URL || STAGING_URL

const checkwhoFromEmail = 'donotreply@mail.postman.gov.sg'
const testEmail = process.env.TEST_EMAIL

async function globalSetup(_: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // GO TO LOGIN PAGE
  await page.goto(checkwhoUrl)
  // check that title exists
  await expect(page).toHaveTitle(/CheckWho/)
  // check that staging banner exists if on staging version
  if (checkwhoUrl === STAGING_URL) {
    const stagingBanner = page.locator('text=Staging CheckWho')
    await expect(stagingBanner).toBeVisible()
  }

  // LOGIN USING OTP
  await page.locator('#email').fill(testEmail)
  await page.getByRole('button', { name: 'Get OTP'}).click()
  const otp = await gmailHelper.getOTP(checkwhoFromEmail, testEmail)
  await page.locator('#otp').fill(otp)
  await page.getByRole('button', { name: 'Log in'}).click()

  // Save signed-in state to 'storageState.json'.
  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();
}

export default globalSetup;
