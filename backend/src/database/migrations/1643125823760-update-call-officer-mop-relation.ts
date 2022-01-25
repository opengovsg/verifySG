import { MigrationInterface, QueryRunner } from 'typeorm'

export class updateCallOfficerMopRelation1643125823760
  implements MigrationInterface
{
  name = 'updateCallOfficerMopRelation1643125823760'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "call" DROP CONSTRAINT "FK_88a9024682d864fba2c1fcc0d55"`,
    )
    await queryRunner.query(
      `ALTER TABLE "call" DROP CONSTRAINT "FK_be26f16e1b6b283161a201176ec"`,
    )
    await queryRunner.query(
      `ALTER TABLE "call" ADD CONSTRAINT "FK_88a9024682d864fba2c1fcc0d55" FOREIGN KEY ("officer_id") REFERENCES "officer"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "call" ADD CONSTRAINT "FK_be26f16e1b6b283161a201176ec" FOREIGN KEY ("mop_id") REFERENCES "mop"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "call" DROP CONSTRAINT "FK_be26f16e1b6b283161a201176ec"`,
    )
    await queryRunner.query(
      `ALTER TABLE "call" DROP CONSTRAINT "FK_88a9024682d864fba2c1fcc0d55"`,
    )
    await queryRunner.query(
      `ALTER TABLE "call" ADD CONSTRAINT "FK_be26f16e1b6b283161a201176ec" FOREIGN KEY ("mop_id") REFERENCES "officer"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "call" ADD CONSTRAINT "FK_88a9024682d864fba2c1fcc0d55" FOREIGN KEY ("officer_id") REFERENCES "mop"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
  }
}
