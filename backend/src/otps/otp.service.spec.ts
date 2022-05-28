import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { OTP } from '../database/entities'
import { OtpService, OTPVerificationResult } from './otp.service'
import { ConfigService, Logger } from '../core/providers'
import { otpUtils } from './utils'
import { CoreModule } from '../core/core.module'
import { MockType, repositoryMockFactory } from '../types/testing'

const MILLISECONDS_IN_MINUTE = 60 * 1000

describe('OtpService (mocked db)', () => {
  let otpService: OtpService
  let configService: ConfigService
  let otpRepositoryMock: MockType<Repository<OTP>>
  let logger: Logger

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: getRepositoryToken(OTP),
          useFactory: repositoryMockFactory,
        },
        ConfigService,
      ],
      imports: [CoreModule],
    }).compile()

    otpService = module.get<OtpService>(OtpService)
    configService = module.get<ConfigService>(ConfigService)
    otpRepositoryMock = module.get(getRepositoryToken(OTP))
    logger = module.get<Logger>(Logger)
  })
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
    expect(timeLeftMinutes).toBe('15')
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
      createdAt: new Date(Date.now() - 25 * MILLISECONDS_IN_MINUTE),
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
      numOfAttempts: 10,
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
      numOfAttempts: 10,
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
  it('cannot find OTP in db (should not happen)', async () => {
    /* User submits OTP with no corresponding email in db
     * only if email was not submitted in OTP request
     * which suggests either "getOTP" or "findOTPByEmail" is not working
     * or user is hitting the endpoint directly
     * User fails with OTPVerificationResult.INCORRECT_OTP
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
  // TODO: not sure how to write the following tests; would be trivial if db methods are mocked
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
