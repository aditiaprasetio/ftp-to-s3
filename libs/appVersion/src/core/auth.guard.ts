import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  mixin,
} from '@nestjs/common';
import { Request } from 'express';

export const AuthGuard = () => {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    constructor() {
      //
    }

    canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();

      return this.validateRequest(request);
    }

    async validateRequest(req: Request): Promise<boolean> {
      const token = AuthGuardMixin.getToken(req);

      if (token) {
        return true;
      } else {
         throw new HttpException(
           {
             code: 'err_unauthorized',
             message: 'Authorization Failed',
           },
           HttpStatus.FORBIDDEN,
         );
      }
    }

    static getToken(req: Request) {
      const header: any = req.get('Authorization');

      if (header === undefined || !header.toLowerCase().startsWith('bearer ')) {
        return false;
      }
      return header.substr(7);
    }
  }

  return mixin(AuthGuardMixin);
};
