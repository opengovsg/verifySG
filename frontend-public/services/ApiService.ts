import axios, { AxiosResponse } from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

export const getApiErrorMessage = (error: unknown): string => {
  const defaultErrMsg = 'Something went wrong'
  if (axios.isAxiosError(error)) {
    if (!error.response) return defaultErrMsg

    const response = error.response as AxiosResponse<
      { message: string } | undefined
    >
    return response?.data?.message ?? response?.statusText ?? defaultErrMsg
  }

  if (error instanceof Error) {
    return error.message ?? defaultErrMsg
  }

  return defaultErrMsg
}

axios.defaults.withCredentials = true
export const ApiService = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000, // 100 secs
})
