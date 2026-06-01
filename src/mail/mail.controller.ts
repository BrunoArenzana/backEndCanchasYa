import { MailDto } from './dto/create-mail.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';


@Controller('contact')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  async send(@Body() body: MailDto) {
    await this.mailService.sendContactMail(body);

    return {
      ok: true,
      message: 'Mail enviado',
    };
  }
}