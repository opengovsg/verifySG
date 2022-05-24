import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddOTPEntity1653395651156 implements MigrationInterface {
  name = 'AddOTPEntity1653395651156'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "otp" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "hash" character varying(255) NOT NULL, "num_of_attempts" smallint NOT NULL DEFAULT '0', "expired_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "otp"`)
  }
}
