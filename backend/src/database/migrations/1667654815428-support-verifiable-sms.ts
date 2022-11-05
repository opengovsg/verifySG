import { MigrationInterface, QueryRunner } from 'typeorm'

const saveResultsMessageTemplate = async (
  queryRunner: QueryRunner,
  results: any[],
) => {
  return await queryRunner.query(
    `INSERT INTO "message_template" (id, key, menu, params, created_at, updated_at, agency_id, type)
     VALUES ${results
       .map((result, idx): string => {
         return `(${result.id}, '123', '123', $${
           idx + 1
         }, NOW(), NOW(), '123', 'SGNOTIFY')`
       })
       .join(',')} ON CONFLICT (id) DO
     UPDATE
     SET params = EXCLUDED.params`,
    results.map((result) => JSON.stringify(result.params)),
  )
}

export class supportVerifiableSms1667654815428 implements MigrationInterface {
  name = 'supportVerifiableSms1667654815428'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "unique_param" ("id" SERIAL NOT NULL, "unique_param_string" character varying(255) NOT NULL, "display_data" jsonb NOT NULL, "num_of_queries" smallint NOT NULL DEFAULT '0', "expired_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_8138e2ae69ad5d3b055182e4072" UNIQUE ("unique_param_string"), CONSTRAINT "PK_c077207ad22f0e071b60194d55d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN "notification_type"`,
    )
    await queryRunner.query(
      `DROP TYPE "public"."notification_notification_type_enum"`,
    )
    await queryRunner.query(
      `ALTER TABLE "message_template" RENAME COLUMN "sg_notify_message_template_params" TO "params"`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."message_template_type_enum" AS ENUM('SGNOTIFY', 'SMS')`,
    )
    await queryRunner.query(
      `ALTER TABLE "message_template" ADD "type" "public"."message_template_type_enum" NOT NULL DEFAULT 'SGNOTIFY'`,
    )
    await queryRunner.query(
      `ALTER TABLE "message_template" ALTER COLUMN "type" DROP DEFAULT`,
    )
    const results: any[] = await queryRunner.query(
      `SELECT * FROM "message_template" FOR UPDATE`,
    )
    results.forEach((result) => {
      result.params = { ...result.params, type: 'SGNOTIFY' }
    })
    await saveResultsMessageTemplate(queryRunner, results)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const results: any[] = await queryRunner.query(
      `SELECT * FROM "message_template" FOR UPDATE`,
    )
    results.forEach((result) => delete result.params.type)
    await saveResultsMessageTemplate(queryRunner, results)
    await queryRunner.query(`ALTER TABLE "message_template" DROP COLUMN "type"`)
    await queryRunner.query(`DROP TYPE "public"."message_template_type_enum"`)
    await queryRunner.query(
      `ALTER TABLE "message_template" RENAME COLUMN "params" TO "sg_notify_message_template_params"`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."notification_notification_type_enum" AS ENUM('SGNOTIFY', 'WHATSAPP')`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "notification_type" "public"."notification_notification_type_enum" NOT NULL DEFAULT 'SGNOTIFY'`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "notification_type" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP TABLE "unique_param"`)
  }
}
