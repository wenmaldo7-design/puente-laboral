import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CrearPostulacionDto } from './dto/crear-postulacion.dto';
import { PostulacionResponseDto } from './dto/postulacion-response.dto';

/** Estado asignado por default a toda postulación recién creada. */
const ESTADO_POSTULACION_DEFAULT = 'pendiente';

function inicioDeHoy(): Date {
  const ahora = new Date();
  return new Date(
    Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()),
  );
}

@Injectable()
export class PostulacionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /beneficiarios/ofertas-laborales/:id/postulaciones.
   *
   * El `SELECT ... FOR UPDATE` sobre la fila puntual de OFERTAS_LABORALES
   * serializa, dentro de la transacción, a todos los beneficiarios que
   * compiten por el cupo de ESA oferta (no bloquea otras ofertas): el
   * segundo request que llega mientras el primero todavía no hizo commit
   * espera el lock y recuenta postulantes ya con la fila del primero
   * insertada. El @@unique(id_usuario_beneficiario, id_servicio) es la
   * segunda barrera (P2002) para el caso de doble click del mismo usuario.
   */
  async postularme(
    idUsuarioBeneficiario: number,
    idServicio: number,
    dto: CrearPostulacionDto,
  ): Promise<PostulacionResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const servicio = await tx.servicios.findUnique({
        where: { id_servicio: idServicio },
        include: {
          ofertas_laborales: true,
          estados_publicacion_servicios: true,
          empresas: true,
        },
      });
      if (
        !servicio ||
        servicio.tipo_servicio !== 'oferta_laboral' ||
        !servicio.ofertas_laborales
      ) {
        throw new NotFoundException('La oferta laboral no existe');
      }
      if (servicio.estados_publicacion_servicios.nombre !== 'activa') {
        throw new BadRequestException('Esta oferta no está activa');
      }
      if (
        servicio.ofertas_laborales.fecha_limite &&
        servicio.ofertas_laborales.fecha_limite < inicioDeHoy()
      ) {
        throw new BadRequestException('Esta oferta ya venció');
      }

      const yaPostulado = await tx.postulaciones_laborales.findUnique({
        where: {
          id_usuario_beneficiario_id_servicio: {
            id_usuario_beneficiario: idUsuarioBeneficiario,
            id_servicio: idServicio,
          },
        },
      });
      if (yaPostulado) {
        throw new ConflictException('Ya estás postulado a esta oferta');
      }

      // Lockea esta oferta puntual hasta el commit: ver comentario de la clase.
      await tx.$queryRaw`SELECT id_servicio FROM ofertas_laborales WHERE id_servicio = ${idServicio} FOR UPDATE`;

      const vacantes = servicio.ofertas_laborales.vacantes;
      if (vacantes !== null) {
        const postulantesActuales = await tx.postulaciones_laborales.count({
          where: { id_servicio: idServicio },
        });
        if (postulantesActuales >= vacantes) {
          throw new ConflictException(
            'Ya no quedan cupos disponibles para esta oferta',
          );
        }
      }

      const beneficiario = await tx.beneficiarios.findUnique({
        where: { id_usuario: idUsuarioBeneficiario },
      });
      if (!beneficiario) {
        throw new NotFoundException('Beneficiario no encontrado');
      }

      const estadoPendiente = await tx.estados_postulaciones.findFirst({
        where: { nombre: ESTADO_POSTULACION_DEFAULT },
      });
      if (!estadoPendiente) {
        throw new BadRequestException(
          `No se encontró el estado de postulación "${ESTADO_POSTULACION_DEFAULT}"`,
        );
      }

      try {
        const postulacion = await tx.postulaciones_laborales.create({
          data: {
            id_usuario_beneficiario: idUsuarioBeneficiario,
            id_servicio: idServicio,
            id_estado_postulacion: estadoPendiente.id_estado_postulacion,
            cv_url: beneficiario.cv_url,
            carta_presentacion: dto.carta_presentacion || null,
          },
        });

        return {
          id_postulacion: postulacion.id_postulacion,
          id_servicio: idServicio,
          titulo_oferta: servicio.titulo,
          empresa: servicio.empresas.razon_social,
          fecha_postulacion: postulacion.fecha_postulacion,
          estado_postulacion: estadoPendiente.nombre,
          cv_url: postulacion.cv_url,
          carta_presentacion: postulacion.carta_presentacion,
        };
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException('Ya estás postulado a esta oferta');
        }
        throw error;
      }
    });
  }

  /** GET /beneficiarios/postulaciones. */
  async misPostulaciones(
    idUsuarioBeneficiario: number,
  ): Promise<PostulacionResponseDto[]> {
    const postulaciones = await this.prisma.postulaciones_laborales.findMany({
      where: { id_usuario_beneficiario: idUsuarioBeneficiario },
      include: {
        estados_postulaciones: true,
        ofertas_laborales: {
          include: { servicios: { include: { empresas: true } } },
        },
      },
      orderBy: { fecha_postulacion: 'desc' },
    });

    return postulaciones.map((p) => ({
      id_postulacion: p.id_postulacion,
      id_servicio: p.id_servicio,
      titulo_oferta: p.ofertas_laborales.servicios.titulo,
      empresa: p.ofertas_laborales.servicios.empresas.razon_social,
      fecha_postulacion: p.fecha_postulacion,
      estado_postulacion: p.estados_postulaciones.nombre,
      cv_url: p.cv_url,
      carta_presentacion: p.carta_presentacion,
    }));
  }
}
