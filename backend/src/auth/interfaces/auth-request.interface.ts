import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

/**
 * Extiende el Request de Express para tipar req.user tanto cuando
 * lo llena LocalStrategy (objeto Usuario+Beneficiario de Prisma)
 * como cuando lo llena JwtStrategy (JwtPayload).
 */
export interface AuthRequest extends Request {
  user: JwtPayload;
}
