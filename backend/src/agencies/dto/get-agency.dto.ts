import { Agency } from 'database/entities'

export type GetAgencyDto = Pick<Agency, 'id' | 'name' | 'logoUrl'>
