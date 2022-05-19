import { maskNric } from '../../utils/nric'

import { MessageContent } from './messagePreview.types'

export const getMaskedNric = (nric: string) => {
  if (nric === '') {
    return 'PLEASE ENTER NRIC'
  }
  try {
    return maskNric(nric)
  } catch (e) {
    return 'PLEASE ENTER VALID NRIC'
  }
}

/**
 * Generates a MessageContent object that will determine the output of the message format on the frontend based on the input parameters
 *
 * MessageContent Attributes Description:
 * - type: 'sentence' | 'parameter'
 *    - Used to flag if this content is a parameters. We underline and bold parameters.
 * - isLineBreak: boolean
 *    - Used to flag if there should be line breaks.
 * - content: string
 *    - Raw contents of the line generated.
 *
 * Based on difference agencies, different templates will be generated. If the agency is not supported, we will return undefined.
 *
 * List of supported agencies as of 19 May 2022:
 * - OGP
 * - SPF
 * @returns {MessageContent[]}
 */
export const messageContentFactory = ({
  nric,
  name,
  agency,
  position,
}: {
  nric: string
  name: string
  agency: string
  position: string
}): MessageContent[] | undefined => {
  const maskedNric = getMaskedNric(nric.toUpperCase())

  switch (agency.toLowerCase()) {
    case 'spf':
      return [
        {
          type: 'sentence',
          content: 'Dear Sir/Madam',
          isLineBreak: false,
        },
        {
          type: 'parameter',
          content: `(${maskedNric}),`,
          isLineBreak: true,
        },
        {
          type: 'sentence',
          content: 'This is to verify that you are currently speaking to',
          isLineBreak: false,
        },
        {
          type: 'parameter',
          content: ` ${name}, ${position}`,
          isLineBreak: false,
        },
        {
          type: 'sentence',
          content: 'from',
          isLineBreak: false,
        },
        {
          type: 'parameter',
          content: agency.toUpperCase(),
          isLineBreak: false,
        },
      ]
    case 'ogp':
      return [
        {
          type: 'sentence',
          content: 'Dear Sir/Madam',
          isLineBreak: false,
        },
        {
          type: 'parameter',
          content: `(${maskedNric}),`,
          isLineBreak: true,
        },
        {
          type: 'parameter',
          content: `${name}, ${position}`,
          isLineBreak: false,
        },
        {
          type: 'sentence',
          content: 'at',
          isLineBreak: false,
        },
        {
          type: 'parameter',
          content: agency,
          isLineBreak: false,
        },
        {
          type: 'sentence',
          content: 'will be calling you shortly.',
          isLineBreak: true,
        },
        {
          type: 'sentence',
          content:
            'Thank you for agreeing to provide feedback on our products and services. The purpose of the call is to conduct a short feedback interview.',
          isLineBreak: true,
        },
        {
          type: 'sentence',
          content: `This call will be made in the next 10 minutes. You may verify the caller's identity by asking for their name and designation, ensuring that it matches the information provided in this message.`,
          isLineBreak: false,
        },
      ]
  }
}
