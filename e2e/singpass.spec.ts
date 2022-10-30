import { test, expect, Page } from '@playwright/test'

import { checkwhoUrl } from './global-setup'

const testRecipientNric = process.env.TEST_NRIC

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

test.afterAll(async () => {
  await page.close();
});

test.describe.serial('Test sending Singpass notification', () => {
  test('Send valid notification successfully', async () => {
    await page.goto(`${checkwhoUrl}/notification`)
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
