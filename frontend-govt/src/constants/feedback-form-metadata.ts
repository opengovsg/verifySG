interface FeedbackFormMetadata {
  agencyId: string
  msgTemplateKey: string
  formUrl: string
  nameFieldId: string
  positionFieldId: string
  contactNumberFieldId: string
  messageSentTimeFieldId: string
}

export const feedbackFormMetadataArray: FeedbackFormMetadata[] = []

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
