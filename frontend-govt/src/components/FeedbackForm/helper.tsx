/**
 * Generates feedback form link based on different agencies. If agency is not supported, will default to default link.
 *
 * List of supported agencies as of 11 Aug 2022:
 * - MOH
 */
export const feedbackFormLinkFactory = (agencyShortName: string): string => {
  switch (agencyShortName) {
    case 'MOH':
      return 'UPDATE_MOH_FORM_LINK_HERE'
      break
    default:
      return 'UPDATE_DEFAULT_FORM_LINK_HERE'
  }
}

/**
 * Store agencies that require display of feedback form after sending out notification
 */
export const agenciesRequiringFeedbackForm = ['MOH']
