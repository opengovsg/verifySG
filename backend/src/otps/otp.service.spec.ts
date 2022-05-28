import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Connection, createConnection, QueryRunner, Repository } from 'typeorm'
import convict from 'convict'
import { join } from 'path'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

import { OTP } from '../database/entities'
import { OtpService, OTPVerificationResult } from './otp.service'
import { ConfigService } from '../core/providers'
import { otpUtils } from './utils'
import { CoreModule } from '../core/core.module'
import { MockType, repositoryMockFactory } from '../types/testing'
import { prepareDbConnections } from './dbConnection'
import { schema } from 'core/config.schema'

const config = convict(schema)

const MILLISECONDS_IN_MINUTE = 60 * 1000

describe('OtpService (mocked db)', () => {
  let otpService: OtpService
  let configService: ConfigService
  let otpRepositoryMock: MockType<Repository<OTP>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: getRepositoryToken(OTP),
          useFactory: repositoryMockFactory,
        },
        {
          provide: ConfigService,
          useValue: {
            get: (_: string) => {
              return {
                expiryPeriod: MILLISECONDS_IN_MINUTE,
                numAllowedAttempts: 3,
                numSaltRounds: 10,
              }
            },
          },
        },
      ],
      imports: [CoreModule],
    }).compile()

    otpService = module.get<OtpService>(OtpService)
    configService = module.get<ConfigService>(ConfigService)
    otpRepositoryMock = module.get(getRepositoryToken(OTP))
  })
  // const getMockValidOtp = async (): Promise<OTP> => {
  //   const { otp, hash } = await generateOtpAndHash(mockConfig.numSaltRounds)
  //
  // }
  const validOtpEntityMock: OTP = {
    createdAt: new Date(Date.now() - 5 * MILLISECONDS_IN_MINUTE),
    email: 'benjamin_tan@spf.gov.sg',
    expiredAt: new Date(Date.now() + 10 * MILLISECONDS_IN_MINUTE),
    hash: '$2b$10$SMxZF/FO1jftpFULJSJfyuIhnZ.0LVAvFbUQqMdYoiLrAKxNQgBFe',
    id: 1,
    numOfAttempts: 0,
    updatedAt: new Date(Date.now() - 5 * MILLISECONDS_IN_MINUTE),
  }
  const validOtpMock = '089282'
  it('should be defined', () => {
    expect(otpService).toBeDefined()
    expect(configService).toBeDefined()
    expect(otpRepositoryMock).toBeDefined()
  })
  it('should verify hash and otp as correct', async () => {
    const verificationBoolean = await otpUtils.verifyOtpWithHashAsync(
      validOtpMock,
      validOtpEntityMock.hash,
    )
    expect(verificationBoolean).toBe(true)
  })
  it('get otp works', async () => {
    otpUtils.generateOtpAndHashAsync = jest.fn().mockReturnValue({
      otp: validOtpMock,
      hash: validOtpEntityMock.hash,
    })
    const { otp, timeLeftMinutes } = await otpService.getOtp(
      'benjamin_tan@spf.gov.sg',
    )
    expect(otp).toBe(validOtpMock)
    expect(timeLeftMinutes).toBe('1')
    expect(otpUtils.generateOtpAndHashAsync).toHaveBeenCalled()
    expect(otpRepositoryMock.create).toHaveBeenCalled()
    expect(otpRepositoryMock.save).toHaveBeenCalled()
  })
  it('verify otp happy path', async () => {
    /*
     * User requests OTP
     * User submits valid OTP
     * User succeeds with OTPVerificationResult.SUCCESS
     * */
    jest
      .spyOn(otpService, 'findOTPByEmail')
      .mockResolvedValue(validOtpEntityMock)
    jest.spyOn(otpService, 'incrementAttemptCount')
    const otpVerificationResult = await otpService.verifyOtp(
      validOtpEntityMock.email,
      validOtpMock,
    )
    expect(otpRepositoryMock.findOne).toHaveBeenCalled()
    expect(otpService.incrementAttemptCount).toHaveBeenCalled()
    expect(otpVerificationResult).toBe(OTPVerificationResult.SUCCESS)
  })
  it('invalid OTP', async () => {
    /*
     * User requests OTP
     * User submits invalid OTP
     * User fails with OTPVerificationResult.INCORRECT_OTP
     * */
    jest
      .spyOn(otpService, 'findOTPByEmail')
      .mockResolvedValue(validOtpEntityMock)
    jest.spyOn(otpService, 'incrementAttemptCount')
    const otpVerificationResult = await otpService.verifyOtp(
      validOtpEntityMock.email,
      '123456',
    )
    expect(otpService.incrementAttemptCount).toHaveBeenCalled()
    expect(otpVerificationResult).toBe(OTPVerificationResult.INCORRECT_OTP)
  })
  it('expired OTP', async () => {
    /*
     * User requests OTP
     * User submits correct but expired OTP (figure out how to mock passage of time)
     * User fails with OTPVerificationResult.EXPIRED_OTP
     * */
    jest.spyOn(otpService, 'findOTPByEmail').mockResolvedValue({
      ...validOtpEntityMock,
      expiredAt: new Date(Date.now() - 10 * MILLISECONDS_IN_MINUTE), // mock expired OTP
    })
    jest.spyOn(otpService, 'incrementAttemptCount')
    const otpVerificationResult = await otpService.verifyOtp(
      validOtpEntityMock.email,
      validOtpMock,
    )
    expect(otpService.incrementAttemptCount).not.toHaveBeenCalled()
    expect(otpVerificationResult).toBe(OTPVerificationResult.EXPIRED_OTP)
  })
  it('max attempts correct OTP', async () => {
    /*
     * User has previously hit max attempts
     * User requests OTP
     * User submits correct OTP before expiry
     * User fails with OTPVerificationResult.MAX_ATTEMPTS_REACHED
     * User submits wrong OTP before expiry
     * User fails with OTPVerificationResult.MAX_ATTEMPTS_REACHED
     * */
    jest.spyOn(otpService, 'findOTPByEmail').mockResolvedValue({
      ...validOtpEntityMock,
      numOfAttempts: 3,
    })
    jest.spyOn(otpService, 'incrementAttemptCount')
    const otpVerificationResult = await otpService.verifyOtp(
      validOtpEntityMock.email,
      validOtpMock,
    )
    expect(otpService.incrementAttemptCount).toHaveBeenCalled()
    expect(otpVerificationResult).toBe(
      OTPVerificationResult.MAX_ATTEMPTS_REACHED,
    )
  })
  it('max attempts incorrect OTP', async () => {
    /*
     * User has previously hit max attempts
     * User requests OTP
     * User submits wrong OTP before expiry
     * User fails with OTPVerificationResult.MAX_ATTEMPTS_REACHED
     * */
    jest.spyOn(otpService, 'findOTPByEmail').mockResolvedValue({
      ...validOtpEntityMock,
      numOfAttempts: 3,
    })
    jest.spyOn(otpService, 'incrementAttemptCount')
    const otpVerificationResult = await otpService.verifyOtp(
      validOtpEntityMock.email,
      '123456',
    )
    expect(otpService.incrementAttemptCount).toHaveBeenCalled()
    expect(otpVerificationResult).toBe(
      OTPVerificationResult.MAX_ATTEMPTS_REACHED,
    )
  })
})

