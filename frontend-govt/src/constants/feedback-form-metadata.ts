interface feedbackFormMetadata {
  agencyId: string
  formUrl: string
  nameFieldId: string
  positionFieldId: string
  messageTemplateKeyFieldId?: string
  nricFieldId: string
}

export const feedbackFormMetadataArray: feedbackFormMetadata[] = [
  // {
  //   agencyId: 'MOH',
  //   formUrl: 'https://form.gov.sg/62ecbb0629bc220012bb2faf',
  //   nameFieldId: '623d285ee46e5c0012d70649',
  //   positionFieldId: '623d286e012667001232b83f',
  //   nricFieldId: '623d31820126670012345b40',
  // },
  // {
  //   agencyId: 'IRAS',
  //   formUrl: 'https://form.gov.sg/62ecb869b2788000130e2b62',
  //   nameFieldId: '623d285ee46e5c0012d70649',
  //   positionFieldId: '623d286e012667001232b83f',
  //   messageTemplateKeyFieldId: '62f716eab0318200127cedb3',
  //   nricFieldId: '623d31820126670012345b40',
  // },
]

export const getFormMetadata = (
  agencyShortName: string,
): feedbackFormMetadata => {
  const formRelatedLinks = feedbackFormMetadataArray.find(
    (link) => link.agencyId === agencyShortName,
  )
  // this should not happen since requiresFeedbackForm is run before this function is called
  if (!formRelatedLinks)
    throw new Error(`No form related links found for ${agencyShortName}`)
  return formRelatedLinks
}

export const requiresFeedbackForm = (agencyShortName: string): boolean => {
  return feedbackFormMetadataArray.some(
    (link) => link.agencyId === agencyShortName,
  )
}
