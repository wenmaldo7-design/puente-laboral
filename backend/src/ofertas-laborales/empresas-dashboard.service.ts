import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { EmpresaMetricasResponseDto } from './dto/empresa-metricas-response.dto';
import { PostulanteRecienteResponseDto } from './dto/postulante-reciente-response.dto';
import { calcularMatchPorcentaje } from './matching.util';

const LIMITE_POSTULANTES_RECIENTES = 10;

interface PostulacionParaMatch {
  idUsuarioBeneficiario: number;
  idServicio: number;
}

@Injectable()
export class EmpresasDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  /** GET /empresas/metricas: resumen de impacto de la empresa autenticada. */
  async obtenerMetricas(
    idUsuarioEmpresa: number,
  ): Promise<EmpresaMetricasResponseDto> {
    const [oportunidadesActivas, postulaciones] = await Promise.all([
      this.prisma.servicios.count({
        where: {
          id_usuario_empresa: idUsuarioEmpresa,
          tipo_servicio: 'oferta_laboral',
          estados_publicacion_servicios: { nombre: 'activa' },
        },
      }),
      this.prisma.postulaciones_laborales.findMany({
        where: {
          ofertas_laborales: {
            servicios: { id_usuario_empresa: idUsuarioEmpresa },
          },
        },
        include: { estados_postulaciones: true },
      }),
    ]);

    const postulacionesPendientes = postulaciones.filter(
      (p) => p.estados_postulaciones.nombre === 'pendiente',
    ).length;

    const matches = await this.calcularMatchesDePostulaciones(
      postulaciones.map((p) => ({
        idUsuarioBeneficiario: p.id_usuario_beneficiario,
        idServicio: p.id_servicio,
      })),
    );
    const matchPromedio = matches.length
      ? Math.round(matches.reduce((suma, m) => suma + m, 0) / matches.length)
      : null;

    return {
      oportunidades_activas: oportunidadesActivas,
      postulaciones_totales: postulaciones.length,
      postulaciones_pendientes: postulacionesPendientes,
      match_promedio: matchPromedio,
    };
  }

  /** GET /empresas/postulaciones/recientes: últimos postulantes recibidos en cualquiera de las ofertas de la empresa. */
  async obtenerPostulantesRecientes(
    idUsuarioEmpresa: number,
  ): Promise<PostulanteRecienteResponseDto[]> {
    const postulaciones = await this.prisma.postulaciones_laborales.findMany({
      where: {
        ofertas_laborales: {
          servicios: { id_usuario_empresa: idUsuarioEmpresa },
        },
      },
      include: {
        beneficiarios: true,
        estados_postulaciones: true,
        ofertas_laborales: { include: { servicios: true } },
      },
      orderBy: { fecha_postulacion: 'desc' },
      take: LIMITE_POSTULANTES_RECIENTES,
    });

    const matches = await this.calcularMatchesDePostulaciones(
      postulaciones.map((p) => ({
        idUsuarioBeneficiario: p.id_usuario_beneficiario,
        idServicio: p.id_servicio,
      })),
    );

    return postulaciones.map((p, i) => ({
      id_postulacion: p.id_postulacion,
      beneficiario_nombre: `${p.beneficiarios.nombre} ${p.beneficiarios.apellido}`,
      avatar_iniciales:
        `${p.beneficiarios.nombre[0] ?? ''}${p.beneficiarios.apellido[0] ?? ''}`.toUpperCase(),
      oferta_titulo: p.ofertas_laborales.servicios.titulo,
      id_servicio: p.id_servicio,
      match_porcentaje: matches[i],
      fecha_postulacion: p.fecha_postulacion,
      estado_postulacion: p.estados_postulaciones.nombre,
    }));
  }

  /** Reusa la misma fórmula de match que ve el beneficiario (matching.util.ts), en lote para varias postulaciones. */
  private async calcularMatchesDePostulaciones(
    postulaciones: PostulacionParaMatch[],
  ): Promise<number[]> {
    if (postulaciones.length === 0) return [];

    const idsServicio = [...new Set(postulaciones.map((p) => p.idServicio))];
    const idsBeneficiario = [
      ...new Set(postulaciones.map((p) => p.idUsuarioBeneficiario)),
    ];

    const [servicios, habilidadesBeneficiarios, areasBeneficiarios] =
      await Promise.all([
        this.prisma.servicios.findMany({
          where: { id_servicio: { in: idsServicio } },
          include: {
            ofertas_laborales: { include: { ofertas_habilidades: true } },
          },
        }),
        this.prisma.beneficiarios_habilidades.findMany({
          where: { id_usuario_beneficiario: { in: idsBeneficiario } },
          select: { id_usuario_beneficiario: true, id_habilidad: true },
        }),
        this.prisma.beneficiarios_areas.findMany({
          where: { id_usuario_beneficiario: { in: idsBeneficiario } },
          select: { id_usuario_beneficiario: true, id_area: true },
        }),
      ]);

    const servicioPorId = new Map(servicios.map((s) => [s.id_servicio, s]));

    const habilidadesPorBeneficiario = new Map<number, Set<number>>();
    for (const h of habilidadesBeneficiarios) {
      const set =
        habilidadesPorBeneficiario.get(h.id_usuario_beneficiario) ??
        new Set<number>();
      set.add(h.id_habilidad);
      habilidadesPorBeneficiario.set(h.id_usuario_beneficiario, set);
    }

    const areasPorBeneficiario = new Map<number, Set<number>>();
    for (const a of areasBeneficiarios) {
      const set =
        areasPorBeneficiario.get(a.id_usuario_beneficiario) ??
        new Set<number>();
      set.add(a.id_area);
      areasPorBeneficiario.set(a.id_usuario_beneficiario, set);
    }

    return postulaciones.map(({ idUsuarioBeneficiario, idServicio }) => {
      const servicio = servicioPorId.get(idServicio);
      if (!servicio?.ofertas_laborales) return 0;

      return calcularMatchPorcentaje(
        {
          idsHabilidades:
            habilidadesPorBeneficiario.get(idUsuarioBeneficiario) ?? new Set(),
          idsAreas:
            areasPorBeneficiario.get(idUsuarioBeneficiario) ?? new Set(),
        },
        {
          idArea: servicio.id_area,
          idsHabilidadesRequeridas:
            servicio.ofertas_laborales.ofertas_habilidades.map(
              (oh) => oh.id_habilidad,
            ),
        },
      );
    });
  }

  /** PATCH /empresas/postulaciones/:id/estado: actualiza el estado de la postulación. */
  async actualizarEstadoPostulacion(
    idUsuarioEmpresa: number,
    idPostulacion: number,
    nuevoEstado: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const postulacion = await tx.postulaciones_laborales.findUnique({
        where: { id_postulacion: idPostulacion },
        include: {
          ofertas_laborales: {
            include: { servicios: { include: { empresas: true } } },
          },
          estados_postulaciones: true,
        },
      });

      if (!postulacion) {
        throw new NotFoundException('Postulación no encontrada');
      }

      const servicio = postulacion.ofertas_laborales.servicios;

      if (servicio.id_usuario_empresa !== idUsuarioEmpresa) {
        throw new ForbiddenException('No tienes permiso para modificar esta postulación');
      }

      if (postulacion.estados_postulaciones.nombre === nuevoEstado) {
        return; // Sin cambios
      }

      const estadoDestino = await tx.estados_postulaciones.findFirst({
        where: { nombre: nuevoEstado },
      });

      if (!estadoDestino) {
        throw new BadRequestException(`Estado "${nuevoEstado}" inválido`);
      }

      if (nuevoEstado === 'aceptada') {
        // Lockea la oferta
        await tx.$queryRaw`SELECT id_servicio FROM ofertas_laborales WHERE id_servicio = ${postulacion.id_servicio} FOR UPDATE`;

        const vacantes = postulacion.ofertas_laborales.vacantes;
        if (vacantes !== null) {
          const aceptados = await tx.postulaciones_laborales.count({
            where: {
              id_servicio: postulacion.id_servicio,
              estados_postulaciones: { nombre: 'aceptada' },
            },
          });

          if (aceptados >= vacantes) {
            throw new ConflictException('El límite de vacantes para esta oferta ha sido alcanzado');
          }
        }
      }

      await tx.postulaciones_laborales.update({
        where: { id_postulacion: idPostulacion },
        data: { id_estado_postulacion: estadoDestino.id_estado_postulacion },
      });

      await this.notificacionesService.crear({
        tipo: 'POSTULACION_CAMBIO_ESTADO',
        destinatario: {
          rol: 'beneficiario',
          idUsuario: postulacion.id_usuario_beneficiario,
        },
        datos: {
          oferta: servicio.titulo,
          empresa: servicio.empresas.razon_social,
          estado: nuevoEstado,
        },
      });
    });
  }
}

