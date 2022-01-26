import { Caller } from '../components/CallerCard'
import { ApiService } from './ApiService'

export interface CallResponse {
  id: number
  officer: Caller
  createdAt: string
}

const getLatestCallForMop = async (): Promise<CallResponse> => {
  return await ApiService.get<CallResponse>('/calls/latest').then((res) => {
    console.log(res.data)
    console.log(`getLatestCallForMop: ${res.data}`)
    return res.data
  })
}

const getAllCallsForMop = async (): Promise<CallResponse[]> => {
  return await ApiService.get<CallResponse[]>('/calls').then((res) => res.data)
}

export const CallerService = {
  getLatestCallForMop,
  getAllCallsForMop,
}
