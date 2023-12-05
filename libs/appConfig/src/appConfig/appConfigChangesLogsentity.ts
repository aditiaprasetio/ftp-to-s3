import { ApiProperty } from '@nestjs/swagger';
import { Column, Model, PrimaryKey, Table, Unique, CreatedAt, UpdatedAt, DataType } from "sequelize-typescript";
import { AppConfigModel } from './appConfig.entity';

export class AppConfigChangesLogsProperties {
  @ApiProperty()
  historyId: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  newData: Partial<AppConfigModel>;

  @ApiProperty()
  createdByUserId: string;

  @ApiProperty()
  metaCreatedByUser: any;
}

@Table({
  tableName: 'app_configs_changes_logs',
  timestamps: true,
})
export class AppConfigChangesLogsModel extends Model {
  @PrimaryKey
  @Column
  historyId: string;

  @Unique
  @Column
  key: string;

  @Column({ type: DataType.JSONB })
  newData: Partial<AppConfigModel>;

  @Column
  createdByUserId: string;

  @Column({ type: DataType.JSONB })
  metaCreatedByUser: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
