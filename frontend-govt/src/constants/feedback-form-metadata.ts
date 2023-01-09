interface FeedbackFormMetadata {
  agencyId: string
  msgTemplateKey: string
  formUrl: string
  nameFieldId: string
  positionFieldId: string
  contactNumberFieldId: string
  messageSentTimeFieldId: string
}

export const feedbackFormMetadataArray: FeedbackFormMetadata[] = [
  {
    agencyId: 'MOH',
    msgTemplateKey: 'moh-cmcc-before',
    formUrl: 'https://form.gov.sg/63bbb0287a9cef00128752cb',
    nameFieldId: '623d285ee46e5c0012d70649',
    positionFieldId: '623d286e012667001232b83f',
    contactNumberFieldId: '63bbb340c5464700120d7b74',
    messageSentTimeFieldId: '63bbb37dc5b41d0012dd0b98',
  },
]

export const getFormMetadata = (
  agencyShortName: string,
  msgTemplateKey: string,
): FeedbackFormMetadata => {
  const formRelatedLinks = feedbackFormMetadataArray.find(
    (link) =>
      link.agencyId === agencyShortName &&
      link.msgTemplateKey === msgTemplateKey,
  )
  // this should not happen since requiresFeedbackForm is run before this function is called
  if (!formRelatedLinks)
    throw new Error(`No form related links found for ${agencyShortName}`)
  return formRelatedLinks
}

export const requiresFeedbackForm = (
  agencyShortName: string,
  msgTemplateKey: string,
): boolean => {
  return feedbackFormMetadataArray.some(
    (link) =>
      link.agencyId === agencyShortName &&
      link.msgTemplateKey === msgTemplateKey,
  )
}
