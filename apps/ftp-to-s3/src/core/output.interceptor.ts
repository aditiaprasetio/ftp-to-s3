import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";

export class OutputInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const payload = await next.handle().toPromise();
    return {
      code: 'success',
      message: '',
      payload
    }
  }
}

