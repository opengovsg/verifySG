import { MigrationInterface, QueryRunner } from 'typeorm'

export class dropCallscopeColumn1658904021597 implements MigrationInterface {
  name = 'dropCallscopeColumn1658904021597'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN "call_scope"`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification" ADD "call_scope" text`)
  }
}
