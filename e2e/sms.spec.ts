import { test, expect, Page } from '@playwright/test'

import { checkwhoUrl } from './global-setup'

const testPhoneNumber = process.env.TEST_PHONE_NUMBER

let page: Page

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
})

test.afterAll(async () => {
  await page.close()
})

test.describe.serial('Test sending SMS notification', () => {
  test('Send valid notification successfully', async () => {
    await page.goto(`${checkwhoUrl}/notification`)
    if (!testPhoneNumber) {
      throw new Error('TEST_PHONE_NUMBER environment variable not set')
    }
    // click to go to SMS tab
    await page.getByRole('tab', { name: 'SMS' }).click()

    await page.getByPlaceholder('e.g. 81234567').fill(testPhoneNumber)
    // select message template
    await page
      .getByRole('tabpanel', { name: 'SMS' })
      .locator('input[type="text"]')
      .click()
    // select first option
    await page.locator('#react-select-7-option-0').click()
    // click send button and get response
    // wrap in Promise.all to avoid race condition
    const [response, _] = await Promise.all([
      page.waitForResponse(`${checkwhoUrl}/api/notifications`),
      page.getByRole('button', { name: 'Notify call recipient' }).click(),
    ])
    expect(response.ok()).toBeTruthy()
  })
})
