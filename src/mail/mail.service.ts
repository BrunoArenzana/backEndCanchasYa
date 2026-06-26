import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { gmail_v1 } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';
import { MailDto } from './dto/create-mail.dto';

@Injectable()
export class MailService {
  // Mapa en memoria para almacenar marcas de tiempo y evitar reenvíos rápidos.
  private readonly recentMails = new Map<string, number>();

  // Constructor para inyectar el cliente oficial de Gmail API y ConfigService.
  constructor(
    @Inject('GMAIL_CLIENT') private readonly gmail: gmail_v1.Gmail,
    private readonly configService: ConfigService,
  ) {}

  // 1. FUNCIÓN: normalizarSubject
  // ¿Qué hace?: Estandariza los asuntos de los correos que vienen del cliente para que
  // coincidan internamente con los nombres de nuestras plantillas físicas.
  private normalizarSubject(subject: string): string {
    if (subject === 'Reserva actualizada') {
      return 'Reserva modificada';
    }
    if (subject === 'Reserva Exitosa') {
      return 'Reserva confirmada';
    }
    return subject;
  }

  // 2. FUNCIÓN: obtenerPlantilla
  // ¿Qué hace?: Recibe el asunto ya normalizado y devuelve el nombre exacto del archivo
  // HTML correspondiente que se encuentra en la carpeta de templates.
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
      case 'Código de recuperación - CanchasYa!':
        return 'RecuperarPassword.html';
      default:
        throw new Error(`Subject no válido: ${subject}`);
    }
  }

  // 3. FUNCIÓN: obtenerEmojiDeporte
  // ¿Qué hace?: Analiza el texto del nombre de la cancha para identificar palabras clave
  // (ej. 'pádel', 'fútbol') y retornar un emoji representativo del deporte.
  private obtenerEmojiDeporte(cancha?: string): string {
    const texto = (cancha || '').toLowerCase();
    if (texto.includes('futbol') || texto.includes('fútbol')) return '⚽';
    if (texto.includes('basquet') || texto.includes('básquet') || texto.includes('basket')) return '🏀';
    if (texto.includes('tenis')) return '🎾';
    if (texto.includes('padel') || texto.includes('pádel')) return '🎾';
    if (texto.includes('voley') || texto.includes('vóley')) return '🏐';
    if (texto.includes('natacion') || texto.includes('natación')) return '🏊';
    if (texto.includes('golf')) return '⛳';
    return '🏟️';
  }

  // 4. FUNCIÓN: crearClaveDuplicado
  // ¿Qué hace?: Concatena las propiedades principales del correo en un único string delimitado
  // por pipes ('|') para generar un identificador único para esa combinación de datos.
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

  // 5. FUNCIÓN: esMailDuplicado
  // ¿Qué hace?: Verifica si ya se procesó un correo idéntico en los últimos 8 segundos.
  // Si es así, retorna true. Si no, registra el intento actual y agenda su eliminación automática.
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

  // 6. FUNCIÓN: cargarPlantilla
  // ¿Qué hace?: Se conecta al sistema de archivos del servidor (usando fs) de forma síncrona
  // para leer el contenido plano del archivo HTML de la plantilla especificada.
  private cargarPlantilla(nombrePlantilla: string): string {
    const filePath = path.join(
      process.cwd(),
      'src',
      'templates',
      nombrePlantilla,
    );
    return fs.readFileSync(filePath, 'utf8');
  }

  // 7. FUNCIÓN: sendContactMail
  // ¿Qué hace?: Orquesta la lógica de validación, renderizado manual de HTML e interactúa
  // con la API de Resend para enviar correos generales y de reservas a los clientes.
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

      let htmlContent = this.cargarPlantilla(plantillaHtml);
      const emojiDeporte = this.obtenerEmojiDeporte(data.cancha);

      // Inyección manual de variables usando expresiones regulares globales
      htmlContent = htmlContent.replace(/\{\{nombre\}\}/g, data.nombre || '');
      htmlContent = htmlContent.replace(/\{\{razonSocial\}\}/g, data.razonSocial || '');
      htmlContent = htmlContent.replace(/\{\{email\}\}/g, data.email || '');
      htmlContent = htmlContent.replace(/\{\{fecha\}\}/g, data.fecha || '');
      htmlContent = htmlContent.replace(/\{\{hora\}\}/g, data.hora || '');
      htmlContent = htmlContent.replace(/\{\{cancha\}\}/g, data.cancha || '');
      htmlContent = htmlContent.replace(/\{\{club\}\}/g, data.club || '');
      htmlContent = htmlContent.replace(/\{\{message\}\}/g, data.message || '');
      htmlContent = htmlContent.replace(/\{\{emojiDeporte\}\}/g, emojiDeporte);

      // LLAMADA A GMAIL API REST
      await this.sendGmail(data.email, subjectNormalizado, htmlContent);

      console.log(`Mail enviado exitosamente a ${data.email} vía Gmail API: ${subjectNormalizado}`);
    } catch (error) {
      console.error('Error al enviar mail en MailService:', error);
      throw new InternalServerErrorException('Error en el servicio de mensajería externa.');
    }
  }

  // 8. FUNCIÓN: sendPasswordRecoveryCode
  // ¿Qué hace?: Renderiza el HTML con el código temporal e interactúa con la API de Resend
  // para enviar las claves de recuperación de contraseñas de forma inmediata.
  async sendPasswordRecoveryCode(data: {
    email: string;
    nombre: string;
    codigo: string;
    minutos?: number;
  }) {
    try {
      const subject = 'Código de recuperación - CanchasYa!';
      const plantillaHtml = this.obtenerPlantilla(subject);

      let htmlContent = this.cargarPlantilla(plantillaHtml);

      htmlContent = htmlContent.replace(/\{\{nombre\}\}/g, data.nombre || '');
      htmlContent = htmlContent.replace(/\{\.email\}\}/g, data.email || '');
      htmlContent = htmlContent.replace(/\{\{codigo\}\}/g, data.codigo || '');
      htmlContent = htmlContent.replace(/\{\{minutos\}\}/g, String(data.minutos || 10));

      // LLAMADA A GMAIL API REST
      await this.sendGmail(data.email, subject, htmlContent);

      console.log(`Código de recuperación enviado a ${data.email} vía Gmail API`);
    } catch (error) {
      console.error('Error al enviar código de recuperación en MailService:', error);
      throw new InternalServerErrorException('No se pudo despachar el código de seguridad.');
    }
  }

  // FUNCIÓN AUXILIAR: sendGmail
  // ¿Qué hace?: Formatea el correo electrónico en formato MIME (RFC 2822) y lo despacha
  // utilizando la API REST de Gmail (users.messages.send).
  private async sendGmail(to: string, subject: string, htmlContent: string): Promise<void> {
    const fromEmail = this.configService.get<string>('GOOGLE_USER_EMAIL') || 'ycanchas@gmail.com';
    const fromName = 'CanchasYa!';
    const fromHeader = `${fromName} <${fromEmail}>`;

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: ${fromHeader}`,
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      htmlContent,
    ];
    const message = messageParts.join('\n');

    // Codificación en Base64URL
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
  }
}