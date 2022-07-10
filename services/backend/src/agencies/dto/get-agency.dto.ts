import { Agency } from 'database/entities'

// TODO: refactor AgencyDTO into shared types 2/2
export type GetAgencyDto = Pick<Agency, 'id' | 'name' | 'logoUrl'>
