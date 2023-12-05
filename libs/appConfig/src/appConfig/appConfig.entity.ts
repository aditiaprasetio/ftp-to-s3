import { ApiProperty } from '@nestjs/swagger';
import { Column, Model, PrimaryKey, Table, Unique, CreatedAt, UpdatedAt, DataType } from "sequelize-typescript";

export class AppConfigProperties {
  @ApiProperty()
  key: string;

  @ApiProperty()
  value: string;
}

@Table({
  tableName: 'app_configs',
  timestamps: true
})

export class AppConfigModel extends Model {
  @PrimaryKey
  @Column
  configId: string;

  @Unique
  @Column
  key: string;

  @Column({ type: DataType.TEXT })
  value: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
