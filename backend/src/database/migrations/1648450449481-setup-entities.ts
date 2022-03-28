import { MigrationInterface, QueryRunner } from 'typeorm'

export class setupEntities1648450449481 implements MigrationInterface {
  name = 'setupEntities1648450449481'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."sgnotify_status_enum" AS ENUM('NOT_SENT', 'SENT_BY_SERVER', 'RECEIVED_BY_DEVICE', 'READ_BY_USER')`,
    )
    await queryRunner.query(
      `CREATE TABLE "sgnotify" ("id" SERIAL NOT NULL, "agency_logo_url" character varying(255) NOT NULL, "sender_name" character varying(255) NOT NULL, "title" character varying(50) NOT NULL, "uin" character varying(9) NOT NULL, "short_message" character varying(100) NOT NULL, "template_id" character varying(50) NOT NULL, "sg_notify_long_message_params" json NOT NULL, "status" "public"."sgnotify_status_enum" NOT NULL DEFAULT 'NOT_SENT', "request_id" character varying(50) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_d2517932c0ce32e1d57043d77d7" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."notification_notification_type_enum" AS ENUM('SGNOTIFY', 'WHATSAPP')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."notification_status_enum" AS ENUM('NOT_SENT', 'SENT')`,
    )
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" SERIAL NOT NULL, "notification_type" "public"."notification_notification_type_enum" NOT NULL, "recipient_id" character varying(9) NOT NULL, "status" "public"."notification_status_enum" NOT NULL DEFAULT 'NOT_SENT', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "call_id" integer, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    )
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
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_1c5aec18db1054aab2701614528" FOREIGN KEY ("call_id") REFERENCES "call"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
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
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_1c5aec18db1054aab2701614528"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bdf5fdcd0b49753475efec8397"`,
    )
    await queryRunner.query(`DROP TABLE "session"`)
    await queryRunner.query(`DROP TABLE "agency"`)
    await queryRunner.query(`DROP TABLE "officer"`)
    await queryRunner.query(`DROP TABLE "call"`)
    await queryRunner.query(`DROP TABLE "notification"`)
    await queryRunner.query(`DROP TYPE "public"."notification_status_enum"`)
    await queryRunner.query(
      `DROP TYPE "public"."notification_notification_type_enum"`,
    )
    await queryRunner.query(`DROP TABLE "sgnotify"`)
    await queryRunner.query(`DROP TYPE "public"."sgnotify_status_enum"`)
  }
}
