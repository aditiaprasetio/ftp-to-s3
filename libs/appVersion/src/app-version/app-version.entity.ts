
import { Table, Model, PrimaryKey, Column, UpdatedAt, CreatedAt, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'app_versions',
  timestamps: true
})
export class AppVersionModel extends Model {
  @PrimaryKey
  @Column
  appVersionId: string;

  @Column
  androidVersion: string;

  @Column
  iosVersion: string;

  @Column
  forceUpdate: boolean;

  @Column({
    type: DataType.JSONB
  })
  adminMetadata: any;

  @UpdatedAt
  updatedAt: Date;

  @CreatedAt
  createdAt: Date;
}