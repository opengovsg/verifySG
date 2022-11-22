import { test, expect, Page } from '@playwright/test'

import { checkwhoUrl } from './global-setup'

const testRecipientNric = process.env.TEST_NRIC

let page: Page

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
})

test.afterAll(async () => {
  await page.close()
})

test.describe.serial('Test sending Singpass notification', () => {
  test('Send valid notification successfully', async () => {
    await page.goto(`${checkwhoUrl}/notification`)
    if (!testRecipientNric) {
      throw new Error('TEST_NRIC environment variable not set')
    }
    await page.locator('[name="nric"]').fill(testRecipientNric)
    // select message template
    await page
      .getByRole('tabpanel', { name: 'Singpass' })
      .locator('input[type="text"]')
      .click()
    // select first option
    await page.locator('#react-select-6-option-0').click()
    // click send button and get response
    // wrap in Promise.all to avoid race condition
    const [response, _] = await Promise.all([
      page.waitForResponse(`${checkwhoUrl}/api/v1/notifications`),
      page.getByRole('button', { name: 'Notify call recipient' }).click(),
    ])
    expect(response.ok()).toBeTruthy()
  })

  test('Send notification to invalid NRIC fails', async () => {
    await page.locator('[name="nric"]').fill('S1234567D')
    // no need to select template as state is kept between clicks
    const [response, _] = await Promise.all([
      page.waitForResponse(`${checkwhoUrl}/api/v1/notifications`),
      page.getByRole('button', { name: 'Notify call recipient' }).click(),
    ])
    expect(response.ok()).toBeFalsy()
  })
})
