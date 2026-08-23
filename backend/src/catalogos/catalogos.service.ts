import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  AreaInteresResponseDto,
  CatalogoItemResponseDto,
} from './dto/catalogo-item-response.dto';

/**
 * Catálogos de referencia (HABILIDADES, AREAS_INTERES): solo tienen nombre,
 * sin agrupación por categoría — esa columna no existe en el schema hoy.
 */
@Injectable()
export class CatalogosService {
  constructor(private readonly prisma: PrismaService) {}

  async listarHabilidades(): Promise<CatalogoItemResponseDto[]> {
    const habilidades = await this.prisma.habilidades.findMany({
      orderBy: { nombre: 'asc' },
    });
    return habilidades.map((h) => ({ nombre: h.nombre }));
  }

  async listarAreasInteres(): Promise<AreaInteresResponseDto[]> {
    const areas = await this.prisma.areas_interes.findMany({
      orderBy: { nombre: 'asc' },
    });
    return areas.map((a) => ({ id_area: a.id_area, nombre: a.nombre }));
  }

  async listarTiposContrato(): Promise<CatalogoItemResponseDto[]> {
    const tipos = await this.prisma.tipos_contrato.findMany({
      orderBy: { nombre: 'asc' },
    });
    return tipos.map((t) => ({ nombre: t.nombre }));
  }

  async listarProvincias(): Promise<CatalogoItemResponseDto[]> {
    const provincias = await this.prisma.provincias.findMany({
      orderBy: { nombre: 'asc' },
    });
    return provincias.map((p) => ({ nombre: p.nombre }));
  }
}
