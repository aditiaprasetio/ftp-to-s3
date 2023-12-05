import { IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export abstract class AppVersionContract {
  abstract findAll(params: FindAllRequest): Promise<FindAllResponse>
  abstract findOne(params: FindOneRequest): Promise<FindOneResponse>
  abstract create(params: CreateRequest, req: { user: { userId: string } }): Promise<CreateResponse>
  abstract update(appVersionId: string, params: UpdateRequest, req: { user: { userId: string } }): Promise<UpdateResponse>
  abstract delete(appVersionId: string): Promise<DeleteResponse>
}

export class FindAllRequest {
  @ApiPropertyOptional()
  offset: number;
  
  @ApiPropertyOptional()
  limit: number;
}

export class FindAllResponse {
  readonly count: number;
  readonly prev: string;
  readonly next: string;
  readonly results: FindOneResponse[];
}

export class FindOneRequest {
  readonly appVersionId: string;
}

export class FindOneResponse {
  readonly appVersionId: string;
  readonly androidVersion: string;
  readonly iosVersion: string;
  readonly forceUpdate: boolean;
  readonly adminMetadata: any;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class CreateRequest {
  @IsNotEmpty()
  @ApiProperty()
  readonly androidVersion: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly iosVersion: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  readonly forceUpdate: boolean;
}

export class CheckVersionRequest {
  @ApiProperty()
  mobileVersion: string;

  @ApiProperty()
  platform: 'ios' | 'android';
}

export class CreateResponse extends FindOneResponse { }

export class UpdateRequest extends FindOneResponse { }

export class UpdateResponse extends FindOneResponse { }

export class DeleteResponse {
  readonly isSuccess: boolean;
}

export class CheckVersionResponse {
  isMyVersionLatest: boolean;
  androidVersion: string;
  iosVersion: string;
  forceUpdate: boolean;
  versionMetadata: {
    currentVersion: string;
    platform: string;
  };
}