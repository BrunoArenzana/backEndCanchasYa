import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as path from 'path';
import * as fs from 'fs';
import { MailDto } from './dto/create-mail.dto';

@Injectable()
export class MailService {
  private readonly recentMails = new Map<string, number>();

  constructor(private readonly mailerService: MailerService) {}

  private normalizarSubject(subject: string): string {
    if (subject === 'Reserva actualizada') {
      return 'Reserva modificada';
    }

    if (subject === 'Reserva Exitosa') {
      return 'Reserva confirmada';
    }

    return subject;
  }

  private obtenerPlantilla(subject: string): string {
    switch (subject) {
      case 'Bienvenido a CanchasYa!':
        return 'Bienvenida.html';

      case 'Club Registrado en CanchasYa!':
        return 'RegistroClub.html';

      case 'Reserva confirmada':
        return 'ReservaConfirmada.html';

      case 'Reserva modificada':
        return 'ReservaModificada.html';

      case 'Reserva cancelada':
        return 'ReservaCancelada.html';

      default:
        throw new Error(`Subject no válido: ${subject}`);
    }
  }

  private obtenerEmojiDeporte(cancha?: string): string {
    const texto = (cancha || '').toLowerCase();

    if (texto.includes('futbol') || texto.includes('fútbol')) return '⚽';
    if (
      texto.includes('basquet') ||
      texto.includes('básquet') ||
      texto.includes('basket')
    ) {
      return '🏀';
    }
    if (texto.includes('tenis')) return '🎾';
    if (texto.includes('padel') || texto.includes('pádel')) return '🎾';
    if (texto.includes('voley') || texto.includes('vóley')) return '🏐';
    if (texto.includes('natacion') || texto.includes('natación')) return '🏊';
    if (texto.includes('golf')) return '⛳';

    return '🏟️';
  }

  private crearClaveDuplicado(data: MailDto, subjectNormalizado: string): string {
    return [
      data.email || '',
      subjectNormalizado || '',
      data.fecha || '',
      data.hora || '',
      data.cancha || '',
      data.club || '',
    ].join('|');
  }

  private esMailDuplicado(clave: string): boolean {
    const ahora = Date.now();
    const ultimoEnvio = this.recentMails.get(clave);

    const TIEMPO_BLOQUEO_MS = 8000;

    if (ultimoEnvio && ahora - ultimoEnvio < TIEMPO_BLOQUEO_MS) {
      return true;
    }

    this.recentMails.set(clave, ahora);

    setTimeout(() => {
      this.recentMails.delete(clave);
    }, TIEMPO_BLOQUEO_MS);

    return false;
  }

  async sendContactMail(data: MailDto) {
    try {
      const subjectNormalizado = this.normalizarSubject(data.subject);
      const plantillaHtml = this.obtenerPlantilla(subjectNormalizado);

      const claveDuplicado = this.crearClaveDuplicado(data, subjectNormalizado);

      if (this.esMailDuplicado(claveDuplicado)) {
        console.warn('Mail duplicado bloqueado:', {
          email: data.email,
          subject: subjectNormalizado,
          fecha: data.fecha,
          hora: data.hora,
          cancha: data.cancha,
          club: data.club,
        });

        return;
      }

      const filePath = path.join(
        process.cwd(),
        'src',
        'templates',
        plantillaHtml,
      );

      let htmlContent = fs.readFileSync(filePath, 'utf8');

      const emojiDeporte = this.obtenerEmojiDeporte(data.cancha);

      htmlContent = htmlContent.replace(/\{\{nombre\}\}/g, data.nombre || '');
      htmlContent = htmlContent.replace(
        /\{\{razonSocial\}\}/g,
        data.razonSocial || '',
      );
      htmlContent = htmlContent.replace(/\{\{email\}\}/g, data.email || '');
      htmlContent = htmlContent.replace(/\{\{fecha\}\}/g, data.fecha || '');
      htmlContent = htmlContent.replace(/\{\{hora\}\}/g, data.hora || '');
      htmlContent = htmlContent.replace(/\{\{cancha\}\}/g, data.cancha || '');
      htmlContent = htmlContent.replace(/\{\{club\}\}/g, data.club || '');
      htmlContent = htmlContent.replace(/\{\{message\}\}/g, data.message || '');
      htmlContent = htmlContent.replace(
        /\{\{emojiDeporte\}\}/g,
        emojiDeporte,
      );

      await this.mailerService.sendMail({
        to: data.email,
        from: '"CanchasYa!" <ycanchas@gmail.com>',
        subject: subjectNormalizado,
        html: htmlContent,
      });

      console.log(`Mail enviado exitosamente a ${data.email}: ${subjectNormalizado}`);
    } catch (error) {
      console.error('Error al enviar mail:', error);
      throw error;
    }
  }
}