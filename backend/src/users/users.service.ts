import { Injectable, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { RegisterBeneficiarioDto } from '../auth/dto/create-user.dto';
import { BeneficiarioSafe } from './interfaces/user.interface';

const SALT_ROUNDS = 10;

type BeneficiarioConUsuario = Prisma.beneficiariosGetPayload<{
  include: { usuarios: true };
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un USUARIO + BENEFICIARIO en una unica transaccion.
   * Si el email o el DNI ya existen, se corta antes de tocar la DB.
   */
  async createBeneficiario(
    dto: RegisterBeneficiarioDto,
  ): Promise<BeneficiarioSafe> {
    const [emailExists, dniExists] = await Promise.all([
      this.prisma.usuarios.findUnique({ where: { email: dto.email } }),
      this.prisma.beneficiarios.findUnique({ where: { dni: dto.dni } }),
    ]);

    if (emailExists) {
      throw new ConflictException('El email ya se encuentra registrado');
    }
    if (dniExists) {
      throw new ConflictException('El DNI ya se encuentra registrado');
    }

    const password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const beneficiario = await this.prisma.$transaction(async (tx) => {
      const usuario = await tx.usuarios.create({
        data: {
          email: dto.email,
          password_hash,
          activo: true, // beneficiarios no requieren verificacion de email
        },
      });

      return tx.beneficiarios.create({
        data: {
          id_usuario: usuario.id_usuario,
          nombre: dto.nombre,
          apellido: dto.apellido,
          dni: dto.dni,
          fecha_nacimiento: dto.fecha_nacimiento
            ? new Date(dto.fecha_nacimiento)
            : null,
          telefono: dto.telefono,
          direccion: dto.direccion,
          id_ciudad: dto.id_ciudad,
          linkedin: dto.linkedin,
          github: dto.github,
        },
        include: { usuarios: true },
      });
    });

    return this.toSafeBeneficiario(beneficiario);
  }

  /**
   * Usado por LocalStrategy: trae USUARIO + BENEFICIARIO por email.
   * Si el usuario existe pero no tiene fila en BENEFICIARIOS,
   * significa que es de otro rol (empresa/admin) y no debe poder
   * loguearse por este endpoint.
   */
  async findUsuarioConBeneficiarioByEmail(email: string) {
    return this.prisma.usuarios.findUnique({
      where: { email },
      include: { beneficiarios: true },
    });
  }

  async findUsuarioConBeneficiarioById(id_usuario: number) {
    return this.prisma.usuarios.findUnique({
      where: { id_usuario },
      include: { beneficiarios: true },
    });
  }

  toSafeBeneficiario(beneficiario: BeneficiarioConUsuario): BeneficiarioSafe {
    const { usuarios, ...perfil } = beneficiario;
    return {
      id_usuario: usuarios.id_usuario,
      email: usuarios.email,
      activo: usuarios.activo,
      fecha_registro: usuarios.fecha_registro,
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      dni: perfil.dni,
      fecha_nacimiento: perfil.fecha_nacimiento,
      telefono: perfil.telefono,
      direccion: perfil.direccion,
      id_ciudad: perfil.id_ciudad,
      linkedin: perfil.linkedin,
      github: perfil.github,
      cv_url: perfil.cv_url,
    };
  }
}
