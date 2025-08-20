import { Module } from '@nestjs/common';
import { WebSocketService } from './websocket.service';
import { WebSocketController } from './websocket.controller';

@Module({
  providers: [WebSocketService],
  controllers: [WebSocketController],
  exports: [WebSocketService],
})
export class WebSocketModule {}
