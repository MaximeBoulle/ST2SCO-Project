import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Message } from './message.entity';

@WebSocketGateway({
  path: process.env.WS_PATH || '/api/socket.io',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  emitNewMessage(message: Message) {
    this.server.emit('message:new', message);
  }
}
