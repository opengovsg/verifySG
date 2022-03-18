export type OfficerDto = {
  id: number
  name?: string
  email: string
  agency: string
  position?: string
}

export type UpdateOfficerDto = {
  name?: string
  position?: string
}
