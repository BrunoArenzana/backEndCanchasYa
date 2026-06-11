import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
  const rolesRequeridos = this.reflector.get<string[]>('roles', context.getHandler())
    console.log('Roles requeridos:', rolesRequeridos)
  console.log('User:', context.switchToHttp().getRequest().user)
  if (!rolesRequeridos) return true

  const { user } = context.switchToHttp().getRequest()
  
  if (!user) return false

  return rolesRequeridos.includes(user.tipo)
}

} 