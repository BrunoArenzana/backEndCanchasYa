import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as path from 'path';
import * as fs from 'fs';
import { MailDto } from './dto/create-mail.dto';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendContactMail(data: MailDto) {
    let plantillaHtml: string;

    switch (data.subject) {
      case 'Bienvenido a CanchasYa!':
        plantillaHtml = 'Bienvenida.html';
        break;

      case 'Reserva Exitosa':
        plantillaHtml = 'Reserva.html';
        break;

      default:
        throw new Error('Subject no válido');
    }

    const filePath = path.join(process.cwd(),'src','templates',plantillaHtml,);

    let htmlContent = fs.readFileSync(filePath, 'utf8');

    htmlContent = htmlContent.replace(
      '{{nombre}}',
      data.nombre,
    );

    await this.mailerService.sendMail({
      to: data.email,
      subject: data.subject,
      html: htmlContent,
    });
  }
}