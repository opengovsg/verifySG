import { MigrationInterface, QueryRunner } from 'typeorm'

export class migrateUniqueParam1675125259861 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // drop previously created index
    await queryRunner.query(`DROP INDEX idx_notification_unique_param;`)
    // add uniqueParamString to modality_params
    await queryRunner.query(
      `UPDATE notification SET modality_params = jsonb_set(modality_params, '{uniqueParamString}', to_jsonb(SUBSTRING(modality_params ->> 'message', POSITION('check-sms-' IN modality_params ->> 'message') + 10, 12))) WHERE POSITION('check-sms-' IN modality_params ->> 'message') > 0;`,
    )
    await queryRunner.query(
      `CREATE INDEX idx_notification_unique_param ON notification ((modality_params ->> 'uniqueParamString'))
WHERE
  modality_params ->> 'uniqueParamString' IS NOT NULL;`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_notification_unique_param;`)
    // remove uniqueParamString from modality_params
    await queryRunner.query(
      `UPDATE notification SET modality_params = modality_params #- '{uniqueParamString}' WHERE modality_params ->> 'uniqueParamString' IS NOT NULL;`,
    )
    // recreate previously created index
    await queryRunner.query(
      `CREATE INDEX idx_notification_unique_param ON notification (SUBSTRING(modality_params ->> 'message', POSITION('check-sms-' IN modality_params ->> 'message') + 10, 12))
    WHERE
    	SUBSTRING(modality_params ->> 'message', POSITION('check-sms-' IN modality_params ->> 'message') + 10, 12) IS NOT NULL;`,
    )
  }
}
