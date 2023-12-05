import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { generateResultPagination } from 'libs/utils/generateResultPagination';
import { Op } from 'sequelize';
import { AppConfigModel, AppConfigProperties } from './appConfig.entity';

@Injectable()
export class AppConfigService {
  constructor(
    @InjectModel(AppConfigModel)
    private readonly configRepositories: typeof AppConfigModel,
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
    results: AppConfigProperties[];
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
        col: 'configId',
      };

      const count = await this.configRepositories.count(options); //ngitung total data
      const results = await this.configRepositories.findAll({
        ...options,
        limit: params.limit,
        offset: params.offset,
        order: [['createdAt', 'DESC']],
      });

      if (params.keys && params.keys.length > 0) {
        // get unavailable configs
        const unavailableConfigs = params.keys.filter(
          key => !results.find(result => result.key === key),
        );
        if (unavailableConfigs && unavailableConfigs.length > 0) {
          const bulkData = unavailableConfigs.map(key => ({
            configId: key,
            key,
            value: '',
          }));

          await this.configRepositories.bulkCreate(bulkData);

          return this.findAll(params);
        }
      }

      return {
        ...generateResultPagination(count, params),
        results: results.map(row => row.get()),
      };
    } catch (error) {
      Logger.error(
        'findAll appConfig::: error: ' + JSON.stringify(error),
        'appConfig.service',
        'appConfig.service',
      );
      return Promise.reject(error);
    }
  }

  async findByKey(key: string): Promise<AppConfigProperties> {
    try {
      const result = await this.configRepositories.findOne({
        where: {
          key,
        },
      });

      if (result) {
        return result.get();
      } else {
        const createResult = await this.configRepositories.create({
          configId: key,
          key,
          value: '',
        });

        return createResult.get();
      }
    } catch (err) {
      Logger.error('findByKey Config::: error: ' + JSON.stringify(err));
      return Promise.reject(err);
    }
  }

  async update(params: AppConfigProperties): Promise<AppConfigProperties> {
    try {
      await this.findByKey(params.key);

      await this.configRepositories.update(
        { value: params.value },
        {
          where: {
            key: params.key,
          },
        },
      );

      return this.findByKey(params.key);
    } catch (err) {
      Logger.error('Update Config::: error: ' + JSON.stringify(err));
    }
  }

  async bulkUpdate(
    datas: AppConfigProperties[],
  ): Promise<AppConfigProperties[]> {
    try {
      const keys = datas.map(data => data.key);
      await this.findAll({ keys });

      for (const data of datas) {
        await this.configRepositories.update(
          { value: data.value },
          {
            where: {
              key: data.key,
            },
          },
        );
      }

      const res = await this.findAll({ keys });

      return res.results;
    } catch (err) {
      Logger.error('bulkUpdate Config::: error: ' + JSON.stringify(err));
    }
  }

  async updateByObject(
    objectData: any,
  ): Promise<any> {
    try {
      const keys = Object.keys(objectData);
      await this.findAll({ keys });

      for (const key of keys) {
        await this.configRepositories.update(
          { value: objectData[key] },
          {
            where: {
              key,
            },
          },
        );
      }

      const res = await this.findAll({ keys });

      const resObject = {};
      for (const result of res.results) {
        resObject[result.key] = result.value;
      }

      return resObject;
    } catch (err) {
      Logger.error('updateByObject Config::: error: ' + JSON.stringify(err));
    }
  }
}
