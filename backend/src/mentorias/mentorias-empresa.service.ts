import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateMentoriaDto } from './dto/create-mentoria.dto';

@Injectable()
export class MentoriasEmpresaService {
  constructor(private prisma: PrismaService) {}

  async crearMentoria(id_usuario_empresa: number, dto: CreateMentoriaDto) {
    const area = await this.prisma.areas_interes.findFirst({
      where: { nombre: { equals: dto.area, mode: 'insensitive' } },
    });
    if (!area) {
      throw new BadRequestException(`El área '${dto.area}' no existe`);
    }

    let provinciaId: number | null = null;
    if (dto.modalidad === 'presencial' || dto.modalidad === 'hibrida') {
      if (!dto.provincia) {
        throw new BadRequestException('La provincia es obligatoria para modalidad presencial o híbrida');
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
          tipo_servicio: 'mentoria',
          titulo: dto.titulo,
          descripcion: dto.descripcion,
          id_estado_publicacion: estadoPublicado.id_estado_publicacion,
          id_provincia: provinciaId,
        },
      });

      const mentoria = await tx.mentorias.create({
        data: {
          id_servicio: servicio.id_servicio,
          fecha: new Date(dto.fecha),
          hora_inicio: new Date(`1970-01-01T${dto.hora_inicio}:00Z`),
          modalidad: dto.modalidad,
          link_o_canal: dto.link_o_canal,
          requisitos: dto.requisitos,
          duracion_minutos: dto.duracion_minutos,
        },
      });

      return { servicio, mentoria };
    });
  }
}
