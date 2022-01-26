import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { CallsService } from './calls.service'
import { CreateCallDto } from './dto'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CallGateway {
  @WebSocketServer()
  server: Server

  constructor(private readonly callService: CallsService) {}

  @SubscribeMessage('create_call')
  async listenForMessages(@MessageBody() createCallDto: CreateCallDto) {
    console.log('>> listening for calls', createCallDto)
    const call = await this.callService.createCall(createCallDto)
    this.server.sockets.emit('call_created', call)
  }
}
