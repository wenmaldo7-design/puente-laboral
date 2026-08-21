import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
import { NotificacionesService } from '../../notificaciones/notificaciones.service';
import { CrearSolicitudEmpresaDto } from './dto/crear-solicitud-empresa.dto';
import { DisponibilidadResponseDto } from './dto/disponibilidad-response.dto';
import { ListarSolicitudesQueryDto } from './dto/listar-solicitudes-query.dto';
import { RechazarSolicitudDto } from './dto/rechazar-solicitud.dto';
import type { CampoDisponibilidad } from './dto/verificar-disponibilidad-query.dto';
import { SolicitudEmpresaResponseDto } from './dto/solicitud-empresa-response.dto';
import { SolicitudesPaginadasResponseDto } from './dto/solicitudes-paginadas-response.dto';
import {
  EstadoSolicitud,
  esEstadoSolicitud,
} from './interfaces/estado-solicitud.enum';

type SolicitudConEstado = Prisma.solicitudes_habilitacion_empresasGetPayload<{
  include: { estados_solicitudes: true };
}>;

const INCLUDE_ESTADO = { estados_solicitudes: true } as const;
const SALT_ROUNDS = 10;

@Injectable()
export class EmpresasHabilitacionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  /**
   * Alta pública de una solicitud de habilitación. La contraseña ingresada
   * se hashea de inmediato y queda guardada junto con la solicitud: no se
   * crea ningún USUARIO hasta que un administrador la apruebe.
   */
  async crearSolicitud(
    dto: CrearSolicitudEmpresaDto,
  ): Promise<SolicitudEmpresaResponseDto> {
    const [
      empresaPorCuit,
      empresaPorRazonSocial,
      usuarioPorEmail,
      solicitudPendientePorCuit,
      solicitudPendientePorRazonSocial,
      solicitudPendientePorEmail,
    ] = await Promise.all([
      this.prisma.empresas.findUnique({ where: { cuit: dto.cuit } }),
      this.prisma.empresas.findUnique({
        where: { razon_social: dto.razon_social },
      }),
      this.prisma.usuarios.findUnique({ where: { email: dto.email_contacto } }),
      this.prisma.solicitudes_habilitacion_empresas.findFirst({
        where: {
          cuit: dto.cuit,
          estados_solicitudes: { nombre: EstadoSolicitud.PENDIENTE },
        },
      }),
      this.prisma.solicitudes_habilitacion_empresas.findFirst({
        where: {
          razon_social: dto.razon_social,
          estados_solicitudes: { nombre: EstadoSolicitud.PENDIENTE },
        },
      }),
      this.prisma.solicitudes_habilitacion_empresas.findFirst({
        where: {
          email_contacto: dto.email_contacto,
          estados_solicitudes: { nombre: EstadoSolicitud.PENDIENTE },
        },
      }),
    ]);

    if (empresaPorCuit || solicitudPendientePorCuit) {
      throw new ConflictException(
        'El CUIT ingresado ya se encuentra registrado',
      );
    }
    if (empresaPorRazonSocial || solicitudPendientePorRazonSocial) {
      throw new ConflictException(
        'La razón social ingresada ya se encuentra registrada',
      );
    }
    if (usuarioPorEmail || solicitudPendientePorEmail) {
      throw new ConflictException(
        'El email de contacto ingresado ya se encuentra registrado',
      );
    }

    const [idEstadoPendiente, passwordHash] = await Promise.all([
      this.resolverIdEstado(EstadoSolicitud.PENDIENTE),
      bcrypt.hash(dto.password, SALT_ROUNDS),
    ]);

    const solicitud =
      await this.prisma.solicitudes_habilitacion_empresas.create({
        data: {
          razon_social: dto.razon_social,
          cuit: dto.cuit,
          email_contacto: dto.email_contacto,
          telefono_contacto: dto.telefono_contacto,
          descripcion: dto.descripcion,
          documentacion_url: dto.documentacion_url,
          password_hash: passwordHash,
          id_estado_solicitud: idEstadoPendiente,
        },
        include: INCLUDE_ESTADO,
      });

    return this.toResponseDto(solicitud);
  }

  /**
   * Validador async del form público: ¿cuit/razon_social ya está en uso
   * por una empresa existente o una solicitud PENDIENTE? Reusa el mismo
   * criterio de unicidad que crearSolicitud, expuesto sin auth porque el
   * form de alta tampoco requiere sesión.
   */
  async verificarDisponibilidad(
    campo: CampoDisponibilidad,
    valor: string,
  ): Promise<DisponibilidadResponseDto> {
    const whereEmpresa =
      campo === 'cuit' ? { cuit: valor } : { razon_social: valor };
    const whereSolicitud =
      campo === 'cuit'
        ? { cuit: valor, estados_solicitudes: { nombre: EstadoSolicitud.PENDIENTE } }
        : {
            razon_social: valor,
            estados_solicitudes: { nombre: EstadoSolicitud.PENDIENTE },
          };

    const [empresa, solicitudPendiente] = await Promise.all([
      this.prisma.empresas.findUnique({ where: whereEmpresa }),
      this.prisma.solicitudes_habilitacion_empresas.findFirst({
        where: whereSolicitud,
      }),
    ]);

    return { disponible: !empresa && !solicitudPendiente };
  }

  /** Listado paginado para el panel admin, con filtro opcional por estado. */
  async listarSolicitudes(
    query: ListarSolicitudesQueryDto,
  ): Promise<SolicitudesPaginadasResponseDto> {
    const where: Prisma.solicitudes_habilitacion_empresasWhereInput =
      query.estado === undefined
        ? {}
        : { estados_solicitudes: { nombre: query.estado } };

    const [solicitudes, total] = await Promise.all([
      this.prisma.solicitudes_habilitacion_empresas.findMany({
        where,
        include: INCLUDE_ESTADO,
        orderBy: { fecha_solicitud: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.solicitudes_habilitacion_empresas.count({ where }),
    ]);

    return {
      data: solicitudes.map((solicitud) => this.toResponseDto(solicitud)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  /** Detalle completo de una solicitud, para la vista de revisión del admin. */
  async obtenerSolicitudPorId(
    id: number,
  ): Promise<SolicitudEmpresaResponseDto> {
    const solicitud = await this.buscarPorIdOFallar(id);
    return this.toResponseDto(solicitud);
  }

  /**
   * Rechaza una solicitud PENDIENTE: motivo, fecha de revisión y admin
   * revisor. Como nunca se crea un USUARIO para una solicitud rechazada,
   * el aviso se manda por mail a email_contacto (no hay cuenta a la cual
   * asociar una notificación in-app).
   */
  async rechazarSolicitud(
    id: number,
    dto: RechazarSolicitudDto,
    idAdminRevisor: number,
  ): Promise<SolicitudEmpresaResponseDto> {
    await this.buscarPendienteOFallar(id);

    const idEstadoRechazada = await this.resolverIdEstado(
      EstadoSolicitud.RECHAZADA,
    );

    const actualizada =
      await this.prisma.solicitudes_habilitacion_empresas.update({
        where: { id_solicitud: id },
        data: {
          id_estado_solicitud: idEstadoRechazada,
          motivo_rechazo: dto.motivo_rechazo,
          fecha_revision: new Date(),
          id_admin_revisor: idAdminRevisor,
        },
        include: INCLUDE_ESTADO,
      });

    await this.mailService.notificarRechazoSolicitud(
      actualizada.email_contacto,
      actualizada.razon_social,
      dto.motivo_rechazo,
    );

    return this.toResponseDto(actualizada);
  }

  /**
   * Aprueba una solicitud PENDIENTE: en una única transacción atómica,
   * re-verifica que siga pendiente y que no haya conflictos de unicidad,
   * crea USUARIOS (con el password_hash ya generado al momento de la
   * solicitud) + EMPRESAS, y marca la solicitud APROBADA. Un fallo en
   * cualquier paso revierte todo (rollback); la empresa puede iniciar
   * sesión inmediatamente después del commit.
   */
  async aprobarSolicitud(
    id: number,
    idAdminRevisor: number,
  ): Promise<SolicitudEmpresaResponseDto> {
    const idEstadoAprobada = await this.resolverIdEstado(
      EstadoSolicitud.APROBADA,
    );

    const { solicitud: solicitudActualizada, usuario } =
      await this.prisma.$transaction(async (tx) => {
        const solicitud = await tx.solicitudes_habilitacion_empresas.findUnique(
          {
            where: { id_solicitud: id },
            include: INCLUDE_ESTADO,
          },
        );
        if (!solicitud) {
          throw new NotFoundException('Solicitud no encontrada');
        }
        if (
          this.parseEstado(solicitud.estados_solicitudes.nombre) !==
          EstadoSolicitud.PENDIENTE
        ) {
          throw new ConflictException('La solicitud ya fue revisada');
        }

        const [usuarioExistente, empresaPorCuit, empresaPorRazonSocial] =
          await Promise.all([
            tx.usuarios.findUnique({
              where: { email: solicitud.email_contacto },
            }),
            tx.empresas.findUnique({ where: { cuit: solicitud.cuit } }),
            tx.empresas.findUnique({
              where: { razon_social: solicitud.razon_social },
            }),
          ]);
        if (usuarioExistente) {
          throw new ConflictException(
            'Ya existe un usuario con el email de contacto de esta solicitud',
          );
        }
        if (empresaPorCuit) {
          throw new ConflictException(
            'Ya existe una empresa registrada con ese CUIT',
          );
        }
        if (empresaPorRazonSocial) {
          throw new ConflictException(
            'Ya existe una empresa registrada con esa razón social',
          );
        }

        const usuario = await tx.usuarios.create({
          data: {
            email: solicitud.email_contacto,
            password_hash: solicitud.password_hash,
            activo: true,
          },
        });

        await tx.empresas.create({
          data: {
            id_usuario: usuario.id_usuario,
            razon_social: solicitud.razon_social,
            cuit: solicitud.cuit,
            descripcion: solicitud.descripcion,
            habilitada_operativamente: true,
            fecha_habilitacion: new Date(),
            id_solicitud: solicitud.id_solicitud,
          },
        });

        const solicitudActualizada =
          await tx.solicitudes_habilitacion_empresas.update({
            where: { id_solicitud: solicitud.id_solicitud },
            data: {
              id_estado_solicitud: idEstadoAprobada,
              fecha_revision: new Date(),
              id_admin_revisor: idAdminRevisor,
            },
            include: INCLUDE_ESTADO,
          });

        return { solicitud: solicitudActualizada, usuario };
      });

    await this.notificacionesService.notificarSolicitudAprobada(
      usuario.id_usuario,
      solicitudActualizada.razon_social,
    );

    return this.toResponseDto(solicitudActualizada);
  }

  private async buscarPorIdOFallar(id: number): Promise<SolicitudConEstado> {
    const solicitud =
      await this.prisma.solicitudes_habilitacion_empresas.findUnique({
        where: { id_solicitud: id },
        include: INCLUDE_ESTADO,
      });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    return solicitud;
  }

  private async buscarPendienteOFallar(
    id: number,
  ): Promise<SolicitudConEstado> {
    const solicitud = await this.buscarPorIdOFallar(id);
    if (
      this.parseEstado(solicitud.estados_solicitudes.nombre) !==
      EstadoSolicitud.PENDIENTE
    ) {
      throw new ConflictException('La solicitud ya fue revisada');
    }
    return solicitud;
  }

  private async resolverIdEstado(nombre: EstadoSolicitud): Promise<number> {
    const estado = await this.prisma.estados_solicitudes.findFirst({
      where: { nombre },
    });
    if (!estado) {
      // Falta correr el seed (prisma/seed.ts) contra esta base.
      throw new InternalServerErrorException(
        `El estado ${nombre} no está configurado en ESTADOS_SOLICITUDES`,
      );
    }
    return estado.id_estado_solicitud;
  }

  private toResponseDto(
    solicitud: SolicitudConEstado,
  ): SolicitudEmpresaResponseDto {
    return {
      id_solicitud: solicitud.id_solicitud,
      razon_social: solicitud.razon_social,
      cuit: solicitud.cuit,
      email_contacto: solicitud.email_contacto,
      telefono_contacto: solicitud.telefono_contacto,
      descripcion: solicitud.descripcion,
      documentacion_url: solicitud.documentacion_url,
      fecha_solicitud: solicitud.fecha_solicitud,
      fecha_revision: solicitud.fecha_revision,
      motivo_rechazo: solicitud.motivo_rechazo,
      estado: this.parseEstado(solicitud.estados_solicitudes.nombre),
      id_admin_revisor: solicitud.id_admin_revisor,
    };
  }

  private parseEstado(nombre: string): EstadoSolicitud {
    if (esEstadoSolicitud(nombre)) {
      return nombre;
    }
    throw new InternalServerErrorException(
      `Estado de solicitud desconocido: ${nombre}`,
    );
  }
}
