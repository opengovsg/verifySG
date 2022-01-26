import { MigrationInterface, QueryRunner } from 'typeorm'

export class deletedatnullable1643183183184 implements MigrationInterface {
  name = 'deletedatnullable1643183183184'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "officer" DROP COLUMN "position"`)
    await queryRunner.query(
      `ALTER TABLE "officer" ADD "position" character varying(255) NOT NULL`,
    )
    await queryRunner.query(`ALTER TABLE "officer" DROP COLUMN "agency"`)
    await queryRunner.query(
      `ALTER TABLE "officer" ADD "agency" character varying(255) NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "officer" ALTER COLUMN "deleted_at" DROP NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "officer" ALTER COLUMN "deleted_at" DROP DEFAULT`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "officer" ALTER COLUMN "deleted_at" SET DEFAULT now()`,
    )
    await queryRunner.query(
      `ALTER TABLE "officer" ALTER COLUMN "deleted_at" SET NOT NULL`,
    )
    await queryRunner.query(`ALTER TABLE "officer" DROP COLUMN "agency"`)
    await queryRunner.query(`ALTER TABLE "officer" ADD "agency" text NOT NULL`)
    await queryRunner.query(`ALTER TABLE "officer" DROP COLUMN "position"`)
    await queryRunner.query(
      `ALTER TABLE "officer" ADD "position" character varying NOT NULL`,
    )
  }
}
