import { MigrationInterface, QueryRunner } from 'typeorm'

export class createIndexNotificationUniqueParam1675084851043
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX idx_notification_unique_param ON notification (SUBSTRING(modality_params ->> 'message', POSITION('check-sms-' IN modality_params ->> 'message') + 10, 12))
WHERE
	SUBSTRING(modality_params ->> 'message', POSITION('check-sms-' IN modality_params ->> 'message') + 10, 12) IS NOT NULL;`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_notification_unique_param;`)
  }
}
