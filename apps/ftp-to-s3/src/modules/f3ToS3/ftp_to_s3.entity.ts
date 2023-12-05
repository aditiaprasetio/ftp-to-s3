import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
} from 'sequelize-typescript';

@Table({
  tableName: 'f3_to_s3',
  timestamps: false,
})
export class FTPTOS3Model extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING(16) })
  custid: string;
}
