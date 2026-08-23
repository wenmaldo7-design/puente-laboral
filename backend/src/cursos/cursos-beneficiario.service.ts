import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { inscripciones_cursos, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  calcularMatchPorcentaje,
  PerfilMatching,
} from '../ofertas-laborales/matching.util';
import { CursoResponseDto } from './dto/curso-response.dto';
import { InscripcionCursoResponseDto } from './dto/inscripcion-curso-response.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

const ESTADO_INSCRITO = 'inscrito';
const ESTADO_CANCELADO = 'cancelado';
const ESTADO_COMPLETO = 'completo';

const INCLUDE_CURSO = {
  areas_interes: true,
  estados_publicacion_servicios: true,
  provincias: true,
  empresas: true,
  cursos: {
    include: {
      profesionales: true,
    },
  },
} satisfies Prisma.serviciosInclude;

type ServicioConCurso = Prisma.serviciosGetPayload<{
  include: typeof INCLUDE_CURSO;
}>;

function inicioDeHoy(): Date {
  const ahora = new Date();
  return new Date(
    Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()),
  );
}

@Injectable()
export class CursosBeneficiarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  /** GET /beneficiarios/cursos. Solo cursos activos y con fecha de inicio futura. */
  async listarDisponibles(
    idUsuarioBeneficiario: number,
  ): Promise<CursoResponseDto[]> {
    const [perfil, servicios] = await Promise.all([
      this.obtenerPerfilMatching(idUsuarioBeneficiario),
      this.prisma.servicios.findMany({
        where: {
          tipo_servicio: 'curso',
          estados_publicacion_servicios: { nombre: 'activa' },
          cursos: { is: { fecha_inicio: { gte: inicioDeHoy() } } },
        },
        include: INCLUDE_CURSO,
        orderBy: { cursos: { fecha_inicio: 'asc' } },
      }),
    ]);

    return this.aResponseDtoLista(servicios, perfil, idUsuarioBeneficiario);
  }

  /** GET /beneficiarios/cursos/:id. */
  async detalle(
    idUsuarioBeneficiario: number,
    idServicio: number,
  ): Promise<CursoResponseDto> {
    const servicio = await this.prisma.servicios.findUnique({
      where: { id_servicio: idServicio },
      include: INCLUDE_CURSO,
    });
    if (!servicio || servicio.tipo_servicio !== 'curso' || !servicio.cursos) {
      throw new NotFoundException('El curso no existe');
    }

    const perfil = await this.obtenerPerfilMatching(idUsuarioBeneficiario);
    const [resultado] = await this.aResponseDtoLista(
      [servicio],
      perfil,
      idUsuarioBeneficiario,
    );
    return resultado;
  }

  /** GET /beneficiarios/mis-cursos. Todas las inscripciones del beneficiario, sin filtrar por fecha. */
  async misCursos(idUsuarioBeneficiario: number): Promise<CursoResponseDto[]> {
    const inscripciones = await this.prisma.inscripciones_cursos.findMany({
      where: { id_usuario_beneficiario: idUsuarioBeneficiario },
      include: {
        cursos: { include: { servicios: { include: INCLUDE_CURSO } } },
      },
      orderBy: { fecha_inscripcion: 'desc' },
    });

    const servicios = inscripciones.map((i) => i.cursos.servicios);
    const perfil = await this.obtenerPerfilMatching(idUsuarioBeneficiario);
    return this.aResponseDtoLista(servicios, perfil, idUsuarioBeneficiario);
  }

  /**
   * POST /beneficiarios/cursos/:id/inscripciones.
   * Si ya existe una inscripción cancelada se reactiva (no se crea una fila
   * nueva: hay un UNIQUE en id_usuario_beneficiario + id_servicio).
   */
  async inscribirme(
    idUsuarioBeneficiario: number,
    idServicio: number,
  ): Promise<InscripcionCursoResponseDto> {
    const servicio = await this.prisma.servicios.findUnique({
      where: { id_servicio: idServicio },
      include: { cursos: true, estados_publicacion_servicios: true },
    });
    if (!servicio || servicio.tipo_servicio !== 'curso' || !servicio.cursos) {
      throw new NotFoundException('El curso no existe');
    }
    if (servicio.estados_publicacion_servicios.nombre !== 'activa') {
      throw new BadRequestException('Este curso no está activo');
    }
    if (
      servicio.cursos.fecha_inicio &&
      servicio.cursos.fecha_inicio < inicioDeHoy()
    ) {
      throw new BadRequestException('Este curso ya comenzó');
    }

    const estadoInscrito = await this.obtenerEstado(ESTADO_INSCRITO);
    const cupos = servicio.cursos.cupos;

    const existente = await this.prisma.inscripciones_cursos.findUnique({
      where: {
        id_usuario_beneficiario_id_servicio: {
          id_usuario_beneficiario: idUsuarioBeneficiario,
          id_servicio: idServicio,
        },
      },
    });

    let inscripcion: inscripciones_cursos;
    if (!existente) {
      await this.validarCupoDisponible(idServicio, cupos);
      try {
        inscripcion = await this.prisma.inscripciones_cursos.create({
          data: {
            id_usuario_beneficiario: idUsuarioBeneficiario,
            id_servicio: idServicio,
            id_estado_curso: estadoInscrito.id_estado_curso,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException('Ya estás inscrito en este curso');
        }
        throw error;
      }
    } else if (existente.id_estado_curso === estadoInscrito.id_estado_curso) {
      throw new ConflictException('Ya estás inscrito en este curso');
    } else {
      const estadoActual = await this.prisma.estados_cursos.findUnique({
        where: { id_estado_curso: existente.id_estado_curso },
      });
      if (estadoActual?.nombre === ESTADO_COMPLETO) {
        throw new ConflictException('Ya completaste este curso');
      }

      await this.validarCupoDisponible(idServicio, cupos);
      inscripcion = await this.prisma.inscripciones_cursos.update({
        where: { id_inscripcion: existente.id_inscripcion },
        data: {
          id_estado_curso: estadoInscrito.id_estado_curso,
          fecha_actualizacion: new Date(),
        },
      });
    }
    
    // Notificación
    await this.enviarNotificacion(
      idUsuarioBeneficiario,
      'CURSO_INSCRIPCION',
      servicio.titulo,
    );

    return {
      id: inscripcion.id_inscripcion,
      idServicio,
      tituloCurso: servicio.titulo,
      estadoCurso: estadoInscrito.nombre,
      fechaInscripcion: inscripcion.fecha_inscripcion,
      fechaActualizacion: inscripcion.fecha_actualizacion,
    };
  }

  /**
   * DELETE /beneficiarios/cursos/:id/inscripciones.
   * Nunca borra la fila: cambia el estado a cancelado para no perder historial.
   */
  async darDeBaja(
    idUsuarioBeneficiario: number,
    idServicio: number,
  ): Promise<InscripcionCursoResponseDto> {
    const estadoInscrito = await this.obtenerEstado(ESTADO_INSCRITO);
    const estadoCancelado = await this.obtenerEstado(ESTADO_CANCELADO);

    const existente = await this.prisma.inscripciones_cursos.findUnique({
      where: {
        id_usuario_beneficiario_id_servicio: {
          id_usuario_beneficiario: idUsuarioBeneficiario,
          id_servicio: idServicio,
        },
      },
      include: { cursos: { include: { servicios: true } } },
    });
    if (
      !existente ||
      existente.id_estado_curso !== estadoInscrito.id_estado_curso
    ) {
      throw new NotFoundException('No estás inscrito en este curso');
    }

    const inscripcion = await this.prisma.inscripciones_cursos.update({
      where: { id_inscripcion: existente.id_inscripcion },
      data: {
        id_estado_curso: estadoCancelado.id_estado_curso,
        fecha_actualizacion: new Date(),
      },
    });
    
    // Notificación
    await this.enviarNotificacion(
      idUsuarioBeneficiario,
      'CURSO_CANCELACION',
      existente.cursos.servicios.titulo,
    );

    return {
      id: inscripcion.id_inscripcion,
      idServicio,
      tituloCurso: existente.cursos.servicios.titulo,
      estadoCurso: estadoCancelado.nombre,
      fechaInscripcion: inscripcion.fecha_inscripcion,
      fechaActualizacion: inscripcion.fecha_actualizacion,
    };
  }

  private async validarCupoDisponible(
    idServicio: number,
    cupos: number | null,
  ): Promise<void> {
    if (cupos === null) return;
    const inscritosActuales = await this.contarInscritosActivos(idServicio);
    if (inscritosActuales >= cupos) {
      throw new ConflictException('No quedan cupos disponibles');
    }
  }

  private async contarInscritosActivos(idServicio: number): Promise<number> {
    const estadoInscrito = await this.obtenerEstado(ESTADO_INSCRITO);
    return this.prisma.inscripciones_cursos.count({
      where: {
        id_servicio: idServicio,
        id_estado_curso: estadoInscrito.id_estado_curso,
      },
    });
  }

  private async contarInscritosActivosPorServicio(
    idsServicio: number[],
  ): Promise<Map<number, number>> {
    if (idsServicio.length === 0) return new Map();
    const conteos = await this.prisma.inscripciones_cursos.groupBy({
      by: ['id_servicio'],
      where: {
        id_servicio: { in: idsServicio },
        estados_cursos: { nombre: ESTADO_INSCRITO },
      },
      _count: { id_servicio: true },
    });
    return new Map(conteos.map((c) => [c.id_servicio, c._count.id_servicio]));
  }

  private async obtenerEstado(nombre: string) {
    const estado = await this.prisma.estados_cursos.findFirst({
      where: { nombre },
    });
    if (!estado) {
      throw new BadRequestException(
        `No se encontró el estado de curso "${nombre}"`,
      );
    }
    return estado;
  }

  private async obtenerPerfilMatching(
    idUsuarioBeneficiario: number,
  ): Promise<PerfilMatching> {
    const [habilidades, areas] = await Promise.all([
      this.prisma.beneficiarios_habilidades.findMany({
        where: { id_usuario_beneficiario: idUsuarioBeneficiario },
        select: { id_habilidad: true },
      }),
      this.prisma.beneficiarios_areas.findMany({
        where: { id_usuario_beneficiario: idUsuarioBeneficiario },
        select: { id_area: true },
      }),
    ]);

    return {
      idsHabilidades: new Set(habilidades.map((h) => h.id_habilidad)),
      idsAreas: new Set(areas.map((a) => a.id_area)),
    };
  }

  private async obtenerInscripcionesActivas(
    idUsuarioBeneficiario: number,
    idsServicio: number[],
  ): Promise<Set<number>> {
    if (idsServicio.length === 0) return new Set();
    const inscripciones = await this.prisma.inscripciones_cursos.findMany({
      where: {
        id_usuario_beneficiario: idUsuarioBeneficiario,
        id_servicio: { in: idsServicio },
        estados_cursos: { nombre: ESTADO_INSCRITO },
      },
      select: { id_servicio: true },
    });
    return new Set(inscripciones.map((i) => i.id_servicio));
  }

  private async aResponseDtoLista(
    servicios: ServicioConCurso[],
    perfil: PerfilMatching,
    idUsuarioBeneficiario: number,
  ): Promise<CursoResponseDto[]> {
    const idsServicio = servicios.map((s) => s.id_servicio);
    const [inscripcionesPropias, inscritosPorServicio] = await Promise.all([
      this.obtenerInscripcionesActivas(idUsuarioBeneficiario, idsServicio),
      this.contarInscritosActivosPorServicio(idsServicio),
    ]);

    return servicios.map((servicio) =>
      this.aResponseDto(
        servicio,
        perfil,
        inscripcionesPropias.has(servicio.id_servicio),
        inscritosPorServicio.get(servicio.id_servicio) ?? 0,
      ),
    );
  }

  private aResponseDto(
    servicio: ServicioConCurso,
    perfil: PerfilMatching,
    inscrito: boolean,
    inscritosActuales: number,
  ): CursoResponseDto {
    const curso = servicio.cursos!;
    const profesional = curso.profesionales;
    const profesor = profesional
      ? `${profesional.nombre} ${profesional.apellido}`
      : null;

    const matchPorcentaje = calcularMatchPorcentaje(perfil, {
      idArea: servicio.id_area,
      idsHabilidadesRequeridas: [],
    });

    const cuposDisponibles =
      curso.cupos === null
        ? null
        : Math.max(curso.cupos - inscritosActuales, 0);

    return {
      id: servicio.id_servicio,
      titulo: servicio.titulo,
      descripcion: servicio.descripcion,
      area: servicio.areas_interes.nombre,
      provincia: servicio.provincias?.nombre ?? null,
      fechaInicio: curso.fecha_inicio,
      fechaFin: curso.fecha_fin,
      cupos: curso.cupos,
      cuposDisponibles,
      modalidad: curso.modalidad,
      requisitos: curso.requisitos,
      otorgaCertificado: curso.otorga_certificado,
      profesor,
      matchPorcentaje,
      inscrito,
    };
  }

  private async enviarNotificacion(
    idUsuarioBeneficiario: number,
    tipo: 'CURSO_INSCRIPCION' | 'CURSO_CANCELACION',
    curso: string,
  ): Promise<void> {
    try {
      await this.notificacionesService.crear({
        tipo,
        destinatario: { idUsuario: idUsuarioBeneficiario, rol: 'beneficiario' },
        datos: { curso },
      });
    } catch (error) {
      console.error(
        `No se pudo crear la notificación "${tipo}" para el usuario ${idUsuarioBeneficiario}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
