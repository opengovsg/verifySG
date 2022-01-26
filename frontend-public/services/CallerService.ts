import { Caller } from '../components/CallerCard'
import { ApiService } from './ApiService'

const getLatestCallForMop = async (): Promise<Caller> => {
  return await ApiService.get<Caller>('/calls/latest').then((res) => {
    console.log(`getLatestCallForMop: ${res.data}`)
    return res.data
  })
}

export const CallerService = {
  getLatestCallForMop,
}
