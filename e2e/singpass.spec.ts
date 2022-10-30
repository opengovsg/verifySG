import { test, expect, Page } from '@playwright/test'

import { gmailHelper } from './gmailHelper'

const STAGING_URL = 'https://staging.checkwho.gov.sg'

const checkwhoFromEmail = 'donotreply@mail.postman.gov.sg'
const checkwhoUrl =
  process.env.CHECKWHO_URL || STAGING_URL

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

test.afterAll(async () => {
  await page.close();
});

test.describe.serial('Test sending Singpass notification', () => {
  const testEmail = process.env.TEST_EMAIL
  const testRecipientNric = process.env.TEST_NRIC

  test('Login page renders properly', async () => {
    await page.goto(checkwhoUrl)
    // check that title exists
    await expect(page).toHaveTitle(/CheckWho/)
    // check that staging banner exists if on staging version
    if (checkwhoUrl === STAGING_URL) {
      const stagingBanner = page.locator('text=Staging CheckWho')
      await expect(stagingBanner).toBeVisible()
    }
  })

  test('Log in using testing email and OTP', async () => {
    // enter email address into
    await page.locator('#email').fill(testEmail)
    await page.getByRole('button', { name: 'Get OTP'}).click()
    const otp = await gmailHelper.getOTP(checkwhoFromEmail, testEmail)
    await page.locator('#otp').fill(otp)
    await page.getByRole('button', { name: 'Log in'}).click()
  })

  test('Send valid notification successfully', async () => {
    // must use fill instead of type for lazy-loading
    await page.locator('[name="nric"]').fill(testRecipientNric)
    // select message template
    await page.locator('.css-1d8n9bt').click()
    // select first option
    await page.locator('#react-select-4-option-0').click()
    // click send button and get response
    const [response, _] = await Promise.all([
      page.waitForResponse(`${checkwhoUrl}/api/notifications`),
      page.getByRole('button', { name: 'Notify call recipient' }).click(),
    ])
    expect(response.ok()).toBeTruthy()
  })

  test('Send notification to invalid NRIC fails', async () => {
    await page.locator('[name="nric"]').fill('S1234567D')
    // no need to select template as state is kept between clicks
    const [response, _] = await Promise.all([
      page.waitForResponse(`${checkwhoUrl}/api/notifications`),
      page.getByRole('button', { name: 'Notify call recipient' }).click(),
    ])
    expect(response.ok()).toBeFalsy()
  })
})

/*
* **Notifications - desktop view**
- [ ] Should display message preview
- [ ] When editing NRIC, should display NRIC in message preview
- [ ] When sending notification to S3002862G - should show success
- [ ] When sending notification to your own NRIC - should show failure (there's no Singpass staging account on your NRIC number)
- [ ] Log out button works
*
* */
