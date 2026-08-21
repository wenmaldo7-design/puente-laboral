import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * Envio de mails transaccionales via SMTP (nodemailer). Configuracion por
 * variables de entorno: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const port = Number(this.configService.get<string>('SMTP_PORT', '587'));

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });

    this.from = this.configService.get<string>(
      'SMTP_FROM',
      'no-reply@puente-laboral.local',
    );
  }

  /**
   * Notifica por mail el rechazo de una solicitud de habilitacion de
   * empresa. No hay ningun USUARIO creado en este punto del flujo (la
   * solicitud rechazada nunca llega a crear cuenta), asi que el email es
   * el unico canal posible para avisar.
   */
  async notificarRechazoSolicitud(
    emailContacto: string,
    razonSocial: string,
    motivoRechazo: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: emailContacto,
        subject: 'Tu solicitud de habilitación fue rechazada',
        text: `Hola,\n\nTu solicitud de habilitación para "${razonSocial}" fue rechazada.\n\nMotivo: ${motivoRechazo}\n\nSi creés que se trata de un error, podés volver a enviar la solicitud con la información corregida.`,
      });
    } catch (error) {
      // El rechazo en si ya se guardo en la DB antes de llamar a este
      // metodo: una falla de SMTP no debe hacer fallar la operacion
      // completa, solo se registra para diagnostico.
      this.logger.error(
        `No se pudo enviar el mail de rechazo a ${emailContacto}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /** Aviso de una oferta laboral compatible con el perfil del beneficiario. */
  async notificarOfertaCompatible(
    email: string,
    tituloOferta: string,
    razonSocialEmpresa: string,
    habilidadesRequeridas: string[],
  ): Promise<void> {
    try {
      const habilidadesTexto = habilidadesRequeridas.length
        ? `\nHabilidades requeridas: ${habilidadesRequeridas.join(', ')}\n`
        : '';
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: `Nueva oferta laboral que podría interesarte: ${tituloOferta}`,
        text: `Hola,\n\n${razonSocialEmpresa} publicó una nueva oferta laboral que coincide con tu perfil:\n\n"${tituloOferta}"${habilidadesTexto}\nIngresá a la plataforma para ver el detalle completo y postularte.`,
      });
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el mail de oferta compatible a ${email}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /** Aviso de que la solicitud de habilitación de la empresa fue aprobada. */
  async notificarSolicitudAprobada(
    email: string,
    razonSocial: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'Tu solicitud de habilitación fue aprobada',
        text: `Hola,\n\nTu solicitud de habilitación para "${razonSocial}" fue aprobada. Ya podés ingresar a la plataforma con tus credenciales y publicar ofertas laborales.`,
      });
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el mail de aprobación a ${email}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
