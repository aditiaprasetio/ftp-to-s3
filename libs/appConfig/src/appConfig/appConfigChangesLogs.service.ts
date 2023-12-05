import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { generateResultPagination } from 'libs/utils/generateResultPagination';
import { Op } from 'sequelize';
import {
  AppConfigChangesLogsModel,
  AppConfigChangesLogsProperties,
} from './appConfigChangesLogsentity';

@Injectable()
export class AppConfigChangesLogsService {
  constructor(
    @InjectModel(AppConfigChangesLogsModel)
    private readonly configChangeLogRepositories: typeof AppConfigChangesLogsModel,
  ) {}

  async findAll(params: {
    offset?: number;
    limit?: number;
    search?: string;
    keys?: string[];
  }): Promise<{
    count: number;
    prev: string;
    next: string;
    results: AppConfigChangesLogsProperties[];
  }> {
    try {
      let where = {};
      params.search &&
        (where = {
          ...where,
          key: {
            [Op.iLike]: `%${params.search}%`,
          },
        });
      if (params.keys && params.keys.length > 0) {
        where = {
          ...where,
          key: {
            [Op.in]: params.keys,
          },
        };
      }
      const options: any = {
        where,
        distinct: true,
        col: 'historyId',
      };

      const count = await this.configChangeLogRepositories.count(options);
      const results = await this.configChangeLogRepositories.findAll({
        ...options,
        limit: params.limit,
        offset: params.offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        ...generateResultPagination(count, params),
        results: results.map(row => row.get()),
      };
    } catch (error) {
      Logger.error(
        'findAll appConfigChangesLogs::: error: ' + JSON.stringify(error),
        'appConfigChangesLogs.service',
        'appConfigChangesLogs.service',
      );
      return Promise.reject(error);
    }
  }

  async create(
    params: Omit<AppConfigChangesLogsProperties, 'createdAt' | 'updatedAt'>,
  ): Promise<AppConfigChangesLogsProperties[]> {
    try {
      const result = await this.configChangeLogRepositories.create({
        historyId: uuidv4(),
        key: params.key,
        newData: params.newData,
        createdByUserId: params.createdByUserId,
        metaCreatedByUser: params.metaCreatedByUser,
      });

      return result.get();
    } catch (error) {
      Logger.error(
        'update appConfigChangesLogs::: error: ' + JSON.stringify(error),
        'appConfigChangesLogs.service',
        'appConfigChangesLogs.service',
      );
      return Promise.reject(error);
    }
  }

  async bulkCreate(
    params: Array<Partial<AppConfigChangesLogsProperties>>,
  ): Promise<AppConfigChangesLogsProperties[]> {
    try {
      const appConfigChangesLogs = params.map(data => ({
        ...data,
        historyId: uuidv4(),
      }));

      const result = await this.configChangeLogRepositories.bulkCreate(
        appConfigChangesLogs,
      );

      return result.map(row => row.get());
    } catch (error) {
      Logger.error(
        'bulkUpdate appConfigChangesLogs::: error: ' + JSON.stringify(error),
        'appConfigChangesLogs.service',
        'appConfigChangesLogs.service',
      );
      return Promise.reject(error);
    }
  }
}
