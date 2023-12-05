import { ArgumentsHost, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { Response } from 'express';

export class OutputExceptionFilter implements ExceptionFilter {
  async catch(ex: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    Logger.error(
      'real error - status: ' + JSON.stringify(response.status),
      'OutputExceptionFilter',
    );
    Logger.error(
      'real error - statusCode: ' + JSON.stringify(response.statusCode),
      'OutputExceptionFilter',
    );
    let status = 500;
    let errorResponse = {
      code: 'err_general',
      message: 'Please contact our administrator',
    }
    if(ex instanceof HttpException) {
      status = ex.getStatus();
      errorResponse = ex.getResponse() as {
        code: string;
        message: string;
      }
    }

    Logger.error(
      'status: ' + JSON.stringify(status),
      'OutputExceptionFilter',
    );
    Logger.error(
      'errorResponse: ' + JSON.stringify(errorResponse),
      'OutputExceptionFilter',
    );

    response
      .status(status)
      .json({
        code: errorResponse.code || 'error_general',
        message: errorResponse.message || 'Please contact our administrator',
        payload: {},
      });
  }
}
