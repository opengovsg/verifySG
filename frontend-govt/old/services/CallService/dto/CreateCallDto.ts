export interface CreateCallDto {
  mopNric: string,
  officerId: number,
}


export interface CreateCallResponse {
  id: number,
  officer: {
    id: number
  }
}