import { MigrationInterface, QueryRunner } from 'typeorm'

export class Initialize1642756050939 implements MigrationInterface {
  name = 'Initialize1642756050939'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "mop" ("id" SERIAL NOT NULL, "nric" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_47c1412069f4be13737301efc8f" UNIQUE ("nric"), CONSTRAINT "PK_0a7ad56f5ea4116ff9a56173e1d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "officer" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2a3e90115735f43948be2482eaf" UNIQUE ("name"), CONSTRAINT "PK_b9bab694da36794c5065085936c" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "session" ("expired_at" bigint NOT NULL, "id" character varying(255) NOT NULL, "json" text NOT NULL DEFAULT '', CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_bdf5fdcd0b49753475efec8397" ON "session" ("expired_at") `,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bdf5fdcd0b49753475efec8397"`,
    )
    await queryRunner.query(`DROP TABLE "session"`)
    await queryRunner.query(`DROP TABLE "officer"`)
    await queryRunner.query(`DROP TABLE "mop"`)
  }
}
