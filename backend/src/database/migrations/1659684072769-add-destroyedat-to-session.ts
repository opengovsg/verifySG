import { MigrationInterface, QueryRunner } from 'typeorm'

export class addDestroyedatToSession1659684072769
  implements MigrationInterface
{
  name = 'addDestroyedatToSession1659684072769'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "session" ADD "destroyed_at" TIMESTAMP`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "destroyed_at"`)
  }
}
