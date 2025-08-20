import { Controller, Post, Get, Body } from '@nestjs/common';
import { EmailService, SendEmailDto } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('status')
  async getEmailStatus() {
    return this.emailService.getEmailStatus();
  }

  @Post('send')
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return this.emailService.sendEmail(sendEmailDto);
  }

  @Post('welcome')
  async sendWelcomeEmail(@Body() body: { userEmail: string; userName: string }) {
    return this.emailService.sendWelcomeEmail(body.userEmail, body.userName);
  }

  @Post('booking-confirmation')
  async sendBookingConfirmationEmail(@Body() body: { userEmail: string; bookingDetails: any }) {
    return this.emailService.sendBookingConfirmationEmail(body.userEmail, body.bookingDetails);
  }

  @Post('password-reset')
  async sendPasswordResetEmail(@Body() body: { userEmail: string; resetToken: string }) {
    return this.emailService.sendPasswordResetEmail(body.userEmail, body.resetToken);
  }
}