// modelled after https://dev.to/walrusai/testing-database-interactions-with-jest-519n but couldn't get it to work
describe('OtpService (with db connection)', () => {
  let connection: Connection
  let queryRunner: QueryRunner

  beforeAll(async () => {
    await prepareDbConnections()
    connection = await createConnection({
      type: 'postgres',
      host: config.get('database.host'),
      port: config.get('database.port'),
      username: config.get('database.username'),
      password: config.get('database.password'),
      database: `checkwho_test_${process.env.JEST_WORKER_ID}`,
      logging: false,
      entities: [join(__dirname, 'entities', '*.entity{.js,.ts}')],
      namingStrategy: new SnakeNamingStrategy(),
    })
  })

  afterAll(async () => {
    await connection.close()
  })
  beforeEach(() => {
    queryRunner.startTransaction()
  })

  afterEach(() => {
    queryRunner.rollbackTransaction()
  })
  it('OTP only valid once', async () => {
    /*
     * User requests OTP
     * User submits correct OTP
     * User submits correct OTP again
     * User fails with OTPVerificationResult.INCORRECT_OTP
     * */
  })
  it('prev OTP invalidated by new OTP request', async () => {
    /*
     * User requests OTP A
     * User requests new OTP B
     * User submits OTP A
     * User fails with OTPVerificationResult.INCORRECT_OTP
     * User submits OTP B
     * User succeeds with OTPVerificationResult.SUCCESS
     * */
  })
})
