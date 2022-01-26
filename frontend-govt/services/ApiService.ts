import axios from 'axios'

export const ApiService = axios.create({
  baseURL: process.env.BACKEND_BASE_URL ?? 'http://localhost:8080/api',
  withCredentials: true,
})