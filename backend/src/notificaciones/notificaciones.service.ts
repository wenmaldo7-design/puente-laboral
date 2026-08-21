import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { MailService } from '../mail/mail.service';
import { ContadorNoLeidasResponseDto } from './dto/contador-no-leidas-response.dto';
import { NotificacionResponseDto } from './dto/notificacion-response.dto';
import {
  armarMensaje,
  DatosPlantilla,
  TipoNotificacion,
} from './notificaciones.plantillas';

/** Destinatario de una notificación creada internamente vía crear(). */
export interface DestinatarioNotificacion {
  idUsuario: number;
  rol: 'beneficiario' | 'empresa';
}

const INCLUDE_TIPO = {
  tipos_notificaciones: true,
} satisfies Prisma.notificacionesInclude;

type NotificacionConTipo = Prisma.notificacionesGetPayload<{
  include: typeof INCLUDE_TIPO;
}>;

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  /** GET /notificaciones: las del usuario logueado, más recientes primero. */
  async listar(user: JwtPayload): Promise<NotificacionResponseDto[]> {
    const notificaciones = await this.prisma.notificaciones.findMany({
      where: this.filtroDestinatario(user),
      include: INCLUDE_TIPO,
      orderBy: { fecha_envio: 'desc' },
    });

    return notificaciones.map((n) => this.aResponseDto(n));
  }

  /** GET /notificaciones/no-leidas. */
  async contarNoLeidas(user: JwtPayload): Promise<ContadorNoLeidasResponseDto> {
    const cantidad = await this.prisma.notificaciones.count({
      where: { ...this.filtroDestinatario(user), leida: false },
    });

    return { cantidad };
  }

  /** PATCH /notificaciones/:id/leida. */
  async marcarLeida(
    user: JwtPayload,
    idNotificacion: number,
  ): Promise<NotificacionResponseDto> {
    const notificacion = await this.prisma.notificaciones.findFirst({
      where: { id_notificacion: idNotificacion, ...this.filtroDestinatario(user) },
    });
    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    const actualizada = await this.prisma.notificaciones.update({
      where: { id_notificacion: idNotificacion },
      data: { leida: true },
      include: INCLUDE_TIPO,
    });

    return this.aResponseDto(actualizada);
  }

  /** PATCH /notificaciones/leidas. */
  async marcarTodasLeidas(user: JwtPayload): Promise<{ actualizadas: number }> {
    const { count } = await this.prisma.notificaciones.updateMany({
      where: { ...this.filtroDestinatario(user), leida: false },
      data: { leida: true },
    });

    return { actualizadas: count };
  }

  /**
   * Uso interno de otros módulos (sin endpoint HTTP propio). Resuelve
   * id_tipo_notificacion por nombre, arma el mensaje con la plantilla del
   * tipo indicado e inserta la notificación para el destinatario dado.
   */
  async crear<K extends TipoNotificacion>(opciones: {
    tipo: K;
    destinatario: DestinatarioNotificacion;
    datos: DatosPlantilla[K];
  }): Promise<void> {
    const tipoNotificacion = await this.prisma.tipos_notificaciones.findFirst(
      { where: { nombre: opciones.tipo } },
    );
    if (!tipoNotificacion) {
      throw new NotFoundException(
        `Tipo de notificación "${opciones.tipo}" no existe en el catálogo`,
      );
    }

    await this.prisma.notificaciones.create({
      data: {
        id_tipo_notificacion: tipoNotificacion.id_tipo_notificacion,
        mensaje: armarMensaje(opciones.tipo, opciones.datos),
        ...(opciones.destinatario.rol === 'beneficiario'
          ? { id_usuario_beneficiario: opciones.destinatario.idUsuario }
          : { id_usuario_empresa: opciones.destinatario.idUsuario }),
      },
    });
  }

  /**
   * Orquesta el aviso a un beneficiario de que una oferta laboral nueva es
   * compatible con su perfil: notificación in-app + email. Pensado para ser
   * llamado desde OfertasLaboralesService tras crear una oferta. Un fallo en
   * cualquiera de los dos canales queda solo registrado, nunca se propaga:
   * no debe romper la creación de la oferta que lo disparó.
   */
  async notificarOfertaCompatible(
    idUsuarioBeneficiario: number,
    datos: { titulo: string; empresa: string; habilidades: string[] },
  ): Promise<void> {
    try {
      await this.crear({
        tipo: 'OFERTA_COMPATIBLE',
        destinatario: { idUsuario: idUsuarioBeneficiario, rol: 'beneficiario' },
        datos: { oferta: datos.titulo, empresa: datos.empresa },
      });

      const email = await this.obtenerEmailUsuario(idUsuarioBeneficiario);
      if (email) {
        await this.mailService.notificarOfertaCompatible(
          email,
          datos.titulo,
          datos.empresa,
          datos.habilidades,
        );
      }
    } catch (error) {
      this.logger.error(
        `No se pudo notificar oferta compatible al beneficiario ${idUsuarioBeneficiario}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Orquesta el aviso a una empresa de que su solicitud de habilitación fue
   * aprobada: notificación in-app + email. Mismo criterio de no propagar
   * errores que notificarOfertaCompatible().
   */
  async notificarSolicitudAprobada(
    idUsuarioEmpresa: number,
    razonSocial: string,
  ): Promise<void> {
    try {
      await this.crear({
        tipo: 'SOLICITUD_APROBADA',
        destinatario: { idUsuario: idUsuarioEmpresa, rol: 'empresa' },
        datos: {},
      });

      const email = await this.obtenerEmailUsuario(idUsuarioEmpresa);
      if (email) {
        await this.mailService.notificarSolicitudAprobada(email, razonSocial);
      }
    } catch (error) {
      this.logger.error(
        `No se pudo notificar la aprobación a la empresa ${idUsuarioEmpresa}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async obtenerEmailUsuario(idUsuario: number): Promise<string | null> {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id_usuario: idUsuario },
      select: { email: true },
    });
    return usuario?.email ?? null;
  }

  /** Filtra por el destinatario que corresponde al rol autenticado (nunca cruza usuarios). */
  private filtroDestinatario(user: JwtPayload): Prisma.notificacionesWhereInput {
    if (user.rol === 'beneficiario') {
      return { id_usuario_beneficiario: user.sub };
    }
    return { id_usuario_empresa: user.sub };
  }

  private aResponseDto(
    notificacion: NotificacionConTipo,
  ): NotificacionResponseDto {
    return {
      id: notificacion.id_notificacion,
      tipo: notificacion.tipos_notificaciones.nombre,
      mensaje: notificacion.mensaje,
      fecha_envio: notificacion.fecha_envio,
      leida: notificacion.leida,
    };
  }
}
