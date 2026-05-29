import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
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
}

export interface LoginResult {
  accessToken: string
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

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    }
  }
}
