export enum SGNotifyMessageTemplateId {
  GENERIC_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-GEN-01',
  GENERIC_NOTIFICATION_DURING_PHONE_CALL = 'GOVTECH-CHECKWHO-GEN-02',
  SPF_POLICE_REPORT_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-01',
  GOVTECH_FEEDBACK_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-GT-01',
}

export const sgNotifyTitle = (
  templateId: SGNotifyMessageTemplateId,
): string => {
  switch (templateId) {
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL:
      return 'Upcoming Phone Call'
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL:
      return 'Verify your phone call'
    // case SGNotifyMessageTemplateId.SPF_POLICE_REPORT_NOTIFICATION_BEFORE_PHONE_CALL:
    //   return 'Upcoming Phone Call'
    // case SGNotifyMessageTemplateId.GOVTECH_FEEDBACK_NOTIFICATION_BEFORE_PHONE_CALL:
    //   return 'Upcoming Phone Call'
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
      return `This message is to verify that you are currently speaking to <u><b>${name}, ${position}</u></b> from <b><u>${agencyName}</u></b>.`
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL:
      return `<u><b>${name}, ${position}</u></b> at <u><b>${agencyName}</u></b> will be calling you shortly.`
    default:
      throw new Error(`Unknown templateId: ${templateId}`)
  }
}

export const generateCallDetails = (
  templateId: SGNotifyMessageTemplateId,
  longMessageParams: Record<string, string>,
): string => {
  switch (templateId) {
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL:
      // be careful with this destructuring; templateId specific
      return longMessageParams.call_details
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL:
      return longMessageParams.call_details
    default:
      throw new Error(`Unknown templateId: ${templateId}`)
  }
}
