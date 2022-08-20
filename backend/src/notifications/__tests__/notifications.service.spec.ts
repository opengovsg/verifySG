import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { AgenciesService } from '../../agencies/agencies.service'
import { CoreModule } from '../../core/core.module'
import { Logger } from '../../core/providers'
import {
  Agency,
  MessageTemplate,
  Notification,
  Officer,
} from '../../database/entities'
import { useTestDatabase } from '../../database/test-hooks'
import { MessageTemplatesService } from '../../message-templates/message-templates.service'
import { OfficersService } from '../../officers/officers.service'
import { NotificationsService } from '../notifications.service'
import { SGNotifyService } from '../sgnotify/sgnotify.service'

describe('NotificationsService', () => {
  let service: NotificationsService
  let repository: Repository<Notification>
  let messageTemplatesService: MessageTemplatesService
  let messageTemplatesRepository: Repository<MessageTemplate>
  let officersService: OfficersService
  let officersRepository: Repository<Officer>
  let sgNotifyService: SGNotifyService
  let logger: Logger
  let resetDatabase: () => Promise<void>
  let closeDatabase: () => Promise<void>

  beforeAll(async () => {
    const [opts, resetHook, closeHook] = await useTestDatabase()
    resetDatabase = resetHook
    closeDatabase = closeHook
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CoreModule,
        TypeOrmModule.forRootAsync(opts),
        TypeOrmModule.forFeature([
          Notification,
          MessageTemplate,
          Officer,
          Agency,
        ]),
      ],
      providers: [
        NotificationsService,
        MessageTemplatesService,
        OfficersService,
        SGNotifyService,
        AgenciesService,
      ],
    }).compile()

    service = module.get<NotificationsService>(NotificationsService)
    repository = module.get(getRepositoryToken(Notification))
    messageTemplatesService = module.get<MessageTemplatesService>(
      MessageTemplatesService,
    )
    messageTemplatesRepository = module.get(getRepositoryToken(MessageTemplate))
    officersService = module.get<OfficersService>(OfficersService)
    officersRepository = module.get(getRepositoryToken(Officer))
    sgNotifyService = module.get<SGNotifyService>(SGNotifyService)
    logger = module.get<Logger>(Logger)
  })
  afterAll(async () => {
    await closeDatabase()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(repository).toBeDefined()
    expect(messageTemplatesService).toBeDefined()
    expect(messageTemplatesRepository).toBeDefined()
    expect(officersService).toBeDefined()
    expect(officersRepository).toBeDefined()
    expect(sgNotifyService).toBeDefined()
    expect(logger).toBeDefined()
  })
})
