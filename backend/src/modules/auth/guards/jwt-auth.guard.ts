import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'

type GuardUser = {
  mustChangePassword?: boolean
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = GuardUser>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException('Unauthorized')
    }

    const request = context.switchToHttp().getRequest<Request>()
    const path = request.path ?? request.url
    const allowedWhileChangingPassword =
      path.endsWith('/auth/me') || path.endsWith('/auth/change-password')

    if ((user as GuardUser).mustChangePassword && !allowedWhileChangingPassword) {
      throw new ForbiddenException({
        message: 'Password change required',
        code: 'MUST_CHANGE_PASSWORD',
      })
    }

    return user
  }
}
