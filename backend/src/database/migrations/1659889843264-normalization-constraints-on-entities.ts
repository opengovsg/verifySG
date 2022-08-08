import { MigrationInterface, QueryRunner } from 'typeorm'

export class normalizationConstraintsOnEntities1659889843264
  implements MigrationInterface
{
  name = 'normalizationConstraintsOnEntities1659889843264'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "CHK_f6eaeb1f965a5ab05459a4b6b3" CHECK (recipient_id = upper(recipient_id))`,
    )
    await queryRunner.query(
      `ALTER TABLE "officer" ADD CONSTRAINT "CHK_b95eb66d816ed408bc98c2e793" CHECK (email = lower(email))`,
    )
    await queryRunner.query(
      `ALTER TABLE "agency" ADD CONSTRAINT "CHK_504397d33f66390e78f8466ae5" CHECK (id = upper(id))`,
    )
    await queryRunner.query(
      `ALTER TABLE "agency" ADD CONSTRAINT "CHK_5e2f897349391c3ac1dfacc963" CHECK (email_domains = lower(email_domains::varchar)::varchar[])`,
    )
    await queryRunner.query(
      `ALTER TABLE "otp" ADD CONSTRAINT "CHK_3352a3d19d1777a29b58ff8f39" CHECK (email = lower(email))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "otp" DROP CONSTRAINT "CHK_3352a3d19d1777a29b58ff8f39"`,
    )
    await queryRunner.query(
      `ALTER TABLE "agency" DROP CONSTRAINT "CHK_5e2f897349391c3ac1dfacc963"`,
    )
    await queryRunner.query(
      `ALTER TABLE "agency" DROP CONSTRAINT "CHK_504397d33f66390e78f8466ae5"`,
    )
    await queryRunner.query(
      `ALTER TABLE "officer" DROP CONSTRAINT "CHK_b95eb66d816ed408bc98c2e793"`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "CHK_f6eaeb1f965a5ab05459a4b6b3"`,
    )
  }
}
