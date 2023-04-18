import { MigrationInterface, QueryRunner } from 'typeorm'

const modifyMessageTemplatesParamsColumn = async (
  queryRunner: QueryRunner,
  messageTemplates: any[],
) => {
  return await queryRunner.query(
    `INSERT INTO "message_template" (id, key, menu, params, created_at, updated_at, agency_id, type)
VALUES ${messageTemplates
      .map((result, idx): string => {
        // dummy values for all non-params column to satisfy db constraints
        // only params column is modified
        return `(${result.id}, '123', '123', $${
          idx + 1
        }, NOW(), NOW(), '123', 'SGNOTIFY')`
      })
      .join(',')} ON CONFLICT (id) DO UPDATE SET params = EXCLUDED.params`,
    messageTemplates.map((result) => result.params),
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
    // we are adding a new (duplicative) type key into params:
    // 1. so that we have discriminating union when destructuring params
    // 2. because TypeORM cannot look at two columns (MessageTemplate.type and MessageTemplate.params) at the same time
    const prevMessageTemplates: any[] = await queryRunner.query(
      `SELECT * FROM "message_template" FOR UPDATE`,
    )
    if (prevMessageTemplates.length !== 0) {
      const insertedTypeInParams = prevMessageTemplates.map((result) => {
        return {
          ...result,
          params: {
            ...result.params,
            type: 'SGNOTIFY', // using string instead of enum as we want to refer to this statically rather than dynamically
          },
        }
      })
      await modifyMessageTemplatesParamsColumn(
        queryRunner,
        insertedTypeInParams,
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // for down migration, remove type from params
    const prevMessageTemplates: any[] = await queryRunner.query(
      `SELECT * FROM "message_template" FOR UPDATE`,
    )
    if (prevMessageTemplates.length !== 0) {
      const removedTypeFromParams = prevMessageTemplates.map((result) => {
        const { type, ...params } = result.params
        return {
          ...result,
          params,
        }
      })
      await modifyMessageTemplatesParamsColumn(
        queryRunner,
        removedTypeFromParams,
      )
    }

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
