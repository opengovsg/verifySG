import { MigrationInterface, QueryRunner } from 'typeorm'

export class setupEntities1649659132133 implements MigrationInterface {
  name = 'setupEntities1649659132133'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notification_notification_type_enum" AS ENUM('SGNOTIFY', 'WHATSAPP')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."notification_status_enum" AS ENUM('NOT_SENT', 'SENT')`,
    )
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" SERIAL NOT NULL, "notification_type" "public"."notification_notification_type_enum" NOT NULL, "recipient_id" character varying(9) NOT NULL, "status" "public"."notification_status_enum" NOT NULL DEFAULT 'NOT_SENT', "call_scope" text, "modality_params" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "officer_id" integer, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_71aad6d587dd9d17dd8b8f28730" FOREIGN KEY ("officer_id") REFERENCES "officer"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
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
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_71aad6d587dd9d17dd8b8f28730"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bdf5fdcd0b49753475efec8397"`,
    )
    await queryRunner.query(`DROP TABLE "session"`)
    await queryRunner.query(`DROP TABLE "agency"`)
    await queryRunner.query(`DROP TABLE "officer"`)
    await queryRunner.query(`DROP TABLE "notification"`)
    await queryRunner.query(`DROP TYPE "public"."notification_status_enum"`)
    await queryRunner.query(
      `DROP TYPE "public"."notification_notification_type_enum"`,
    )
  }
}
