import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { UsuarioConRoles } from '../users/interfaces/user.interface';
import { RegisterBeneficiarioDto } from './dto/create-user.dto';
import { JwtPayload, RolUsuario } from './interfaces/jwt-payload.interface';

const COOKIE_NAME = 'access_token';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterBeneficiarioDto) {
    return this.usersService.createBeneficiario(dto);
  }

  /**
   * Usado por LocalStrategy. Vale para cualquier rol (beneficiario, empresa
   * o administrador): busca el USUARIO por email con sus 3 relaciones de
   * rol, valida credenciales, y resuelve el rol real según cuál de esas
   * relaciones esté poblada. Devuelve directamente el JwtPayload a firmar.
   */
  async validateUsuario(
    email: string,
    password: string,
    rolEsperado?: RolUsuario,
  ): Promise<JwtPayload> {
    const usuario = await this.usersService.findUsuarioParaLogin(email);

    // Si no existe el usuario, rechazamos con el mismo mensaje que una
    // contraseña incorrecta (evita user enumeration).
    if (!usuario) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    const passwordMatches = await bcrypt.compare(
      password,
      usuario.password_hash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const rol = this.resolverRol(usuario);

    // El usuario intentó loguearse desde la pestaña de otro rol (ej.
    // credenciales de beneficiario en la pestaña "Empresa"): se rechaza
    // con el mismo mensaje genérico, sin revelar cuál es el rol real.
    if (rolEsperado && rol !== rolEsperado) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    // Defensa en profundidad: hoy toda empresa se crea ya habilitada (ver
    // EmpresasHabilitacionService.aprobarSolicitud), pero si en el futuro
    // se implementa dar de baja una empresa (EMPRESAS.fecha_baja), esto
    // bloquea el login sin depender de que ese flujo se acuerde de chequearlo.
    if (rol === 'empresa' && !usuario.empresas?.habilitada_operativamente) {
      throw new UnauthorizedException(
        'Tu empresa no se encuentra habilitada operativamente',
      );
    }

    return {
      sub: usuario.id_usuario,
      email: usuario.email,
      rol,
    };
  }

  /**
   * Firma el JWT y lo setea como cookie httpOnly + signed.
   * El frontend Angular nunca ve ni manipula el token.
   */
  issueTokenCookie(payload: JwtPayload, res: Response) {
    const token = this.jwtService.sign(payload);
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      signed: true,
      secure: isProd, // en dev sin https, dejar en false
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60, // 1 hora, alineado con JWT_EXPIRES_IN
      path: '/',
    });
  }

  clearTokenCookie(res: Response) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
  }

  /**
   * Cada USUARIO tiene a lo sumo una de las 3 relaciones poblada.
   * Administrador queda soportado con el mismo criterio que Empresa,
   * aunque hoy no exista ningún flujo que cree ese rol.
   */
  private resolverRol(usuario: UsuarioConRoles): RolUsuario {
    if (usuario.administradores) {
      return 'administrador';
    }
    if (usuario.empresas) {
      return 'empresa';
    }
    if (usuario.beneficiarios) {
      return 'beneficiario';
    }
    throw new UnauthorizedException('El usuario no tiene un rol asignado');
  }
}
