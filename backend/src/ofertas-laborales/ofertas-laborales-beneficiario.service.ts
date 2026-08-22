import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  MotivoNoDisponible,
  OfertaLaboralBeneficiarioResponseDto,
} from './dto/oferta-laboral-beneficiario-response.dto';
import { calcularMatchPorcentaje, PerfilMatching } from './matching.util';

const INCLUDE_OFERTA = {
  areas_interes: true,
  empresas: true,
  estados_publicacion_servicios: true,
  provincias: true,
  ofertas_laborales: {
    include: {
      tipos_contrato: true,
      ofertas_habilidades: { include: { habilidades: true } },
    },
  },
} satisfies Prisma.serviciosInclude;

type ServicioConOferta = Prisma.serviciosGetPayload<{
  include: typeof INCLUDE_OFERTA;
}>;

function inicioDeHoy(): Date {
  const ahora = new Date();
  return new Date(
    Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()),
  );
}

@Injectable()
export class OfertasLaboralesBeneficiarioService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /beneficiarios/ofertas-laborales. Solo ofertas activas y no vencidas.
   * Si ninguna tiene match_porcentaje > 0 (perfil sin habilidades/áreas
   * cargadas, o sin ninguna coincidencia), se listan todas igual, sin
   * ordenar por match: evita devolver 0 resultados por un perfil incompleto.
   */
  async listarCompatibles(
    idUsuarioBeneficiario: number,
  ): Promise<OfertaLaboralBeneficiarioResponseDto[]> {
    const [perfil, servicios] = await Promise.all([
      this.obtenerPerfilMatching(idUsuarioBeneficiario),
      this.prisma.servicios.findMany({
        where: {
          tipo_servicio: 'oferta_laboral',
          estados_publicacion_servicios: { nombre: 'activa' },
          ofertas_laborales: {
            is: {
              OR: [
                { fecha_limite: null },
                { fecha_limite: { gte: inicioDeHoy() } },
              ],
            },
          },
        },
        include: INCLUDE_OFERTA,
      }),
    ]);

    const postulacionesPropias = await this.obtenerPostulacionesPropias(
      idUsuarioBeneficiario,
      servicios.map((s) => s.id_servicio),
    );
    const postulantesPorServicio = await this.contarPostulantesPorServicio(
      servicios.map((s) => s.id_servicio),
    );

    const conScore = servicios.map((servicio) =>
      this.aResponseDto(
        servicio,
        perfil,
        postulacionesPropias,
        postulantesPorServicio,
      ),
    );

    const compatibles = conScore
      .filter((o) => o.match_porcentaje > 0)
      .sort((a, b) => b.match_porcentaje - a.match_porcentaje);

    if (compatibles.length > 0) {
      return compatibles;
    }
    return conScore.sort(
      (a, b) => b.fecha_publicacion.getTime() - a.fecha_publicacion.getTime(),
    );
  }

  /** GET /beneficiarios/ofertas-laborales/:id. Visible aunque no matchee o esté cerrada/vencida, para transparencia. */
  async detalle(
    idUsuarioBeneficiario: number,
    idServicio: number,
  ): Promise<OfertaLaboralBeneficiarioResponseDto> {
    const servicio = await this.prisma.servicios.findUnique({
      where: { id_servicio: idServicio },
      include: INCLUDE_OFERTA,
    });
    if (
      !servicio ||
      servicio.tipo_servicio !== 'oferta_laboral' ||
      !servicio.ofertas_laborales
    ) {
      throw new NotFoundException('La oferta laboral no existe');
    }

    const perfil = await this.obtenerPerfilMatching(idUsuarioBeneficiario);
    const postulacionesPropias = await this.obtenerPostulacionesPropias(
      idUsuarioBeneficiario,
      [idServicio],
    );
    const postulantesPorServicio = await this.contarPostulantesPorServicio([
      idServicio,
    ]);

    return this.aResponseDto(
      servicio,
      perfil,
      postulacionesPropias,
      postulantesPorServicio,
    );
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

  private async obtenerPostulacionesPropias(
    idUsuarioBeneficiario: number,
    idsServicio: number[],
  ): Promise<Set<number>> {
    if (idsServicio.length === 0) return new Set();
    const postulaciones = await this.prisma.postulaciones_laborales.findMany({
      where: {
        id_usuario_beneficiario: idUsuarioBeneficiario,
        id_servicio: { in: idsServicio },
      },
      select: { id_servicio: true },
    });
    return new Set(postulaciones.map((p) => p.id_servicio));
  }

  private async contarPostulantesPorServicio(
    idsServicio: number[],
  ): Promise<Map<number, number>> {
    if (idsServicio.length === 0) return new Map();
    const conteos = await this.prisma.postulaciones_laborales.groupBy({
      by: ['id_servicio'],
      where: { id_servicio: { in: idsServicio } },
      _count: { id_servicio: true },
    });
    return new Map(conteos.map((c) => [c.id_servicio, c._count.id_servicio]));
  }

  private aResponseDto(
    servicio: ServicioConOferta,
    perfil: PerfilMatching,
    postulacionesPropias: Set<number>,
    postulantesPorServicio: Map<number, number>,
  ): OfertaLaboralBeneficiarioResponseDto {
    const oferta = servicio.ofertas_laborales!;
    const habilidadesRequeridas = oferta.ofertas_habilidades.map(
      (oh) => oh.habilidades,
    );
    const matchPorcentaje = calcularMatchPorcentaje(perfil, {
      idArea: servicio.id_area,
      idsHabilidadesRequeridas: habilidadesRequeridas.map(
        (h) => h.id_habilidad,
      ),
    });

    const estaActiva =
      servicio.estados_publicacion_servicios.nombre === 'activa';
    const estaVencida =
      oferta.fecha_limite !== null && oferta.fecha_limite < inicioDeHoy();
    const postulantesActuales =
      postulantesPorServicio.get(servicio.id_servicio) ?? 0;
    const cupoCompleto =
      oferta.vacantes !== null && postulantesActuales >= oferta.vacantes;
    const yaPostulado = postulacionesPropias.has(servicio.id_servicio);

    let motivo: MotivoNoDisponible | null = null;
    if (yaPostulado) motivo = 'ya_postulado';
    else if (!estaActiva) motivo = 'cerrada';
    else if (estaVencida) motivo = 'vencida';
    else if (cupoCompleto) motivo = 'cupo_completo';

    return {
      id_servicio: servicio.id_servicio,
      titulo: servicio.titulo,
      descripcion: servicio.descripcion,
      empresa: servicio.empresas.razon_social,
      area: servicio.areas_interes.nombre,
      habilidades: habilidadesRequeridas.map((h) => h.nombre),
      tipo_contrato: oferta.tipos_contrato?.nombre ?? null,
      modalidad: oferta.modalidad,
      salario: oferta.salario ? Number(oferta.salario) : null,
      vacantes: oferta.vacantes,
      postulantes_actuales: postulantesActuales,
      fecha_limite: oferta.fecha_limite,
      fecha_publicacion: servicio.fecha_publicacion,
      estado_publicacion: servicio.estados_publicacion_servicios.nombre,
      match_porcentaje: matchPorcentaje,
      puede_postularse: motivo === null,
      motivo_no_disponible: motivo,
      provincia: servicio.provincias?.nombre ?? null,
    };
  }
}
