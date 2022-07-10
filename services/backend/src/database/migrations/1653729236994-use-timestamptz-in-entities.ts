import { MigrationInterface, QueryRunner } from 'typeorm'

export class useTimestamptzInEntities1653729236994
  implements MigrationInterface
{
  name = 'useTimestamptzInEntities1653729236994'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "agency" ALTER "created_at" TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC', ALTER "created_at" SET DEFAULT now()`,
    )
    await queryRunner.query(
      `ALTER TABLE "agency" ALTER "updated_at" TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC', ALTER "updated_at" SET DEFAULT now()`,
    )
    await queryRunner.query(
      `ALTER TABLE "officer" ALTER "created_at" TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC', ALTER "created_at" SET DEFAULT now()`,
    )
    await queryRunner.query(
      `ALTER TABLE "officer" ALTER "updated_at" TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC', ALTER "updated_at" SET DEFAULT now()`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER "created_at" TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC', ALTER "created_at" SET DEFAULT now()`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER "updated_at" TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC', ALTER "updated_at" SET DEFAULT now()`,
    )
    // be sure to avoid using now() as a default for deleted_at
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER "deleted_at" TYPE timestamptz USING "deleted_at" AT TIME ZONE 'UTC'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "agency" ALTER "created_at" TYPE timestamp without time zone USING "created_at", ALTER "created_at" SET DEFAULT now()`,
    )
    await queryRunner.query(
      `ALTER TABLE "agency" ALTER "updated_at" TYPE timestamp without time zone USING "updated_at", ALTER "updated_at" SET DEFAULT now()`,
    )
    await queryRunner.query(
      `ALTER TABLE "officer" ALTER "created_at" TYPE timestamp without time zone USING "created_at", ALTER "created_at" SET DEFAULT now()`,
    )
    await queryRunner.query(
      `ALTER TABLE "officer" ALTER "updated_at" TYPE timestamp without time zone USING "updated_at", ALTER "updated_at" SET DEFAULT now()`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER "created_at" TYPE timestamp without time zone USING "created_at", ALTER "created_at" SET DEFAULT now()`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER "updated_at" TYPE timestamp without time zone USING "updated_at", ALTER "updated_at" SET DEFAULT now()`,
    )
    // be sure to avoid using now() as a default for deleted_at
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER "deleted_at" TYPE timestamp without time zone USING "deleted_at"`,
    )
  }
}
