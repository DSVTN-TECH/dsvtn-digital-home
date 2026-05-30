import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { CurrentUser } from './decorators/current-user.decorator'
import {
  clearAuthCookies,
  getCookieFromRequest,
  newCsrfToken,
  REFRESH_COOKIE,
  setAuthCookies,
} from './auth.cookies'
import { AuthService } from './auth.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

interface AuthenticatedUser {
  id: string
  fullName: string
  email: string
  role: 'ADMIN' | 'MEMBER' | 'LOGISTIC'
  mustChangePassword: boolean
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto)
    setAuthCookies(response, result.accessToken, result.refreshToken, newCsrfToken())
    return { user: result.user }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Return current authenticated user' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return { user }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current password and refresh auth cookies' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.changePassword(user.id, dto)
    setAuthCookies(response, result.accessToken, result.refreshToken, newCsrfToken())
    return { user: result.user }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh auth cookies' })
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = getCookieFromRequest(request, REFRESH_COOKIE)
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token')
    }
    const payload = await this.authService.verifyRefreshToken(refreshToken)
    const result = await this.authService.buildAccessTokenForUser(payload.sub)
    setAuthCookies(response, result.accessToken, result.refreshToken, newCsrfToken())
    return { user: result.user }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear auth cookies' })
  logout(@Res({ passthrough: true }) response: Response) {
    clearAuthCookies(response)
    return { success: true }
  }
}
