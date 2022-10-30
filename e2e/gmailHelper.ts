import { expect, Page } from '@playwright/test'
import { check_inbox, Email } from 'gmail-tester'
import * as path from 'path'

export const gmailHelper = {
  async getEmails(fromEmail: string, toEmail: string): Promise<Email[]> {
    const emails = await check_inbox(
      path.resolve(__dirname, "credentials.json"),
      path.resolve(__dirname, "gmail_token.json"),
      {
        from: fromEmail,
        to: toEmail,
        subject: "One-Time Password (OTP) for CheckWho",
        after: new Date(Date.now()),
        include_body: true,
        wait_time_sec: 5,
        max_wait_time_sec: 60,
      }
    )
    expect(emails.length).toBeGreaterThanOrEqual(1)
    return emails
  },

  async getOTPFromEmails(emails: Email[]): Promise<string> {
    // not sure whether this gets the most recent email
    const subject = emails[0].subject
    // otp included in subject
    return subject.match(/\d{6}/)[0]
  },

  async getOTP(fromEmail: string, toEmail: string): Promise<string> {
    const emails = await this.getEmails(fromEmail, toEmail)
    return this.getOTPFromEmails(emails)
  }
}
