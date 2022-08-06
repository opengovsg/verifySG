import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { OtpService, OTPVerificationResult } from '../otp.service'
import { OTP } from '../../database/entities'
import { useTestDatabase } from '../../database/test-hooks'
import { CoreModule } from '../../core/core.module'
import { otpUtils } from '../utils'
import { Logger } from '../../core/providers'

const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000

describe('OtpService', () => {
  let otpService: OtpService
  let otpRepository: Repository<OTP>
  let logger: Logger
  let resetDatabase: () => Promise<void>
  let closeDatabase: () => Promise<void>
  const validOtpMock = '089282'
  const mockEmailAddress = 'benjamin_tan@spf.gov.sg'
  const validOtpEntityMock: OTP = {
    createdAt: new Date(Date.now() - 5 * ONE_MINUTE_IN_MILLISECONDS),
    email: mockEmailAddress,
    expiredAt: new Date(Date.now() + 10 * ONE_MINUTE_IN_MILLISECONDS),
    hash: '$2b$10$SMxZF/FO1jftpFULJSJfyuIhnZ.0LVAvFbUQqMdYoiLrAKxNQgBFe',
    id: 1,
    numOfAttempts: 0,
    updatedAt: new Date(Date.now() - 5 * ONE_MINUTE_IN_MILLISECONDS),
  }

  beforeAll(async () => {
    const [opts, resetHook, closeHook] = await useTestDatabase()
    resetDatabase = resetHook
    closeDatabase = closeHook
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CoreModule,
        TypeOrmModule.forRootAsync(opts),
        TypeOrmModule.forFeature([OTP]),
      ],
      providers: [OtpService],
    }).compile()

    otpService = module.get<OtpService>(OtpService)
    otpRepository = module.get(getRepositoryToken(OTP))
    logger = module.get<Logger>(Logger)
    otpUtils.generateOtpAndHashAsync = jest.fn().mockReturnValue({
      otp: validOtpMock,
      hash: validOtpEntityMock.hash,
    })
    otpUtils.generateOtpAndHashAsync = jest.fn().mockResolvedValue({
      otp: validOtpMock,
      hash: validOtpEntityMock.hash,
    })
  })

  afterAll(async () => {
    await closeDatabase()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  it('should be defined', () => {
    expect(otpService).toBeDefined()
    expect(otpRepository).toBeDefined()
    expect(logger).toBeDefined()
  })

  it('should verify otp as matching hash', async () => {
    const verificationResultBool = await otpUtils.verifyOtpWithHashAsync(
      validOtpMock,
      validOtpEntityMock.hash,
    )
    expect(verificationResultBool).toBe(true)
  })

  it('otp happy path', async () => {
    /*
     * User requests OTP
     * User submits valid OTP
     * User succeeds with OTPVerificationResult.SUCCESS
     * */
    const { otp, timeLeftMinutes } = await otpService.getOtp(mockEmailAddress)
    expect(otp).toBe(validOtpMock)
    expect(timeLeftMinutes).toBe('15')
    expect(otpUtils.generateOtpAndHashAsync).toHaveBeenCalled()
    const otpBeforeVerification = await otpRepository.findOneBy({
      email: 'benjamin_tan@spf.gov.sg',
    })
    expect(otpBeforeVerification).toHaveProperty(
      'hash',
      validOtpEntityMock.hash,
    )
    jest.spyOn(otpService, 'incrementAttemptCount')
    const otpVerificationResult = await otpService.verifyOtp(
      validOtpEntityMock.email,
      validOtpMock,
    )
    expect(otpService.incrementAttemptCount).toHaveBeenCalled()
    expect(otpVerificationResult).toBe(OTPVerificationResult.SUCCESS)
    const otpAfterVerification = await otpRepository.findOneBy({
      email: mockEmailAddress,
    })
    expect(otpAfterVerification).toBeNull() // otp is deleted after successful verification
  })

  it('invalid otp path 1: invalid and retry', async () => {
    /*
     * User requests OTP
     * User submits invalid OTP
     * User fails with OTPVerificationResult.INCORRECT_OTP
     * User submits correct OTP and logs in successfully
     * */
    await otpService.getOtp(mockEmailAddress)
    const otpVerificationResult1 = await otpService.verifyOtp(
      validOtpEntityMock.email,
      '123456',
    )
    const otpAfterFailedVerification = await otpRepository.findOneBy({
      email: mockEmailAddress,
    })
    expect(otpAfterFailedVerification).toHaveProperty('numOfAttempts', 1)
    expect(otpVerificationResult1).toBe(OTPVerificationResult.INCORRECT_OTP)
    const otpVerificationResult2 = await otpService.verifyOtp(
      validOtpEntityMock.email,
      validOtpMock,
    )
    expect(otpVerificationResult2).toBe(OTPVerificationResult.SUCCESS)
  })
  it('invalid otp path 2: max attempts', async () => {
    /*
     * User requests OTP
     * User submits invalid OTP 10 times
     * User submits correct OTP before expiry
     * User fails with OTPVerificationResult.MAX_ATTEMPTS_REACHED
     * */
    await otpService.getOtp(mockEmailAddress)
    for (let i = 0; i < 10; i++) {
      const otpVerificationResult = await otpService.verifyOtp(
        validOtpEntityMock.email,
        '123456',
      )
      const otpInDb = await otpRepository.findOneBy({
        email: mockEmailAddress,
      })
      expect(otpVerificationResult).toBe(OTPVerificationResult.INCORRECT_OTP)
      expect(otpInDb).toHaveProperty('numOfAttempts', i + 1)
    }
    const otpVerificationResult = await otpService.verifyOtp(
      validOtpEntityMock.email,
      validOtpMock,
    )
    expect(otpVerificationResult).toBe(
      OTPVerificationResult.MAX_ATTEMPTS_REACHED,
    )
  })
  it('invalid otp path 3: expired otp', async () => {
    /*
     * User requests OTP
     * User submits expired OTP
     * User fails with OTPVerificationResult.EXPIRED_OTP
     * */
    // mock expired otp (no time to let clock run normally)
    // need to set as spy to run mockRestore() without affecting subsequent tests
    const spy = jest.spyOn(otpRepository, 'create').mockReturnValue({
      id: 1,
      email: validOtpEntityMock.email,
      hash: validOtpEntityMock.hash,
      createdAt: new Date(Date.now() - 25 * ONE_MINUTE_IN_MILLISECONDS),
      numOfAttempts: 0,
      updatedAt: new Date(Date.now() - 15 * ONE_MINUTE_IN_MILLISECONDS),
      expiredAt: new Date(Date.now() - 10 * ONE_MINUTE_IN_MILLISECONDS),
    })
    await otpService.getOtp(mockEmailAddress)
    const otpVerificationResult = await otpService.verifyOtp(
      validOtpEntityMock.email,
      validOtpMock,
    )
    expect(otpVerificationResult).toBe(OTPVerificationResult.EXPIRED_OTP)
    spy.mockRestore()
  })
  it('cannot find OTP in db scenario 1: hitting endpoint directly', async () => {
    /* User submits OTP with no corresponding email in db
     * Scenario 1: user is hitting endpoint directly (suspicious!)
     * Expected result: User fails with OTPVerificationResult.INCORRECT_OTP
     */
    jest.spyOn(logger, 'warn')
    const otpVerificationResult = await otpService.verifyOtp(
      mockEmailAddress,
      '123456',
    )
    const otp = await otpRepository.findOneBy({
      email: mockEmailAddress,
    })
    expect(otp).toBeNull()
    expect(otpVerificationResult).toBe(OTPVerificationResult.INCORRECT_OTP)
    expect(logger.warn).toHaveBeenCalled()
  })
  it('cannot find OTP in db scenario 2: two consecutive correct OTP submissions', async () => {
    /* User submits OTP with no corresponding email in db
     * Scenario 2: user is submitting two consecutive correct OTPs
     * Expected result: User fails with OTPVerificationResult.INCORRECT_OTP
     */
    jest.spyOn(logger, 'warn')
    const { otp } = await otpService.getOtp(mockEmailAddress)
    const firstOtpVerificationResult = await otpService.verifyOtp(
      mockEmailAddress,
      otp,
    )
    expect(firstOtpVerificationResult).toBe(OTPVerificationResult.SUCCESS)
    const secondOtpVerificationResult = await otpService.verifyOtp(
      mockEmailAddress,
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
    const { otp: otpA } = await otpService.getOtp(mockEmailAddress)
    otpUtils.generateOtpAndHashAsync = jest.fn().mockResolvedValue({
      otp: '705728',
      hash: '$2b$10$v6H4EA1E.85gW6wNuhugweIskX2Facl9hCvIHTi8v6hGOZDp/UBC6',
    })
    const { otp: otpB } = await otpService.getOtp(mockEmailAddress)
    const otpAVerificationResult = await otpService.verifyOtp(
      mockEmailAddress,
      otpA,
    )
    expect(otpAVerificationResult).toBe(OTPVerificationResult.INCORRECT_OTP)
    const otpBVerificationResult = await otpService.verifyOtp(
      mockEmailAddress,
      otpB,
    )
    expect(otpBVerificationResult).toBe(OTPVerificationResult.SUCCESS)
  })
})
