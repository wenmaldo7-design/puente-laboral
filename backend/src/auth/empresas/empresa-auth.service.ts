import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ActualizarEmpresaDto } from './dto/actualizar-empresa.dto';
import { EmpresaPerfilResponseDto } from './dto/empresa-perfil-response.dto';

@Injectable()
export class EmpresaAuthService {
  constructor(private readonly prisma: PrismaService) {}

  /** Perfil propio de la empresa autenticada (GET /auth/empresa/me). */
  async obtenerPerfilPropio(
    idUsuario: number,
  ): Promise<EmpresaPerfilResponseDto> {
    const empresa = await this.prisma.empresas.findUnique({
      where: { id_usuario: idUsuario },
      include: { usuarios: true },
    });
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return {
      id_usuario: empresa.id_usuario,
      email: empresa.usuarios.email,
      razon_social: empresa.razon_social,
      cuit: empresa.cuit,
      descripcion: empresa.descripcion,
      sitio_web: empresa.sitio_web,
      logo_url: empresa.logo_url,
      habilitada_operativamente: empresa.habilitada_operativamente,
      fecha_habilitacion: empresa.fecha_habilitacion,
    };
  }

  /** PATCH /auth/empresa/me. */
  async actualizarPerfilPropio(
    idUsuario: number,
    dto: ActualizarEmpresaDto,
  ): Promise<EmpresaPerfilResponseDto> {
    await this.prisma.empresas.update({
      where: { id_usuario: idUsuario },
      data: {
        ...(dto.descripcion !== undefined && {
          descripcion: dto.descripcion || null,
        }),
        ...(dto.sitio_web !== undefined && {
          sitio_web: dto.sitio_web || null,
        }),
      },
    });

    return this.obtenerPerfilPropio(idUsuario);
  }
}
