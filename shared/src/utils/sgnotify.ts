export enum SGNotifyMessageTemplateId {
  GENERIC_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-GEN-01',
  GENERIC_NOTIFICATION_DURING_PHONE_CALL = 'GOVTECH-CHECKWHO-GEN-02',
  SPF_POLICE_REPORT_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-01',
  GOVTECH_FEEDBACK_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-GT-01',
  GENERIC_NOTIFICATION_HOUSE_VISIT = 'GOVTECH-CHECKWHO-VISIT-01',
}

export const sgNotifyTitle = (
  templateId: SGNotifyMessageTemplateId,
): string => {
  switch (templateId) {
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL:
      return 'Upcoming Phone Call'
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL:
      return 'Verify your phone call'
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_HOUSE_VISIT:
      return 'Upcoming House Visit'
    default:
      throw new Error(`Unsupported templateId: ${templateId}`)
  }
}

export const sgNotifyShortMessage = (
  templateId: SGNotifyMessageTemplateId,
  agencyShortName: string,
): string => {
  switch (templateId) {
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL:
      return `You are currently on a call with a public officer from ${agencyShortName}`
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL:
      return `A public officer from ${agencyShortName} will be calling you shortly.`
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_HOUSE_VISIT:
      return `A public officer from ${agencyShortName} will be visiting you shortly.`
    default:
      throw new Error(`Unsupported templateId: ${templateId}`)
  }
}

// this is hard-coded in GovTech approved message templates, hence only used on frontend
export const salutations = (maskedNric: string) => {
  return `Dear Sir/Madam <b><u>(${maskedNric})</u></b>,`
}

// this is hard-coded in GovTech approved message templates, hence only used on frontend
export const standardOpening = (
  templateId: SGNotifyMessageTemplateId,
  name: string,
  position: string,
  agencyName: string,
): string => {
  switch (templateId) {
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL:
      return `This message is to verify that you are currently speaking to <u>${name}</u>, <u>${position}</u> from ${agencyName}.`
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL:
      return `<u>${name}</u>, <u>${position}</u> at ${agencyName} will be calling you shortly.`
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_HOUSE_VISIT:
      return `<u>${name}</u>, <u>${position}</u> at ${agencyName} will be visiting you shortly.`
    default:
      throw new Error(`Unknown templateId: ${templateId}`)
  }
}

// only used on frontend's message preview
// potentially can be used with generateNewSGNotifyParams on backend in a future refactoring)
export const getDetailsFromLongMessageParams = (
  templateId: SGNotifyMessageTemplateId,
  longMessageParams: Record<string, string>,
): string => {
  switch (templateId) {
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL:
      // be careful with this destructuring; templateId specific
      return longMessageParams.call_details
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL:
      return longMessageParams.call_details
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_HOUSE_VISIT:
      return longMessageParams.visit_details
    default:
      throw new Error(`Unknown templateId: ${templateId}`)
  }
}
