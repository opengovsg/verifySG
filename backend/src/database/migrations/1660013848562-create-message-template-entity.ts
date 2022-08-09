import { MigrationInterface, QueryRunner } from 'typeorm'

export class createMessageTemplateEntity1660013848562
  implements MigrationInterface
{
  name = 'createMessageTemplateEntity1660013848562'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "message_template" ("id" SERIAL NOT NULL, "key" character varying(255) NOT NULL, "menu" character varying(255) NOT NULL, "sg_notify_message_template_params" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "agency_id" character varying(255), CONSTRAINT "UQ_1c63989d5ad4ce9c53912a79bda" UNIQUE ("key"), CONSTRAINT "CHK_533dd49f5419dc0c425784a6ef" CHECK (key = lower(key)), CONSTRAINT "PK_616800da109c721fb4dd2019a9b" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "message_template_id" integer`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_a8a1a906cbaa98d8358f42be0e8" FOREIGN KEY ("message_template_id") REFERENCES "message_template"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "message_template" ADD CONSTRAINT "FK_b1907dd70d26278e5118c18243c" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "message_template" DROP CONSTRAINT "FK_b1907dd70d26278e5118c18243c"`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_a8a1a906cbaa98d8358f42be0e8"`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN "message_template_id"`,
    )
    await queryRunner.query(`DROP TABLE "message_template"`)
  }
}
