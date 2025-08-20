import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WebSocketService } from './websocket.service';

@Controller('websocket')
export class WebSocketController {
  constructor(private readonly webSocketService: WebSocketService) {}

  @Get('status')
  async getWebSocketStatus() {
    return this.webSocketService.getWebSocketStatus();
  }

  @Post('notification')
  async sendNotification(@Body() body: { userId: string; message: string }) {
    return this.webSocketService.sendNotification(body.userId, body.message);
  }

  @Post('broadcast')
  async broadcastMessage(@Body() body: { message: string; channel: string }) {
    return this.webSocketService.broadcastMessage(body.message, body.channel);
  }

  @Post('join-room')
  async joinRoom(@Body() body: { userId: string; roomId: string }) {
    return this.webSocketService.joinRoom(body.userId, body.roomId);
  }

  @Post('leave-room')
  async leaveRoom(@Body() body: { userId: string; roomId: string }) {
    return this.webSocketService.leaveRoom(body.userId, body.roomId);
  }

  @Get('connection/:userId')
  async getConnectionStatus(@Param('userId') userId: string) {
    return this.webSocketService.getConnectionStatus(userId);
  }
}
