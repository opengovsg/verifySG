import { MigrationInterface, QueryRunner } from 'typeorm'

export class modifyOfficerColumns1643086700864 implements MigrationInterface {
  name = 'modifyOfficerColumns1643086700864'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "officer" ADD "position" character varying NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "officer" DROP CONSTRAINT "UQ_2a3e90115735f43948be2482eaf"`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "officer" ADD CONSTRAINT "UQ_2a3e90115735f43948be2482eaf" UNIQUE ("name")`,
    )
    await queryRunner.query(`ALTER TABLE "officer" DROP COLUMN "position"`)
  }
}
