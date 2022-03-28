import { MigrationInterface, QueryRunner } from 'typeorm'

export class setupEntities1648197891470 implements MigrationInterface {
  name = 'setupEntities1648197891470'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "call" ("id" SERIAL NOT NULL, "call_scope" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "officer_id" integer, CONSTRAINT "PK_2098af0169792a34f9cfdd39c47" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "officer" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "name" character varying(255), "position" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "agency_id" character varying(255), CONSTRAINT "UQ_775b4f1f79cf3492b3ac6d024aa" UNIQUE ("email"), CONSTRAINT "PK_b9bab694da36794c5065085936c" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "agency" ("id" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "logo_url" text, "email_domains" character varying(255) array NOT NULL DEFAULT '{}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ab1244724d1c216e9720635a2e5" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "session" ("expired_at" bigint NOT NULL, "id" character varying(255) NOT NULL, "json" text NOT NULL DEFAULT '', CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_bdf5fdcd0b49753475efec8397" ON "session" ("expired_at") `,
    )
    await queryRunner.query(
      `ALTER TABLE "call" ADD CONSTRAINT "FK_88a9024682d864fba2c1fcc0d55" FOREIGN KEY ("officer_id") REFERENCES "officer"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "officer" ADD CONSTRAINT "FK_310d4dd0f09ed026d82763c40ca" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "officer" DROP CONSTRAINT "FK_310d4dd0f09ed026d82763c40ca"`,
    )
    await queryRunner.query(
      `ALTER TABLE "call" DROP CONSTRAINT "FK_88a9024682d864fba2c1fcc0d55"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bdf5fdcd0b49753475efec8397"`,
    )
    await queryRunner.query(`DROP TABLE "session"`)
    await queryRunner.query(`DROP TABLE "agency"`)
    await queryRunner.query(`DROP TABLE "officer"`)
    await queryRunner.query(`DROP TABLE "call"`)
  }
}
