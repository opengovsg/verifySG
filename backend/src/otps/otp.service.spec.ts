import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { OTP } from '../database/entities'
import {
  OtpService,
  OTPVerificationResult,
  POSTGRES_MAX_SMALLINT,
} from './otp.service'
import { ConfigService, Logger } from '../core/providers'
import { otpUtils } from './utils'
import { CoreModule } from '../core/core.module'
import { MockType, repositoryMockFactory } from '../types/testing'

const MILLISECONDS_IN_MINUTE = 60 * 1000

describe('OtpService (mocked db)', () => {
  let otpService: OtpService
  let otpRepositoryMock: MockType<Repository<OTP>>
  let logger: Logger
  let configService: ConfigService
  let otps: OTP[] // mock otp table in db
  const dummyEmail = 'benjamin_tan@spf.gov.sg'
  const generateInvalidOtp = (correctOtp: string) => {
    let candidateOtp
    do {
      candidateOtp = otpUtils.generateRandomSixDigitNumber()
    } while (candidateOtp === correctOtp)
    return candidateOtp
  }
  const createValidOtp = (input: {
    email: string
    hash: string
    expiredAt: Date
  }): OTP => {
    return {
      ...input,
      createdAt: new Date(Date.now()),
      numOfAttempts: 0,
      updatedAt: new Date(Date.now()),
      id: Math.floor(Math.random() * 10000),
    }
  }
  const createExpiredOtp = (input: {
    email: string
    hash: string
    expiredAt: Date
  }): OTP => {
    return {
      ...input,
      createdAt: new Date(Date.now() - 25 * MILLISECONDS_IN_MINUTE),
      numOfAttempts: 0,
      updatedAt: new Date(Date.now() - 15 * MILLISECONDS_IN_MINUTE),
      expiredAt: new Date(Date.now() - 10 * MILLISECONDS_IN_MINUTE),
      id: Math.floor(Math.random() * 10000),
    }
  }
  const createMaxAttemptOtp = (input: {
    email: string
    hash: string
    expiredAt: Date
  }): OTP => {
    return {
      ...input,
      createdAt: new Date(Date.now()),
      numOfAttempts: POSTGRES_MAX_SMALLINT,
      updatedAt: new Date(Date.now()),
      id: Math.floor(Math.random() * 10000),
    }
  }

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
            get: (key: string) => {
              if (key === 'otp')
                return {
                  expiryPeriod: MILLISECONDS_IN_MINUTE * 15,
                  numAllowedAttempts: 10,
                  numSaltRounds: 10,
                }
              return null
            },
          },
        },
      ],
      imports: [CoreModule],
    }).compile()

    otpService = module.get<OtpService>(OtpService)
    otpRepositoryMock = module.get(getRepositoryToken(OTP))
    logger = module.get<Logger>(Logger)
    configService = module.get<ConfigService>(ConfigService)
    otps = []

    // by default, mock valid otp creation
    otpRepositoryMock.create.mockImplementation(createValidOtp)
    otpRepositoryMock.save.mockImplementation((otp: OTP) => {
      otps.push(otp) // new otp always added to end of array
      return otp
    })
    otpRepositoryMock.delete.mockImplementation((otpId: number): OTP => {
      const otp = otps.find((otp) => otp.id === otpId)
      if (!otp) {
        throw new Error(`OTP not found for id ${otpId}`)
      }
      otps = otps.filter((otp) => otp.id !== otpId)
      return otp
    })
    jest
      .spyOn(otpService, 'findOTPByEmail')
      .mockImplementation(async (email: string) => {
        return otps // imitate db lookup of always getting latest OTP if >1
          .slice()
          .reverse()
          .find((otp) => otp.email === email)
      })
    jest
      .spyOn(otpService, 'incrementAttemptCount')
      .mockImplementation(async (otpId: number) => {
        const otp = otps.find((otp) => otp.id === otpId)
        if (!otp) {
          throw new Error(`OTP not found for id ${otpId}`)
        }
        otps = otps.map((otp) => {
          return otp.id === otpId
            ? {
                ...otp,
                numOfAttempts: otp.numOfAttempts + 1,
              }
            : otp
        })
      })
  })

  afterEach(() => {
    otps = [] // clear array after each test
  })
  it('should be defined', () => {
    expect(otpService).toBeDefined()
    expect(otpRepositoryMock).toBeDefined()
    expect(configService).toBeDefined()
    expect(logger).toBeDefined()
  })
  it('should verify hard-coded hash and otp as correct', async () => {
    const validOtp = '089282'
    const validOtpHash =
      '$2b$10$SMxZF/FO1jftpFULJSJfyuIhnZ.0LVAvFbUQqMdYoiLrAKxNQgBFe'
    const verificationBoolean = await otpUtils.verifyOtpWithHashAsync(
      validOtp,
      validOtpHash,
    )
    expect(verificationBoolean).toBe(true)
  })
  it('get otp works', async () => {
    jest.spyOn(otpUtils, 'generateOtpAndHashAsync')
    const { otp, timeLeftMinutes } = await otpService.getOtp(dummyEmail)
    expect(timeLeftMinutes).toBe('15')
    expect(otpUtils.generateOtpAndHashAsync).toHaveBeenCalled()
    expect(otpRepositoryMock.create).toHaveBeenCalled()
    expect(otpRepositoryMock.save).toHaveBeenCalled()
    expect(otps.length).toBe(1)
    const savedOtp = otps[0]
    const isValid = await otpUtils.verifyOtpWithHashAsync(otp, savedOtp.hash)
    expect(isValid).toBe(true)
  })
  it('verify otp happy path', async () => {
    /*
     * User requests OTP
     * User submits valid OTP
     * User succeeds with OTPVerificationResult.SUCCESS
     * */
    jest.spyOn(otpService, 'incrementAttemptCount')
    const { otp } = await otpService.getOtp(dummyEmail)
    const otpVerificationResult = await otpService.verifyOtp(dummyEmail, otp)
    expect(otpService.incrementAttemptCount).toHaveBeenCalled()
    expect(otpRepositoryMock.delete).toHaveBeenCalled()
    expect(otpVerificationResult).toBe(OTPVerificationResult.SUCCESS)
    expect(otps.length).toBe(0)
  })
  it('invalid OTP', async () => {
    /*
     * User requests OTP
     * User submits invalid OTP
     * User fails with OTPVerificationResult.INCORRECT_OTP
     * */
    jest.spyOn(otpService, 'incrementAttemptCount')
    const { otp } = await otpService.getOtp(dummyEmail)
    const invalidOtp = generateInvalidOtp(otp)
    const otpVerificationResult = await otpService.verifyOtp(
      dummyEmail,
      invalidOtp,
    )
    expect(otpService.incrementAttemptCount).toHaveBeenCalled()
    expect(otpVerificationResult).toBe(OTPVerificationResult.INCORRECT_OTP)
    expect(otps.length).toBe(1)
  })
  it('expired OTP', async () => {
    /*
     * User requests OTP
     * User submits correct but expired OTP (figure out how to mock passage of time)
     * User fails with OTPVerificationResult.EXPIRED_OTP
     * */
    otpRepositoryMock.create.mockImplementation(createExpiredOtp)
    jest.spyOn(otpService, 'incrementAttemptCount')
    const { otp } = await otpService.getOtp(dummyEmail)
    const otpVerificationResult = await otpService.verifyOtp(dummyEmail, otp)
    expect(otpService.incrementAttemptCount).not.toHaveBeenCalled()
    expect(otpVerificationResult).toBe(OTPVerificationResult.EXPIRED_OTP)
  })
  it('max attempts', async () => {
    /*
     * User requests OTP
     * User proceeds to hit max attempts with incorrect OTP
     * User submits correct OTP before expiry
     * User fails with OTPVerificationResult.MAX_ATTEMPTS_REACHED
     * */
    jest.spyOn(otpService, 'incrementAttemptCount')
    const { otp } = await otpService.getOtp(dummyEmail)
    const invalidOtp = generateInvalidOtp(otp)
    const { numAllowedAttempts } = configService.get('otp')
    for (let i = 0; i < numAllowedAttempts; i++) {
      await otpService.verifyOtp(dummyEmail, invalidOtp)
    }
    expect(otpService.incrementAttemptCount).toHaveBeenCalledTimes(
      numAllowedAttempts,
    )
    const otpVerificationResultCorrectOtp = await otpService.verifyOtp(
      dummyEmail,
      otp,
    )
    expect(otpVerificationResultCorrectOtp).toBe(
      OTPVerificationResult.MAX_ATTEMPTS_REACHED,
    )
    const otpVerificationResultInvalidOtp = await otpService.verifyOtp(
      dummyEmail,
      invalidOtp,
    )
    expect(otpVerificationResultInvalidOtp).toBe(
      OTPVerificationResult.MAX_ATTEMPTS_REACHED,
    )
  })
  it('max attempts hit smallint limit', async () => {
    /*
     * User has hit smallint limit of attempts before expiry (impossible!?)
     * User requests OTP
     * User submits wrong OTP
     * User fails with OTPVerificationResult.MAX_ATTEMPTS_REACHED
     * otpService.incrementAttemptCount() should not be called
     * */
    otpRepositoryMock.create.mockImplementation(createMaxAttemptOtp)
    jest.spyOn(otpService, 'incrementAttemptCount')
    const { otp } = await otpService.getOtp(dummyEmail)
    const otpVerificationResult = await otpService.verifyOtp(dummyEmail, otp)
    expect(otpService.incrementAttemptCount).not.toHaveBeenCalled()
    expect(otpVerificationResult).toBe(
      OTPVerificationResult.MAX_ATTEMPTS_REACHED,
    )
  })
  it('cannot find OTP in db scenario (1)', async () => {
    /* User submits OTP with no corresponding email in db
     * Some possibilities:
     * (1) User has not requested OTP for this email, which suggests either
     * or user is hitting the endpoint directly "getOTP" or "findOTPByEmail" is not working
     * (2) User has requested OTP for this email but somehow is sending the same verification request twice
     * (resulting in approval on first request and rejection on second request)
     * Expected result: User fails with OTPVerificationResult.INCORRECT_OTP
     */
    jest.spyOn(otpService, 'findOTPByEmail').mockResolvedValue(undefined)
    jest.spyOn(otpService, 'incrementAttemptCount')
    jest.spyOn(logger, 'warn')
    const otpVerificationResult = await otpService.verifyOtp(
      'nonexistent_email@agency.gov.sg',
      '123456',
    )
    expect(otpService.incrementAttemptCount).not.toHaveBeenCalled()
    expect(otpVerificationResult).toBe(OTPVerificationResult.INCORRECT_OTP)
    expect(logger.warn).toHaveBeenCalled()
  })
  it('cannot find OTP in db scenario (2)', async () => {
    /*
     * See comments in previous test
     * User requests OTP
     * User submits correct OTP
     * User submits correct OTP again
     * User fails with OTPVerificationResult.INCORRECT_OTP
     * */
    jest.spyOn(logger, 'warn')
    const { otp } = await otpService.getOtp(dummyEmail)
    const firstOtpVerificationResult = await otpService.verifyOtp(
      dummyEmail,
      otp,
    )
    expect(firstOtpVerificationResult).toBe(OTPVerificationResult.SUCCESS)
    const secondOtpVerificationResult = await otpService.verifyOtp(
      dummyEmail,
      otp,
    )
    expect(secondOtpVerificationResult).toBe(
      OTPVerificationResult.INCORRECT_OTP,
    )
    expect(logger.warn).toHaveBeenCalled()
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
    const { otp: otpA } = await otpService.getOtp(dummyEmail)
    const { otp: otpB } = await otpService.getOtp(dummyEmail)
    const otpAVerificationResult = await otpService.verifyOtp(dummyEmail, otpA)
    expect(otpAVerificationResult).toBe(OTPVerificationResult.INCORRECT_OTP)
    const otpBVerificationResult = await otpService.verifyOtp(dummyEmail, otpB)
    expect(otpBVerificationResult).toBe(OTPVerificationResult.SUCCESS)
  })
})
