import { MigrationInterface, QueryRunner } from 'typeorm'

export class addIsActiveColumn1677050074802 implements MigrationInterface {
  name = 'addIsActiveColumn1677050074802'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "message_template" ADD "is_active" boolean NOT NULL DEFAULT true`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "message_template" DROP COLUMN "is_active"`,
    )
  }
}
