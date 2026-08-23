import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

import { CreateCursoBackendDto } from './dto/create-curso.dto';

@Injectable()
export class CursosEmpresaService {
  constructor(private prisma: PrismaService) {}

  async crearCurso(id_usuario_empresa: number, dto: CreateCursoBackendDto) {
    const area = await this.prisma.areas_interes.findUnique({
      where: { id_area: dto.id_area },
    });
    if (!area) {
      throw new BadRequestException(`El area seleccionada no existe`);
    }

    let provinciaId: number | null = null;
    if (dto.modalidad === 'presencial') {
      if (!dto.provincia) {
        throw new BadRequestException('La provincia es obligatoria para modalidad presencial');
      }
      const prov = await this.prisma.provincias.findFirst({
        where: { nombre: { equals: dto.provincia, mode: 'insensitive' } },
      });
      if (!prov) {
        throw new BadRequestException(`La provincia '${dto.provincia}' no existe`);
      }
      provinciaId = prov.id_provincia;
    }

    const estadoPublicado = await this.prisma.estados_publicacion_servicios.findFirst({
      where: { nombre: { equals: 'activa', mode: 'insensitive' } },
    });

    if (!estadoPublicado) {
      throw new Error("Estado 'activa' no encontrado");
    }

    return this.prisma.$transaction(async (tx) => {
      const servicio = await tx.servicios.create({
        data: {
          id_usuario_empresa,
          id_area: area.id_area,
          tipo_servicio: 'curso',
          titulo: dto.titulo,
          descripcion: dto.descripcion,
          id_estado_publicacion: estadoPublicado.id_estado_publicacion,
          id_provincia: provinciaId,
        },
      });

      const curso = await tx.cursos.create({
        data: {
          id_servicio: servicio.id_servicio,
          fecha_inicio: new Date(dto.fecha),
          cupos: dto.cupos_totales,
          modalidad: dto.modalidad,
          otorga_certificado: false,
        },
      });

      return { servicio, curso };
    });
  }
}
