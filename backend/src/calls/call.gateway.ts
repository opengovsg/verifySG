import { UseGuards } from '@nestjs/common'
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { CallsService } from './calls.service'
import { CreateCallDto } from './dto'
import { AuthOfficerGuard } from 'auth-officer/guards/auth-officer.guard'
import { OfficerId } from 'common/decorators'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CallGateway {
  @WebSocketServer()
  server: Server

  constructor(private readonly callService: CallsService) {}

  @UseGuards(AuthOfficerGuard)
  @SubscribeMessage('create_call')
  async listenForMessages(
    @OfficerId() officerId: number,
    @MessageBody() body: CreateCallDto,
  ): Promise<void> {
    const { mopNric } = body
    const call = await this.callService.createCall({ officerId, mopNric })
    const latestCall = await this.callService.getLatestCallForMop(call.mop.id)

    if (latestCall) {
      this.server.sockets.emit(
        `call_created${latestCall.mop.nric}`,
        this.callService.mapToDto(latestCall),
      )
    }
  }
}
