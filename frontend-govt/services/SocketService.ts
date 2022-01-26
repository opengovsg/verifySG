import { Socket } from 'dgram'
import io from 'socket.io-client'

export const socket = io(
  process.env.BACKEND_BASE_URL ?? 'http://localhost:8080/',
  {
    reconnectionDelay: 10000,
  },
)
