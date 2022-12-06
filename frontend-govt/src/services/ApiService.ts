import axios, { AxiosError, AxiosResponse } from 'axios'

import { DEFAULT_ERROR_MESSAGE } from '~shared/utils'

const API_BASE_URL = '/api/v1'

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) return DEFAULT_ERROR_MESSAGE

    const response = error.response as AxiosResponse<
      { message: string } | undefined
    >
    return (
      response?.data?.message ?? response?.statusText ?? DEFAULT_ERROR_MESSAGE
    )
  }

  if (error instanceof Error) {
    return error.message ?? DEFAULT_ERROR_MESSAGE
  }

  return DEFAULT_ERROR_MESSAGE
}

export const ApiService = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000, // 100 secs
})

ApiService.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    throw getApiErrorMessage(error)
  },
)
