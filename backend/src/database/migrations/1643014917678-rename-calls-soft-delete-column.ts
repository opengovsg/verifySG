import { MigrationInterface, QueryRunner } from 'typeorm'

export class renameCallsSoftDeleteColumn1643014917678
  implements MigrationInterface
{
  name = 'renameCallsSoftDeleteColumn1643014917678'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "call" RENAME COLUMN "expired_at" TO "deleted_at"`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "call" RENAME COLUMN "deleted_at" TO "expired_at"`,
    )
  }
}
