import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { USERS_REPOSITORY } from '../../../common/repository'
import { Inject } from '@nestjs/common'
import { UsersRepository } from '../../users/users.repository'
import { ACCESS_COOKIE, getCookieFromRequest } from '../auth.cookies'

interface JwtPayload {
  sub: string
  email: string
  role: 'ADMIN' | 'MEMBER' | 'LOGISTIC'
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
  ) {
    const secret = config.get<string>('JWT_SECRET')
    if (!secret) {
      throw new Error('JWT_SECRET is not configured')
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => getCookieFromRequest(request, ACCESS_COOKIE) ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
  }

  async validate(payload: JwtPayload) {
    const user = await this.users.findById(payload.sub)

    if (!user || user.status === 'DISABLED') {
      throw new UnauthorizedException('Unauthorized')
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      mustChangePassword: user.mustChangePassword,
    }
  }
}
