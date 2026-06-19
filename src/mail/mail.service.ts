import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as path from 'path';
import * as fs from 'fs';
import { MailDto } from './dto/create-mail.dto';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendContactMail(data: MailDto) {
    try {
      let plantillaHtml: string;

      switch (data.subject) {
        case 'Bienvenido a CanchasYa!':
          plantillaHtml = 'Bienvenida.html';
          break;

        case 'Club Registrado en CanchasYa!':
          plantillaHtml = 'RegistroClub.html';
          break;

        case 'Reserva Exitosa':
        case 'Reserva confirmada':
        case 'Reserva actualizada':
          plantillaHtml = 'ReservaConfirmada.html';
          break;

        case 'Reserva modificada':
          plantillaHtml = 'ReservaModificada.html';
          break;

        case 'Reserva cancelada':
          plantillaHtml = 'ReservaCancelada.html';
          break;

        default:
          throw new Error(`Subject no válido: ${data.subject}`);
      }

      const filePath = path.join(process.cwd(), 'src', 'templates', plantillaHtml);
      let htmlContent = fs.readFileSync(filePath, 'utf8');

      htmlContent = htmlContent.replace(/\{\{nombre\}\}/g, data.nombre || '');
      htmlContent = htmlContent.replace(/\{\{razonSocial\}\}/g, data.razonSocial || '');
      htmlContent = htmlContent.replace(/\{\{email\}\}/g, data.email || '');
      htmlContent = htmlContent.replace(/\{\{fecha\}\}/g, data.fecha || '');
      htmlContent = htmlContent.replace(/\{\{hora\}\}/g, data.hora || '');
      htmlContent = htmlContent.replace(/\{\{cancha\}\}/g, data.cancha || '');
      htmlContent = htmlContent.replace(/\{\{club\}\}/g, data.club || '');
      htmlContent = htmlContent.replace(/\{\{message\}\}/g, data.message || '');

      await this.mailerService.sendMail({
  to: data.email,
  from: '"CanchasYa!" <ycanchas@gmail.com>',
  subject: data.subject,
  html: htmlContent,
});
      console.log(`Mail enviado exitosamente a ${data.email}`);
    } catch (error) {
      console.error('Error al enviar mail:', error);
      throw error;
    }
  }
}