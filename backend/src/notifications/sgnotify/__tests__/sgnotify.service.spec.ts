import { InternalServerErrorException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { rest } from 'msw'

import { CoreModule } from '../../../core/core.module'
import { Logger } from '../../../core/providers'
import { mockValidSGNotifyParams } from '../../__tests__/notifications.service.spec'
import { PUBLIC_KEY_ENDPOINT } from '../../constants'
import { AuthResPayload, NotificationResPayload } from '../dto'
import { sgNotifyMockApi } from '../mock-server/handlers'
import { server } from '../mock-server/server'
import { SGNotifyService } from '../sgnotify.service'

const mockAuthResPayload: AuthResPayload = {
  access_token: 'accessToken',
  aud: 'aud',
  exp: 1,
  token_type: 'tokenType',
  scope: 'scope',
}

const mockNotificationResPayload: NotificationResPayload = {
  aud: 'aud',
  exp: 1,
  request_id: 'requestId',
}

describe('SGNotifyService initialize', () => {
  let service: SGNotifyService
  let logger: Logger

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule],
      providers: [SGNotifyService],
    }).compile()

    service = module.get<SGNotifyService>(SGNotifyService)
    // configService = module.get<ConfigService>(ConfigService)
    logger = module.get<Logger>(Logger)

    server.listen()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(logger).toBeDefined()
  })

  beforeEach(() => server.resetHandlers())

  afterAll(() => server.close())

  it('should initialize', async () => {
    await service.initialize()
    expect(service['client']).toBeDefined()
    expect(service['SGNotifyPublicKeySig']).toBeDefined()
    expect(service['SGNotifyPublicKeyEnc']).toBeDefined()
  })
  it('should log error and throw exception if public key endpoint is down', async () => {
    jest.spyOn(logger, 'error')
    server.use(
      rest.get(sgNotifyMockApi(PUBLIC_KEY_ENDPOINT), async (_, res, ctx) => {
        return res(ctx.status(500), ctx.json({}))
      }),
    )
    await expect(service.initialize()).rejects.toEqual(
      new InternalServerErrorException(
        'Error when getting public key from SGNotify discovery endpoint.',
      ),
    )
    expect(logger.error).toHaveBeenCalled()
  })
  it('should log error and throw exception if key not found in public key endpoint', async () => {
    jest.spyOn(logger, 'error')
    server.use(
      rest.get(sgNotifyMockApi(PUBLIC_KEY_ENDPOINT), async (_, res, ctx) => {
        return res(
          ctx.json({
            keys: [],
          }),
        )
      }),
    )
    await expect(service.initialize()).rejects.toEqual(
      new InternalServerErrorException(
        'Either signature or encryption key not found in SGNotify discovery endpoint',
      ),
    )
    expect(logger.error).toHaveBeenCalled()
  })
  it('should log error and throw exception if something goes wrong while importing public keys', async () => {
    jest.spyOn(logger, 'error')
    server.use(
      rest.get(sgNotifyMockApi(PUBLIC_KEY_ENDPOINT), async (_req, res, ctx) => {
        return res(
          // purposely omitted required fields to cause error
          ctx.json({
            keys: [
              {
                kty: 'EC',
                use: 'sig',
                crv: 'P-256',
                kid: 'ntf-stg-01',
                x: '',
                y: '',
              },
              {
                kty: 'EC',
                use: 'enc',
                crv: 'P-256',
                kid: 'ntf-stg-01',
                x: '',
                y: '',
                alg: 'ECDH-ES+A256KW',
              },
            ],
          }),
        )
      }),
    )
    await expect(service.initialize()).rejects.toEqual(
      new InternalServerErrorException(
        'Error when importing public key from SGNotify discovery endpoint',
      ),
    )
    expect(logger.error).toHaveBeenCalled()
  })
})

// splitting this out to isolate side effects from previous test suite
describe('SGNotifyService sendNotification', () => {
  let service: SGNotifyService
  let logger: Logger

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule],
      providers: [SGNotifyService],
    }).compile()

    service = module.get<SGNotifyService>(SGNotifyService)
    logger = module.get<Logger>(Logger)

    server.listen()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(logger).toBeDefined()
  })

  beforeEach(async () => {
    server.resetHandlers()
    await service.initialize()
  })

  afterAll(() => server.close())

  test('send notification happy path', async () => {
    // await service.initialize()
    const mockDecryptAndVerify = jest
      .spyOn(service, 'decryptAndVerifyPayload')
      .mockResolvedValueOnce(mockAuthResPayload) // returned at the end of authz request
      .mockResolvedValueOnce(mockNotificationResPayload) // returned at the end of notification request
    await service.sendNotification(mockValidSGNotifyParams)
    mockDecryptAndVerify.mockRestore()
  })
})
