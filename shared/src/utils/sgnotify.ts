export enum SGNotifyMessageTemplateId {
  GENERIC_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-GEN-01',
  GENERIC_NOTIFICATION_DURING_PHONE_CALL = 'GOVTECH-CHECKWHO-GEN-02',
  SPF_POLICE_REPORT_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-01',
  GOVTECH_FEEDBACK_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-GT-01',
}

// only used in backend
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
      throw new Error(`Unknown templateId: ${templateId}`)
  }
}

// only used in backend
export const sgNotifyShortMessage = (agencyShortName: string): string => {
  switch (agencyShortName) {
    // TODO: phase out during-notification phone calls with SPF
    case 'SPF':
      return 'You are currently on a call with a public officer from SPF'
    case 'OGP':
    case 'MSF':
    case 'ECDA':
      return `A public officer from ${agencyShortName} will be calling you shortly.`
    default:
      throw new Error(`Unsupported agency: ${agencyShortName}`)
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
  agency: string,
): string => {
  switch (templateId) {
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL:
      return `This message is to verify that you are currently speaking to <u><b>${name}, ${position}</u></b> from <b><u>${agency.toUpperCase()}</u></b>.`
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL:
      return `<u><b>${name}, ${position}</u></b> at <u><b>${agency}</u></b> will be calling you shortly.`
    default:
      throw new Error(`Unknown templateId: ${templateId}`)
  }
}

const standardClosingBeforeCall =
  "This call will be made in the next 10 minutes. You may verify the caller's identity by asking for their <u>name</u> and <u>designation</u>, ensuring that it matches the information provided in this message."

// used in both message preview and backend API call
export const generateCallDetails = (
  agencyId: string,
  templateId: SGNotifyMessageTemplateId,
): string => {
  switch (templateId) {
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL:
      switch (agencyId) {
        case 'SPF':
          return `The purpose of this call is to follow up on your recent police report/feedback to the Police.
          <br><br>
          ${standardClosingBeforeCall}`
        case 'OGP':
          return `Thank you for agreeing to provide feedback on our products and services. The purpose of the call is to conduct a short feedback interview.
          <br><br>
          ${standardClosingBeforeCall}`
        case 'MSF':
        case 'ECDA':
          return standardClosingBeforeCall
        default:
          throw new Error(`Unsupported agency: ${agencyId}`)
      }
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL:
      switch (agencyId) {
        case 'SPF':
          return 'The purpose of this call is to follow up on your recent police report/feedback to the Police.'
        default:
          throw new Error(`Unsupported agency: ${agencyId}`)
      }
    default:
      throw new Error(`Unknown templateId: ${templateId}`)
  }
}
