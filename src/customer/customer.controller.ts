import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Controller('customer')
export class CustomerController {
  constructor(private readonly mailService: MailService) {}

  @Post('contact')
  async handleContact(@Body() body: { mail: string; message: string }) {
    const { mail, message } = body;

    // Enviar correo al cliente
    await this.mailService.sendMail(
      mail,
      'Thank you for contacting us!',
      `<p>Dear customer,</p><p>Thank you for your message: "${message}". We will get back to you shortly.</p>`,
    );

    // Enviar correo al usuario
    await this.mailService.sendMail(
      process.env.GMAIL_USER,
      'New Customer Message',
      `<p>You received a new message from: ${mail}</p><p>Message: ${message}</p>`,
    );

    return {
      success: true,
      mailSentToCustomer: mail,
      mailSentToYou: process.env.GMAIL_USER,
    };
  }
}
