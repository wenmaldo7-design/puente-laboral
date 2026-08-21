import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CrearOfertaLaboralDto } from './dto/crear-oferta-laboral.dto';
import { ActualizarOfertaLaboralDto } from './dto/actualizar-oferta-laboral.dto';
import { CandidatoEmpresaResponseDto } from './dto/candidato-empresa-response.dto';
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

  async actualizar(
    idUsuarioEmpresa: number,
    idServicio: number,
    dto: ActualizarOfertaLaboralDto,
  ): Promise<OfertaLaboralResponseDto> {
    const servicio = await this.prisma.servicios.findUnique({
      where: { id_servicio: idServicio },
      include: {
        ofertas_laborales: true,
      },
    });

    if (!servicio) {
      throw new NotFoundException('Oferta laboral no encontrada');
    }

    if (servicio.id_usuario_empresa !== idUsuarioEmpresa) {
      throw new ForbiddenException('No tienes permisos para modificar esta oferta');
    }

    const updatedServicio = await this.prisma.servicios.update({
      where: { id_servicio: idServicio },
      data: {
        titulo: dto.titulo ?? undefined,
        descripcion: dto.descripcion ?? undefined,
      },
      include: {
        ofertas_laborales: {
          include: {
            ofertas_habilidades: {
              include: { habilidades: true }
            }
          }
        },
        areas_interes: true,
        estados_publicacion_servicios: true,
      }
    });

    return {
      id_servicio: updatedServicio.id_servicio,
      titulo: updatedServicio.titulo,
      descripcion: updatedServicio.descripcion,
      area: updatedServicio.areas_interes.nombre,
      habilidades: updatedServicio.ofertas_laborales?.ofertas_habilidades.map(oh => oh.habilidades.nombre) ?? [],
      tipo_contrato: null,
      modalidad: updatedServicio.ofertas_laborales?.modalidad ?? '',
      salario: updatedServicio.ofertas_laborales?.salario ? Number(updatedServicio.ofertas_laborales.salario) : null,
      vacantes: updatedServicio.ofertas_laborales?.vacantes ?? null,
      fecha_limite: updatedServicio.ofertas_laborales?.fecha_limite ?? new Date(),
      fecha_publicacion: updatedServicio.fecha_publicacion,
      estado_publicacion: updatedServicio.estados_publicacion_servicios.nombre,
    };
  }

  async eliminar(idUsuarioEmpresa: number, idServicio: number): Promise<void> {
    const servicio = await this.prisma.servicios.findUnique({
      where: { id_servicio: idServicio },
    });

    if (!servicio) {
      throw new NotFoundException('Oferta laboral no encontrada');
    }

    if (servicio.id_usuario_empresa !== idUsuarioEmpresa) {
      throw new ForbiddenException('No tienes permisos para eliminar esta oferta');
    }

    const estadoCerrada = await this.prisma.estados_publicacion_servicios.findFirst({
      where: { nombre: 'cerrada' },
    });

    if (!estadoCerrada) {
      throw new BadRequestException('Estado de publicación "cerrada" no encontrado');
    }

    await this.prisma.servicios.update({
      where: { id_servicio: idServicio },
      data: { id_estado_publicacion: estadoCerrada.id_estado_publicacion },
    });
  }

  async obtenerCandidatos(
    idUsuarioEmpresa: number,
    idServicio: number,
  ): Promise<CandidatoEmpresaResponseDto[]> {
    const servicio = await this.prisma.servicios.findUnique({
      where: { id_servicio: idServicio },
    });

    if (!servicio) {
      throw new NotFoundException('Oferta laboral no encontrada');
    }

    if (servicio.id_usuario_empresa !== idUsuarioEmpresa) {
      throw new ForbiddenException('No tienes permisos para ver estos candidatos');
    }

    const postulaciones = await this.prisma.postulaciones_laborales.findMany({
      where: { id_servicio: idServicio },
      include: {
        beneficiarios: {
          include: {
            usuarios: true,
          },
        },
        estados_postulaciones: true,
      },
    });

    return postulaciones.map((p) => ({
      id_postulacion: p.id_postulacion,
      id_usuario_beneficiario: p.id_usuario_beneficiario,
      nombre: p.beneficiarios.nombre,
      apellido: p.beneficiarios.apellido,
      email: p.beneficiarios.usuarios.email,
      fecha_postulacion: p.fecha_postulacion,
      estado_postulacion: p.estados_postulaciones.nombre,
      cv_url: p.cv_url ?? p.beneficiarios.cv_url,
      carta_presentacion: p.carta_presentacion ?? undefined,
    }));
  }
}
