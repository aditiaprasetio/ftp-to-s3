import { Controller, Get, Query, Post, Req, Patch, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { AppVersionContract, FindAllRequest, FindAllResponse, FindOneRequest, FindOneResponse, CreateRequest, CreateResponse, UpdateResponse, UpdateRequest, DeleteResponse, CheckVersionRequest, CheckVersionResponse } from './app-version.contract';
import { AppVersionService } from './app-version.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../core/auth.guard';

@ApiTags('App Version')
@Controller('app-version')
export class AppVersionController implements AppVersionContract {
  constructor(private appVersionService: AppVersionService) {}

  @Get()
  async findAll(@Query() query: FindAllRequest): Promise<FindAllResponse> {
    return this.appVersionService.findAll(query);
  }

  @Get(':appVersionId')
  async findOne(@Param() params: FindOneRequest): Promise<FindOneResponse> {
    return this.appVersionService.findOne(params);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('')
  async create(@Body() data: CreateRequest): Promise<CreateResponse> {
    return this.appVersionService.create({
      ...data,
      adminMetadata: {},
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Patch(':appVersionId')
  async update(
    @Param('appVersionId') appVersionId: string,
    @Body() data: UpdateRequest,
  ): Promise<UpdateResponse> {
    return this.appVersionService.update({
      ...data,
      appVersionId,
      adminMetadata: {},
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete(':appVersionId')
  async delete(
    @Param('appVersionId') appVersionId: string,
  ): Promise<DeleteResponse> {
    return this.appVersionService.delete({ appVersionId });
  }

  @Get('me/version')
  async checkMyVersion(
    @Query() query: { mobileVersion: string; platform: 'ios' | 'android' },
  ): Promise<{
    isMyVersionLatest: boolean;
    androidVersion: string;
    iosVersion: string;
    forceUpdate: boolean;
    versionMetadata: {
      currentVersion: string;
      platform: string;
    };
  }> {
    return this.appVersionService.checkVersionApp({
      mobileVersion: query.mobileVersion,
      platform: query.platform,
    });
  }

  @Post('check')
  async checkVersion(
    @Body() dto: CheckVersionRequest,
  ): Promise<CheckVersionResponse> {
    return this.appVersionService.checkVersionApp({
      mobileVersion: dto.mobileVersion,
      platform: dto.platform,
    });
  }

  @Get('app/current-version')
  async getCurrentVersion(): Promise<FindOneResponse> {
    const androidVersion = this.appVersionService.getLatestVersionApp();

    return androidVersion;
  }
}
