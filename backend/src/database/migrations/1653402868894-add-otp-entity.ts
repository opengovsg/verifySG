import { MigrationInterface, QueryRunner } from 'typeorm'

export class addOtpEntity1653402868894 implements MigrationInterface {
  name = 'addOtpEntity1653402868894'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "otp" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "hash" character varying(255) NOT NULL, "num_of_attempts" smallint NOT NULL DEFAULT '0', "expired_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "otp"`)
  }
}
