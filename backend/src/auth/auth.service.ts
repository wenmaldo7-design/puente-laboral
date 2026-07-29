import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { RegisterBeneficiarioDto } from './dto/create-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

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
   * Usado por LocalStrategy. Devuelve el USUARIO+BENEFICIARIO de Prisma
   * si las credenciales son correctas; lanza 401 en cualquier otro caso.
   */
  async validateBeneficiario(email: string, password: string) {
    const usuario =
      await this.usersService.findUsuarioConBeneficiarioByEmail(email);

    // Si no existe el usuario O existe pero no tiene fila en BENEFICIARIOS
    // (es decir, es de otro rol), rechazamos por igual sin distinguir
    // el motivo exacto en el mensaje (evita user enumeration).
    if (!usuario || !usuario.beneficiarios) {
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

    return usuario;
  }

  /**
   * Firma el JWT y lo setea como cookie httpOnly + signed.
   * El frontend Angular nunca ve ni manipula el token.
   */
  issueTokenCookie(usuario: { id_usuario: number; email: string }, res: Response) {
    const payload: JwtPayload = {
      sub: usuario.id_usuario,
      email: usuario.email,
      rol: 'beneficiario',
    };

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
}
