import { MigrationInterface, QueryRunner } from 'typeorm'

export class setupEntities1642992515643 implements MigrationInterface {
  name = 'setupEntities1642992515643'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "call" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expired_at" TIMESTAMP, "officer_id" integer, "mop_id" integer, CONSTRAINT "PK_2098af0169792a34f9cfdd39c47" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "officer" ADD "email" character varying(255) NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "officer" ADD CONSTRAINT "UQ_775b4f1f79cf3492b3ac6d024aa" UNIQUE ("email")`,
    )
    await queryRunner.query(`ALTER TABLE "officer" ADD "agency" text NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "call" ADD CONSTRAINT "FK_88a9024682d864fba2c1fcc0d55" FOREIGN KEY ("officer_id") REFERENCES "mop"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "call" ADD CONSTRAINT "FK_be26f16e1b6b283161a201176ec" FOREIGN KEY ("mop_id") REFERENCES "officer"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "call" DROP CONSTRAINT "FK_be26f16e1b6b283161a201176ec"`,
    )
    await queryRunner.query(
      `ALTER TABLE "call" DROP CONSTRAINT "FK_88a9024682d864fba2c1fcc0d55"`,
    )
    await queryRunner.query(`ALTER TABLE "officer" DROP COLUMN "agency"`)
    await queryRunner.query(
      `ALTER TABLE "officer" DROP CONSTRAINT "UQ_775b4f1f79cf3492b3ac6d024aa"`,
    )
    await queryRunner.query(`ALTER TABLE "officer" DROP COLUMN "email"`)
    await queryRunner.query(`DROP TABLE "call"`)
  }
}
