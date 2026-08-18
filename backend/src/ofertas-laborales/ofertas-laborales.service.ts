import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CrearOfertaLaboralDto } from './dto/crear-oferta-laboral.dto';
import { OfertaLaboralResponseDto } from './dto/oferta-laboral-response.dto';
import { OportunidadEmpresaResponseDto } from './dto/oportunidad-empresa-response.dto';

/** Estado asignado por default a toda oferta laboral recién publicada. */
const ESTADO_PUBLICACION_DEFAULT = 'activa';

@Injectable()
export class OfertasLaboralesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /empresas/ofertas-laborales. Resuelve área/habilidades/tipo de
   * contrato por nombre contra sus catálogos (falla antes de tocar la DB si
   * alguno no existe) y arma SERVICIOS + OFERTAS_LABORALES + OFERTAS_HABILIDADES
   * en una única transacción: si cualquier insert falla, se revierte todo.
   */
  async crear(
    idUsuarioEmpresa: number,
    dto: CrearOfertaLaboralDto,
  ): Promise<OfertaLaboralResponseDto> {
    const area = await this.prisma.areas_interes.findFirst({
      where: { nombre: dto.area },
    });
    if (!area) {
      throw new BadRequestException(
        'El área seleccionada no existe en el catálogo',
      );
    }

    const nombresHabilidades = [...new Set(dto.habilidades ?? [])];
    const habilidades = nombresHabilidades.length
      ? await this.prisma.habilidades.findMany({
          where: { nombre: { in: nombresHabilidades } },
        })
      : [];
    if (habilidades.length !== nombresHabilidades.length) {
      throw new BadRequestException(
        'Alguna habilidad no existe en el catálogo',
      );
    }

    let idTipoContrato: number | null = null;
    if (dto.tipo_contrato) {
      const tipoContrato = await this.prisma.tipos_contrato.findFirst({
        where: { nombre: dto.tipo_contrato },
      });
      if (!tipoContrato) {
        throw new BadRequestException(
          'El tipo de contrato seleccionado no existe en el catálogo',
        );
      }
      idTipoContrato = tipoContrato.id_tipo_contrato;
    }

    const estadoActiva =
      await this.prisma.estados_publicacion_servicios.findFirst({
        where: { nombre: ESTADO_PUBLICACION_DEFAULT },
      });
    if (!estadoActiva) {
      throw new BadRequestException(
        `No se encontró el estado de publicación "${ESTADO_PUBLICACION_DEFAULT}"`,
      );
    }

    const ofertaLaboral = await this.prisma.$transaction(async (tx) => {
      const servicio = await tx.servicios.create({
        data: {
          id_usuario_empresa: idUsuarioEmpresa,
          id_area: area.id_area,
          tipo_servicio: 'oferta_laboral',
          titulo: dto.titulo,
          descripcion: dto.descripcion || null,
          id_estado_publicacion: estadoActiva.id_estado_publicacion,
        },
      });

      const oferta = await tx.ofertas_laborales.create({
        data: {
          id_servicio: servicio.id_servicio,
          id_tipo_contrato: idTipoContrato,
          modalidad: dto.modalidad,
          salario: dto.salario ?? null,
          fecha_limite: new Date(dto.fecha_limite),
          vacantes: dto.vacantes,
        },
      });

      if (habilidades.length) {
        await tx.ofertas_habilidades.createMany({
          data: habilidades.map((h) => ({
            id_servicio: servicio.id_servicio,
            id_habilidad: h.id_habilidad,
          })),
        });
      }

      return { servicio, oferta };
    });

    return {
      id_servicio: ofertaLaboral.servicio.id_servicio,
      titulo: ofertaLaboral.servicio.titulo,
      descripcion: ofertaLaboral.servicio.descripcion,
      area: area.nombre,
      habilidades: habilidades.map((h) => h.nombre),
      tipo_contrato: dto.tipo_contrato ?? null,
      modalidad: ofertaLaboral.oferta.modalidad,
      salario: ofertaLaboral.oferta.salario
        ? Number(ofertaLaboral.oferta.salario)
        : null,
      vacantes: ofertaLaboral.oferta.vacantes,
      fecha_limite: ofertaLaboral.oferta.fecha_limite,
      fecha_publicacion: ofertaLaboral.servicio.fecha_publicacion,
      estado_publicacion: estadoActiva.nombre,
    };
  }

  /** GET /empresas/ofertas-laborales: oportunidades publicadas por la empresa autenticada, con su conteo de postulaciones. */
  async listarPropias(
    idUsuarioEmpresa: number,
  ): Promise<OportunidadEmpresaResponseDto[]> {
    const servicios = await this.prisma.servicios.findMany({
      where: { id_usuario_empresa: idUsuarioEmpresa },
      include: {
        estados_publicacion_servicios: true,
        ofertas_laborales: true,
      },
      orderBy: { fecha_publicacion: 'desc' },
    });

    const idsServicio = servicios.map((s) => s.id_servicio);
    const [conteos, pendientes] = idsServicio.length
      ? await Promise.all([
          this.prisma.postulaciones_laborales.groupBy({
            by: ['id_servicio'],
            where: { id_servicio: { in: idsServicio } },
            _count: { id_servicio: true },
          }),
          this.prisma.postulaciones_laborales.groupBy({
            by: ['id_servicio'],
            where: {
              id_servicio: { in: idsServicio },
              estados_postulaciones: { nombre: 'pendiente' },
            },
            _count: { id_servicio: true },
          }),
        ])
      : [[], []];

    const conteoPorServicio = new Map(
      conteos.map((c) => [c.id_servicio, c._count.id_servicio]),
    );
    const pendientesPorServicio = new Map(
      pendientes.map((c) => [c.id_servicio, c._count.id_servicio]),
    );

    return servicios.map((servicio) => ({
      id_servicio: servicio.id_servicio,
      titulo: servicio.titulo,
      tipo_servicio: servicio.tipo_servicio,
      estado_publicacion: servicio.estados_publicacion_servicios.nombre,
      modalidad: servicio.ofertas_laborales?.modalidad ?? null,
      fecha_publicacion: servicio.fecha_publicacion,
      postulaciones_count: conteoPorServicio.get(servicio.id_servicio) ?? 0,
      nuevas_postulaciones_count:
        pendientesPorServicio.get(servicio.id_servicio) ?? 0,
    }));
  }
}
