import { MigrationInterface, QueryRunner } from 'typeorm'

export class supportVerifiableSms1666429629143 implements MigrationInterface {
  name = 'supportVerifiableSms1666429629143'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "unique_param" ("id" SERIAL NOT NULL, "unique_param_string" character varying(255) NOT NULL, "display_data" jsonb NOT NULL, "num_of_queries" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_8138e2ae69ad5d3b055182e4072" UNIQUE ("unique_param_string"), CONSTRAINT "PK_c077207ad22f0e071b60194d55d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "message_template" ADD "sms_message_template_params" jsonb NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TYPE "public"."notification_notification_type_enum" RENAME TO "notification_notification_type_enum_old"`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."notification_notification_type_enum" AS ENUM('SGNOTIFY', 'SMS')`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "notification_type" TYPE "public"."notification_notification_type_enum" USING "notification_type"::"text"::"public"."notification_notification_type_enum"`,
    )
    await queryRunner.query(
      `DROP TYPE "public"."notification_notification_type_enum_old"`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notification_notification_type_enum_old" AS ENUM('SGNOTIFY', 'WHATSAPP')`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "notification_type" TYPE "public"."notification_notification_type_enum_old" USING "notification_type"::"text"::"public"."notification_notification_type_enum_old"`,
    )
    await queryRunner.query(
      `DROP TYPE "public"."notification_notification_type_enum"`,
    )
    await queryRunner.query(
      `ALTER TYPE "public"."notification_notification_type_enum_old" RENAME TO "notification_notification_type_enum"`,
    )
    await queryRunner.query(
      `ALTER TABLE "message_template" DROP COLUMN "sms_message_template_params"`,
    )
    await queryRunner.query(`DROP TABLE "unique_param"`)
  }
}
