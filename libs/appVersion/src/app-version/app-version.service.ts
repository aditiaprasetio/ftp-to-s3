import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AppVersionModel } from './app-version.entity';
import { v4 as uuidv4 } from 'uuid';
import * as compareVersions from 'compare-versions';
import { generateResultPagination } from 'libs/utils/generateResultPagination';

export type AppVersionProperties = {
  readonly appVersionId: string;
  readonly androidVersion: string;
  readonly iosVersion: string;
  readonly forceUpdate: boolean;
  readonly adminMetadata: any;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

@Injectable()
export class AppVersionService {
  constructor(
    @InjectModel(AppVersionModel)
    private readonly appVersionRepositories: typeof AppVersionModel
  ) { }

  async findAll(params: {
    offset?: number,
    limit?: number
  }): Promise<{
    count: number;
    prev: string;
    next: string;
    results: AppVersionProperties[]
  }> {
    const count = await this.appVersionRepositories.count();
    const results = await this.appVersionRepositories.findAll({
      limit: params.limit || 1000000000,
      offset: params.offset || 0,
      order: [['createdAt', 'desc']],
    });

    return {
      ...generateResultPagination(count, params),
      results: results.map(row => row.get()),
    };
  }

  async findOne(params: {
    appVersionId: string
  }): Promise<AppVersionProperties> {
    const result = await this.appVersionRepositories.findOne({
      where: {
        appVersionId: params.appVersionId
      }
    });

    return result.get();
  }

  async create(data: {
    androidVersion: string,
    iosVersion: string,
    forceUpdate: boolean,
    adminMetadata: any,
  }): Promise<AppVersionProperties> {
    const result = await this.appVersionRepositories.create({
      ...data, appVersionId: uuidv4()
    });

    return result.get();
  }

  async update(data: {
    appVersionId: string,
    androidVersion: string,
    iosVersion: string,
    forceUpdate: boolean,
    adminMetadata: any,
  }): Promise<AppVersionProperties> {
    await this.appVersionRepositories.update({ ...data }, {
      where: {
        appVersionId: data.appVersionId
      }
    });

    return this.findOne({ appVersionId: data.appVersionId });
  }

  async delete(params: {
    appVersionId: string
  }): Promise<{ isSuccess: boolean }> {
    const result = await this.appVersionRepositories.destroy({
      where: {
        appVersionId: params.appVersionId
      }
    });

    return { isSuccess: result ? true : false };
  }

  async getLatestForceUpdate(): Promise<AppVersionProperties> {
    let result = await this.appVersionRepositories.findAll({
      where: {
        forceUpdate: true
      },
      limit: 1,
      order: [['createdAt', 'DESC']]
    });

    result = result.map(row => row.get())

    return result ? result[0] : null;
  }

  async getLatestVersionApp(): Promise<AppVersionProperties> {
    let result = await this.appVersionRepositories.findAll({
      limit: 1,
      order: [['createdAt', 'DESC']]
    });

    result = result.map(row => row.get())

    return result ? result[0] : null;
  }

  compareVersionApp(
    platform: 'ios' | 'android',
    mobileVersion: string,
    dataVersion: AppVersionProperties,
  ) {

    switch (platform) {
      case 'android':
        return compareVersions(mobileVersion, dataVersion.androidVersion)

      case 'ios':
        return compareVersions(mobileVersion, dataVersion.iosVersion)

      default:
        return 0
    }
  }

  async checkVersionApp(params: { mobileVersion: string, platform: 'ios' | 'android' }): Promise<{
    isMyVersionLatest: boolean;
    androidVersion: string;
    iosVersion: string;
    versionMetadata: {
      currentVersion: string,
      platform: string
    },
    forceUpdate: boolean;
  }> {
    const latestVersion = await this.getLatestVersionApp();
    const latestVersionForceUpdate = await this.getLatestForceUpdate();

    if (!latestVersion) {
      return {
        isMyVersionLatest: false,
        androidVersion: '',
        iosVersion: '',
        versionMetadata: {
          currentVersion: '',
          platform: ''
        },
        forceUpdate: false,
      }
    }

    const latestVersionForceConverted = this.compareVersionApp(params.platform, params.mobileVersion, latestVersionForceUpdate)

    const result = {
      isMyVersionLatest: this.compareVersionApp(params.platform, params.mobileVersion, latestVersion) === 1 || this.compareVersionApp(params.platform, params.mobileVersion, latestVersion) === 0,
      androidVersion: latestVersion.androidVersion,
      iosVersion: latestVersion.iosVersion,
      versionMetadata: {
        currentVersion: params.mobileVersion,
        platform: params.platform
      },
      forceUpdate: latestVersionForceConverted === -1,
    }

    return result
  }
}
