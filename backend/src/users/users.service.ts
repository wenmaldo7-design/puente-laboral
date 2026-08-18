import { Injectable, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { RegisterBeneficiarioDto } from '../auth/dto/create-user.dto';
import { BeneficiarioSafe, UsuarioConRoles } from './interfaces/user.interface';

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
    const [emailExists, dniExists, githubExists, linkedinExists] =
      await Promise.all([
        this.prisma.usuarios.findUnique({ where: { email: dto.email } }),
        this.prisma.beneficiarios.findUnique({ where: { dni: dto.dni } }),
        dto.github
          ? this.prisma.beneficiarios.findUnique({
              where: { github: dto.github },
            })
          : null,
        dto.linkedin
          ? this.prisma.beneficiarios.findUnique({
              where: { linkedin: dto.linkedin },
            })
          : null,
      ]);

    if (emailExists) {
      throw new ConflictException('El email ya se encuentra registrado');
    }
    if (dniExists) {
      throw new ConflictException('El DNI ya se encuentra registrado');
    }
    if (githubExists) {
      throw new ConflictException('El GitHub ya se encuentra registrado');
    }
    if (linkedinExists) {
      throw new ConflictException('El LinkedIn ya se encuentra registrado');
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
          cv_url: dto.cv_url,
        },
        include: { usuarios: true },
      });
    });

    return this.toSafeBeneficiario(beneficiario);
  }

  /**
   * Usado por AuthService.validateUsuario (vía LocalStrategy): trae el
   * USUARIO por email con sus 3 relaciones de rol incluidas, sin asumir
   * de antemano cuál de ellas va a estar poblada.
   *
   * Case-insensitive + trim: el email se guarda normalizado (ver
   * register-beneficiario.mapper.ts) pero el login no fuerza esa misma
   * normalización en el input, así que una mayúscula o un espacio de más
   * al tipear no puede tirar abajo un login que debería funcionar.
   */
  async findUsuarioParaLogin(email: string): Promise<UsuarioConRoles | null> {
    return this.prisma.usuarios.findFirst({
      where: { email: { equals: email.trim(), mode: 'insensitive' } },
      include: { beneficiarios: true, empresas: true, administradores: true },
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
