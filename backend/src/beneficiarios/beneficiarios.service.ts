import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ActualizarBeneficiarioDto } from './dto/actualizar-beneficiario.dto';
import { BeneficiarioPerfilResponseDto } from './dto/beneficiario-perfil-response.dto';

const INCLUDE_PERFIL = {
  usuarios: true,
  ciudades: { include: { provincias: true } },
  beneficiarios_habilidades: { include: { habilidades: true } },
  beneficiarios_areas: { include: { areas_interes: true } },
} satisfies Prisma.beneficiariosInclude;

type BeneficiarioConPerfil = Prisma.beneficiariosGetPayload<{
  include: typeof INCLUDE_PERFIL;
}>;

@Injectable()
export class BeneficiariosService {
  constructor(private readonly prisma: PrismaService) {}

  /** Perfil propio del beneficiario autenticado (GET /beneficiarios/me). */
  async obtenerPerfilPropio(
    idUsuario: number,
  ): Promise<BeneficiarioPerfilResponseDto> {
    const beneficiario = await this.prisma.beneficiarios.findUnique({
      where: { id_usuario: idUsuario },
      include: INCLUDE_PERFIL,
    });
    if (!beneficiario) {
      throw new NotFoundException('Beneficiario no encontrado');
    }

    return this.aResponseDto(beneficiario);
  }

  /**
   * PATCH /beneficiarios/me. linkedin/github son UNIQUE en BENEFICIARIOS:
   * se chequea contra otro usuario (no el propio) antes de escribir, igual
   * que hace UsersService.createBeneficiario en el registro.
   */
  async actualizarDatos(
    idUsuario: number,
    dto: ActualizarBeneficiarioDto,
  ): Promise<BeneficiarioPerfilResponseDto> {
    if (dto.linkedin) {
      const existente = await this.prisma.beneficiarios.findUnique({
        where: { linkedin: dto.linkedin },
      });
      if (existente && existente.id_usuario !== idUsuario) {
        throw new ConflictException(
          'Ese LinkedIn ya está registrado por otro usuario',
        );
      }
    }
    if (dto.github) {
      const existente = await this.prisma.beneficiarios.findUnique({
        where: { github: dto.github },
      });
      if (existente && existente.id_usuario !== idUsuario) {
        throw new ConflictException(
          'Ese GitHub ya está registrado por otro usuario',
        );
      }
    }

    await this.prisma.beneficiarios.update({
      where: { id_usuario: idUsuario },
      data: {
        ...(dto.fecha_nacimiento !== undefined && {
          fecha_nacimiento: dto.fecha_nacimiento ? new Date(dto.fecha_nacimiento) : null,
        }),
        ...(dto.telefono !== undefined && { telefono: dto.telefono || null }),
        ...(dto.direccion !== undefined && { direccion: dto.direccion || null }),
        ...(dto.linkedin !== undefined && { linkedin: dto.linkedin || null }),
        ...(dto.github !== undefined && { github: dto.github || null }),
        ...(dto.cv_url !== undefined && { cv_url: dto.cv_url || null }),
      },
    });

    return this.obtenerPerfilPropio(idUsuario);
  }

  /** PUT /beneficiarios/me/habilidades: reemplaza el set completo (sin nivel: la UI no lo pide todavía). */
  async actualizarHabilidades(
    idUsuario: number,
    nombres: string[],
  ): Promise<BeneficiarioPerfilResponseDto> {
    const unicos = [...new Set(nombres)];
    const habilidades = await this.prisma.habilidades.findMany({
      where: { nombre: { in: unicos } },
    });
    if (habilidades.length !== unicos.length) {
      throw new BadRequestException(
        'Alguna habilidad no existe en el catálogo',
      );
    }

    await this.prisma.$transaction([
      this.prisma.beneficiarios_habilidades.deleteMany({
        where: { id_usuario_beneficiario: idUsuario },
      }),
      this.prisma.beneficiarios_habilidades.createMany({
        data: habilidades.map((h) => ({
          id_usuario_beneficiario: idUsuario,
          id_habilidad: h.id_habilidad,
        })),
      }),
    ]);

    return this.obtenerPerfilPropio(idUsuario);
  }

  /** PUT /beneficiarios/me/areas-interes: reemplaza el set completo. */
  async actualizarAreasInteres(
    idUsuario: number,
    nombres: string[],
  ): Promise<BeneficiarioPerfilResponseDto> {
    const unicos = [...new Set(nombres)];
    const areas = await this.prisma.areas_interes.findMany({
      where: { nombre: { in: unicos } },
    });
    if (areas.length !== unicos.length) {
      throw new BadRequestException(
        'Alguna área de interés no existe en el catálogo',
      );
    }

    await this.prisma.$transaction([
      this.prisma.beneficiarios_areas.deleteMany({
        where: { id_usuario_beneficiario: idUsuario },
      }),
      this.prisma.beneficiarios_areas.createMany({
        data: areas.map((a) => ({
          id_usuario_beneficiario: idUsuario,
          id_area: a.id_area,
        })),
      }),
    ]);

    return this.obtenerPerfilPropio(idUsuario);
  }

  private aResponseDto(
    beneficiario: BeneficiarioConPerfil,
  ): BeneficiarioPerfilResponseDto {
    return {
      id_usuario: beneficiario.id_usuario,
      email: beneficiario.usuarios.email,
      nombre: beneficiario.nombre,
      apellido: beneficiario.apellido,
      dni: beneficiario.dni,
      fecha_nacimiento: beneficiario.fecha_nacimiento,
      telefono: beneficiario.telefono,
      direccion: beneficiario.direccion,
      ciudad: beneficiario.ciudades
        ? {
            id_ciudad: beneficiario.ciudades.id_ciudad,
            nombre: beneficiario.ciudades.nombre,
            provincia: beneficiario.ciudades.provincias.nombre,
          }
        : null,
      linkedin: beneficiario.linkedin,
      github: beneficiario.github,
      cv_url: beneficiario.cv_url,
      habilidades: beneficiario.beneficiarios_habilidades.map(
        (bh) => bh.habilidades.nombre,
      ),
      areas_interes: beneficiario.beneficiarios_areas.map(
        (ba) => ba.areas_interes.nombre,
      ),
    };
  }
}
