/* eslint-disable @typescript-eslint/camelcase */
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export type AppRequest = {
  user: { userType: 'admin' | 'customer' | string; userId: string, sessionId: string; name: string };
};

export class BaseResponse {
  @ApiProperty()
  code: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  payload: any;
}

export class DefaultFindAllRequest {
  @ApiPropertyOptional()
  search?: string;

  @ApiPropertyOptional()
  limit?: number;

  @ApiPropertyOptional()
  offset?: number;
}

export class PaginationResponse {
  @ApiProperty()
  count: number;
  
  @ApiProperty()
  prev: string | null;

  @ApiProperty()
  next: string | null;

  @ApiProperty({example: []})
  results: any[];
}

export class SimpleResponse {
  @ApiProperty()
  isSuccess: boolean;
}

export class SimpleResponseBase extends BaseResponse {
  @ApiProperty()
  payload: SimpleResponse;
}

export type TBodyRedirect = { success?: string; failed?: string } 
export type TQueryRedirect = { redirect_success?: string; redirect_failed?: string }; 

export const exampleRedirect = {
  success: 'https://app.example/forgot-password?success=true',
  failed: 'https://app.example/forgot-password?success=true',
};