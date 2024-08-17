import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [CustomerController],
})
export class CustomerModule {}
