import { InternalServerErrorException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { rest } from 'msw'

import { CoreModule } from '../../../core/core.module'
import { ConfigService, Logger } from '../../../core/providers'
import { PUBLIC_KEY_ENDPOINT } from '../../constants'
import { sgNotifyMockApi } from '../mock-server/handlers'
import { server } from '../mock-server/server'
import { SGNotifyService } from '../sgnotify.service'

describe('SGNotifyService', () => {
  let service: SGNotifyService
  let configService: ConfigService
  let logger: Logger

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule],
      providers: [SGNotifyService],
    }).compile()

    service = module.get<SGNotifyService>(SGNotifyService)
    configService = module.get<ConfigService>(ConfigService)
    logger = module.get<Logger>(Logger)

    server.listen()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(configService).toBeDefined()
    expect(logger).toBeDefined()
  })

  beforeEach(() => server.resetHandlers())

  afterAll(() => server.close())

  describe('initialization', () => {
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
        rest.get(sgNotifyMockApi(PUBLIC_KEY_ENDPOINT), async (_, res, ctx) => {
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
  describe('sendNotification', () => {
    // TODO
  })
})
