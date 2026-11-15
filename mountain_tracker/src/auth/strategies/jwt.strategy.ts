import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../entities/user.entity.js';

// (#20)
export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

// (#20)
export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: UserRole;
}

// (#21)
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // (#21)
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'secretKey'),
    });
  }

  // (#21)
  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}