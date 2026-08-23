import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { InscripcionResponseDto } from './dto/inscripcion-response.dto';
import { MentoriaResponseDto } from './dto/mentoria-response.dto';

const ESTADO_INSCRITO = 'inscrito';
const ESTADO_CANCELADO = 'cancelado';

const INCLUDE_MENTORIA = {
  areas_interes: true,
  estados_publicacion_servicios: true,
  provincias: true,
  empresas: true,
  mentorias: {
    include: {
      profesionales: true,
    },
  },
} satisfies Prisma.serviciosInclude;

type ServicioConMentoria = Prisma.serviciosGetPayload<{
  include: typeof INCLUDE_MENTORIA;
}>;

function inicioDeHoy(): Date {
  const ahora = new Date();
  return new Date(
    Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()),
  );
}

@Injectable()
export class MentoriasBeneficiarioService {
  private readonly logger = new Logger(MentoriasBeneficiarioService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  /** GET /beneficiarios/mentorias. Solo mentorías activas y con fecha futura. */
  async listarDisponibles(
    idUsuarioBeneficiario: number,
  ): Promise<MentoriaResponseDto[]> {
    const servicios = await this.prisma.servicios.findMany({
      where: {
        tipo_servicio: 'mentoria',
        estados_publicacion_servicios: { nombre: 'activa' },
        mentorias: { is: { fecha: { gte: inicioDeHoy() } } },
      },
      include: INCLUDE_MENTORIA,
    });

    const inscriptasPropias = await this.obtenerInscripcionesActivas(
      idUsuarioBeneficiario,
      servicios.map((s) => s.id_servicio),
    );

    return servicios.map((s) =>
      this.aResponseDto(s, inscriptasPropias.has(s.id_servicio)),
    );
  }

  /** GET /beneficiarios/mentorias/:id. */
  async detalle(
    idUsuarioBeneficiario: number,
    idServicio: number,
  ): Promise<MentoriaResponseDto> {
    const servicio = await this.prisma.servicios.findUnique({
      where: { id_servicio: idServicio },
      include: INCLUDE_MENTORIA,
    });
    if (
      !servicio ||
      servicio.tipo_servicio !== 'mentoria' ||
      !servicio.mentorias
    ) {
      throw new NotFoundException('La mentoría no existe');
    }

    const inscriptasPropias = await this.obtenerInscripcionesActivas(
      idUsuarioBeneficiario,
      [idServicio],
    );
    return this.aResponseDto(servicio, inscriptasPropias.has(idServicio));
  }

  /** GET /beneficiarios/mis-mentorias. Todas las inscripciones del beneficiario, sin filtrar por fecha. */
  async misMentorias(
    idUsuarioBeneficiario: number,
  ): Promise<MentoriaResponseDto[]> {
    const inscripciones = await this.prisma.inscripciones_mentorias.findMany({
      where: { id_usuario_beneficiario: idUsuarioBeneficiario },
      include: {
        estados_mentorias: true,
        mentorias: { include: { servicios: { include: INCLUDE_MENTORIA } } },
      },
      orderBy: { fecha_inscripcion: 'desc' },
    });

    return inscripciones.map((i) =>
      this.aResponseDto(
        i.mentorias.servicios,
        i.estados_mentorias.nombre === ESTADO_INSCRITO,
      ),
    );
  }

  /**
   * POST /beneficiarios/mentorias/:id/inscripciones.
   * Si ya existe una inscripción cancelada se reactiva (no se crea una fila
   * nueva: hay un UNIQUE en id_usuario_beneficiario + id_servicio).
   */
  async inscribirme(
    idUsuarioBeneficiario: number,
    idServicio: number,
  ): Promise<InscripcionResponseDto> {
    const servicio = await this.prisma.servicios.findUnique({
      where: { id_servicio: idServicio },
      include: { mentorias: true, estados_publicacion_servicios: true },
    });
    if (
      !servicio ||
      servicio.tipo_servicio !== 'mentoria' ||
      !servicio.mentorias
    ) {
      throw new NotFoundException('La mentoría no existe');
    }
    if (servicio.estados_publicacion_servicios.nombre !== 'activa') {
      throw new BadRequestException('Esta mentoría no está activa');
    }
    if (
      servicio.mentorias.fecha &&
      servicio.mentorias.fecha < inicioDeHoy()
    ) {
      throw new BadRequestException('Esta mentoría ya pasó');
    }

    const estadoInscrito = await this.obtenerEstado(ESTADO_INSCRITO);

    const existente = await this.prisma.inscripciones_mentorias.findUnique({
      where: {
        id_usuario_beneficiario_id_servicio: {
          id_usuario_beneficiario: idUsuarioBeneficiario,
          id_servicio: idServicio,
        },
      },
    });

    let inscripcion;
    if (!existente) {
      try {
        inscripcion = await this.prisma.inscripciones_mentorias.create({
          data: {
            id_usuario_beneficiario: idUsuarioBeneficiario,
            id_servicio: idServicio,
            id_estado_mentoria: estadoInscrito.id_estado_mentoria,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException('Ya estás inscrito en esta mentoría');
        }
        throw error;
      }
    } else if (existente.id_estado_mentoria === estadoInscrito.id_estado_mentoria) {
      throw new ConflictException('Ya estás inscrito en esta mentoría');
    } else {
      inscripcion = await this.prisma.inscripciones_mentorias.update({
        where: { id_inscripcion: existente.id_inscripcion },
        data: {
          id_estado_mentoria: estadoInscrito.id_estado_mentoria,
          fecha_actualizacion: new Date(),
        },
      });
    }

    await this.notificar(
      'MENTORIA_INSCRIPCION',
      idUsuarioBeneficiario,
      servicio.titulo,
    );

    return {
      id_inscripcion: inscripcion.id_inscripcion,
      id_servicio: idServicio,
      titulo_mentoria: servicio.titulo,
      fecha_inscripcion: inscripcion.fecha_inscripcion,
      estado_mentoria: estadoInscrito.nombre,
      fecha_actualizacion: inscripcion.fecha_actualizacion,
    };
  }

  /**
   * DELETE /beneficiarios/mentorias/:id/inscripciones.
   * Nunca borra la fila: cambia el estado a cancelado para no perder historial.
   */
  async darDeBaja(
    idUsuarioBeneficiario: number,
    idServicio: number,
  ): Promise<InscripcionResponseDto> {
    const estadoInscrito = await this.obtenerEstado(ESTADO_INSCRITO);
    const estadoCancelado = await this.obtenerEstado(ESTADO_CANCELADO);

    const existente = await this.prisma.inscripciones_mentorias.findUnique({
      where: {
        id_usuario_beneficiario_id_servicio: {
          id_usuario_beneficiario: idUsuarioBeneficiario,
          id_servicio: idServicio,
        },
      },
      include: { mentorias: { include: { servicios: true } } },
    });
    if (
      !existente ||
      existente.id_estado_mentoria !== estadoInscrito.id_estado_mentoria
    ) {
      throw new NotFoundException('No estás inscrito en esta mentoría');
    }

    const inscripcion = await this.prisma.inscripciones_mentorias.update({
      where: { id_inscripcion: existente.id_inscripcion },
      data: {
        id_estado_mentoria: estadoCancelado.id_estado_mentoria,
        fecha_actualizacion: new Date(),
      },
    });

    await this.notificar(
      'MENTORIA_CANCELACION',
      idUsuarioBeneficiario,
      existente.mentorias.servicios.titulo,
    );

    return {
      id_inscripcion: inscripcion.id_inscripcion,
      id_servicio: idServicio,
      titulo_mentoria: existente.mentorias.servicios.titulo,
      fecha_inscripcion: inscripcion.fecha_inscripcion,
      estado_mentoria: estadoCancelado.nombre,
      fecha_actualizacion: inscripcion.fecha_actualizacion,
    };
  }

  /**
   * La inscripción/baja ya se guardó antes de llamar a este método: una
   * falla al notificar no debe hacer fallar la operación principal, solo
   * se registra para diagnóstico.
   */
  private async notificar(
    tipo: 'MENTORIA_INSCRIPCION' | 'MENTORIA_CANCELACION',
    idUsuarioBeneficiario: number,
    mentoria: string,
  ): Promise<void> {
    try {
      await this.notificacionesService.crear({
        tipo,
        destinatario: { idUsuario: idUsuarioBeneficiario, rol: 'beneficiario' },
        datos: { mentoria },
      });
    } catch (error) {
      this.logger.error(
        `No se pudo crear la notificación "${tipo}" para el usuario ${idUsuarioBeneficiario}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async obtenerEstado(nombre: string) {
    const estado = await this.prisma.estados_mentorias.findFirst({
      where: { nombre },
    });
    if (!estado) {
      throw new BadRequestException(
        `No se encontró el estado de mentoría "${nombre}"`,
      );
    }
    return estado;
  }

  private async obtenerInscripcionesActivas(
    idUsuarioBeneficiario: number,
    idsServicio: number[],
  ): Promise<Set<number>> {
    if (idsServicio.length === 0) return new Set();
    const inscripciones = await this.prisma.inscripciones_mentorias.findMany({
      where: {
        id_usuario_beneficiario: idUsuarioBeneficiario,
        id_servicio: { in: idsServicio },
        estados_mentorias: { nombre: ESTADO_INSCRITO },
      },
      select: { id_servicio: true },
    });
    return new Set(inscripciones.map((i) => i.id_servicio));
  }

  private aResponseDto(
    servicio: ServicioConMentoria,
    inscrito: boolean,
  ): MentoriaResponseDto {
    const mentoria = servicio.mentorias!;
    const profesional = mentoria.profesionales;
    const empresa = servicio.empresas;
    let mentorNombre: string | null = null;
    if (profesional) {
      mentorNombre = `${profesional.nombre} ${profesional.apellido}`;
    } else if (empresa) {
      mentorNombre = empresa.razon_social;
    }

    return {
      id_servicio: servicio.id_servicio,
      titulo: servicio.titulo,
      descripcion: servicio.descripcion,
      area: servicio.areas_interes.nombre,
      fecha: mentoria.fecha,
      hora_inicio: mentoria.hora_inicio,
      modalidad: mentoria.modalidad,
      link_o_canal: mentoria.link_o_canal,
      mentor: mentorNombre,
      inscrito,
      provincia: servicio.provincias?.nombre ?? null,
    };
  }
}
