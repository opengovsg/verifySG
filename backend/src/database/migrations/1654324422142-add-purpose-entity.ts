import { MigrationInterface, QueryRunner } from 'typeorm'

export class addPurposeEntity1654324422142 implements MigrationInterface {
  name = 'addPurposeEntity1654324422142'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" RENAME COLUMN "call_scope" TO "purpose_purpose_id"`,
    )
    await queryRunner.query(
      `CREATE TABLE "purpose" ("purpose_id" character varying(255) NOT NULL, "menu_description" character varying(255) NOT NULL, "sg_notify_template_params" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "agency_id" character varying(255), CONSTRAINT "PK_9e4a5e409d6c30401f949c3b9f9" PRIMARY KEY ("purpose_id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN "purpose_purpose_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "purpose_purpose_id" character varying(255)`,
    )
    await queryRunner.query(
      `ALTER TABLE "purpose" ADD CONSTRAINT "FK_25d3e911de838bd64cbe30c9644" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_13f4a4cf4e2bb56978f4e60debc" FOREIGN KEY ("purpose_purpose_id") REFERENCES "purpose"("purpose_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_13f4a4cf4e2bb56978f4e60debc"`,
    )
    await queryRunner.query(
      `ALTER TABLE "purpose" DROP CONSTRAINT "FK_25d3e911de838bd64cbe30c9644"`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN "purpose_purpose_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "purpose_purpose_id" text`,
    )
    await queryRunner.query(`DROP TABLE "purpose"`)
    await queryRunner.query(
      `ALTER TABLE "notification" RENAME COLUMN "purpose_purpose_id" TO "call_scope"`,
    )
  }
}
