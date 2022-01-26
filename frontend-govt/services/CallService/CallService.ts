import { ApiService } from '../ApiService'
import { socket } from '../SocketService'
import { CreateCallDto, CreateCallResponse } from './dto/CreateCallDto'

export const createCall = async ({
  officerId,
  mopNric,
}: CreateCallDto): Promise<CreateCallResponse> => {
  try {
    return await ApiService.post('/calls', {
      officerId,
      mopNric,
    })
  } catch (e) {
    throw e
  }
}

export const socketCallCreate = ({
  officerId,
  mopNric,
}: CreateCallDto): void => {
  console.log(">>> creating call...")
  socket.emit('create_call', { officerId, mopNric })
}
