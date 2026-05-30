import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { USERS_REPOSITORY } from '../../common/repository'
import { UsersRepository } from '../users/users.repository'
import { LoginDto } from './dto/login.dto'

const DUMMY_HASH = '$2b$12$CwTycUXWue0Thq9StjUM0uJ8.Vgtc.b0p2g.7GJp2bH3iWqCq2v.W'

export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: 'ADMIN' | 'MEMBER' | 'LOGISTIC'
  mustChangePassword: boolean
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.users.findByEmail(dto.email)

    const passwordOk = await bcrypt.compare(dto.password, user?.passwordHash ?? DUMMY_HASH)
    if (!user || !passwordOk) {
      throw new UnauthorizedException('Invalid credentials')
    }
    if (user.status === 'DISABLED') {
      throw new UnauthorizedException('Account disabled')
    }

    const userPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(userPayload, { expiresIn: '15m' }),
      this.jwt.signAsync({ ...userPayload, typ: 'refresh' }, { expiresIn: '7d' }),
    ])

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    }
  }

  async buildAccessTokenForUser(userId: string): Promise<LoginResult> {
    const user = await this.users.findById(userId)
    if (!user || user.status === 'DISABLED') {
      throw new UnauthorizedException('Unauthorized')
    }

    const userPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(userPayload, { expiresIn: '15m' }),
      this.jwt.signAsync({ ...userPayload, typ: 'refresh' }, { expiresIn: '7d' }),
    ])

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    }
  }

  async changePassword(
    userId: string,
    dto: { currentPassword: string; newPassword: string },
  ): Promise<LoginResult> {
    const user = await this.users.findById(userId)
    if (!user || user.status === 'DISABLED') {
      throw new UnauthorizedException('Unauthorized')
    }

    const passwordOk = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid current password')
    }
    const samePassword = await bcrypt.compare(dto.newPassword, user.passwordHash)
    if (samePassword) {
      throw new BadRequestException('New password must be different')
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12)
    await this.users.update(user.id, { passwordHash, mustChangePassword: false })
    return this.buildAccessTokenForUser(user.id)
  }

  async verifyRefreshToken(token: string): Promise<{ sub: string; typ?: string }> {
    const payload = await this.jwt.verifyAsync<{ sub: string; typ?: string }>(token)
    if (payload.typ !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token')
    }
    return payload
  }
}
