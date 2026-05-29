import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RolesGuard } from './roles.guard'
import { Role } from '../decorators/roles.decorator'

function mockContext(role?: Role): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext
}

describe('RolesGuard', () => {
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>
  let guard: RolesGuard

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() }
    guard = new RolesGuard(reflector as unknown as Reflector)
  })

  it('allows when user role matches required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN'])
    expect(guard.canActivate(mockContext('ADMIN'))).toBe(true)
  })

  it('forbids when user role does not match required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN'])
    expect(() => guard.canActivate(mockContext('MEMBER'))).toThrow(ForbiddenException)
  })

  it('allows when no roles metadata is set', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined as unknown as Role[])
    expect(guard.canActivate(mockContext())).toBe(true)
  })
})
