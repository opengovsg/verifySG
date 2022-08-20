import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CoreModule } from '../../core/core.module'
import { ConfigService, Logger } from '../../core/providers'
import { OTP } from '../../database/entities'
import { useTestDatabase } from '../../database/test-hooks'
import { OtpService, OTPVerificationResult } from '../otp.service'
import {
  generateIncorrectOtp,
  mockEmailAddress,
  ONE_MINUTE_IN_MILLISECONDS,
  otpEntityMock,
} from '../utils/otp-utils.spec'

describe('OtpService', () => {
  let otpService: OtpService
  let otpRepository: Repository<OTP>
  let configService: ConfigService
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
        TypeOrmModule.forFeature([OTP]),
      ],
      providers: [OtpService],
    }).compile()

    otpService = module.get<OtpService>(OtpService)
    otpRepository = module.get(getRepositoryToken(OTP))
    logger = module.get<Logger>(Logger)
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

  test('otp happy path', async () => {
    /*
     * User requests OTP
     * User submits valid OTP
     * User succeeds with OTPVerificationResult.SUCCESS
     * */
    const { otp, timeLeftMinutes } = await otpService.getOtp(mockEmailAddress)
    expect(timeLeftMinutes).toBe('15')
    const otpBeforeVerification = await otpRepository.findOneBy({
      email: mockEmailAddress,
    })
    expect(otpBeforeVerification).not.toBeNull()
    jest.spyOn(otpService, 'incrementAttemptCount')
    const otpVerificationResult = await otpService.verifyOtp(
      mockEmailAddress,
      otp,
    )
    expect(otpService.incrementAttemptCount).toHaveBeenCalled()
    expect(otpVerificationResult).toBe(OTPVerificationResult.SUCCESS)
    const otpAfterVerification = await otpRepository.findOneBy({
      email: mockEmailAddress,
    })
    expect(otpAfterVerification).toBeNull() // otp is deleted after successful verification
  })

  test('invalid otp path 1: invalid and retry', async () => {
    /*
     * User requests OTP
     * User submits invalid OTP
     * User fails with OTPVerificationResult.INCORRECT_OTP
     * User submits correct OTP and logs in successfully
     * */
    const { otp } = await otpService.getOtp(mockEmailAddress)
    const incorrectOtp = generateIncorrectOtp(otp)
    const otpVerificationResult1 = await otpService.verifyOtp(
      mockEmailAddress,
      incorrectOtp,
    )
    const otpAfterFailedVerification = await otpRepository.findOneBy({
      email: mockEmailAddress,
    })
    expect(otpAfterFailedVerification).toHaveProperty('numOfAttempts', 1)
    expect(otpVerificationResult1).toBe(OTPVerificationResult.INCORRECT_OTP)
    const otpVerificationResult2 = await otpService.verifyOtp(
      mockEmailAddress,
      otp,
    )
    expect(otpVerificationResult2).toBe(OTPVerificationResult.SUCCESS)
  })
  test('invalid otp path 2: max attempts', async () => {
    /*
     * User requests OTP
     * User submits invalid OTP 10 times
     * User submits correct OTP before expiry
     * User fails with OTPVerificationResult.MAX_ATTEMPTS_REACHED
     * */
    configService = createMock<ConfigService>({
      get: (key: string) => {
        switch (key) {
          case 'otp':
            return { numAllowedAttempts: 10 }
          default:
            return ''
        }
      },
    })
    const { otp } = await otpService.getOtp(mockEmailAddress)
    const { numAllowedAttempts } = configService.get('otp')
    const incorrectOtp = generateIncorrectOtp(otp)
    for (let i = 0; i < numAllowedAttempts; i++) {
      const otpVerificationResult = await otpService.verifyOtp(
        mockEmailAddress,
        incorrectOtp,
      )
      const otpInDb = await otpRepository.findOneBy({
        email: mockEmailAddress,
      })
      expect(otpVerificationResult).toBe(OTPVerificationResult.INCORRECT_OTP)
      expect(otpInDb).toHaveProperty('numOfAttempts', i + 1)
    }
    const otpVerificationResult = await otpService.verifyOtp(
      mockEmailAddress,
      otp,
    )
    expect(otpVerificationResult).toBe(
      OTPVerificationResult.MAX_ATTEMPTS_REACHED,
    )
  })
  test('invalid otp path 3: expired otp', async () => {
    /*
     * User requests OTP
     * User submits expired OTP
     * User fails with OTPVerificationResult.EXPIRED_OTP
     * */
    // mock expired otp (no time to let clock run normally)
    const mockExpiredOtp = jest.spyOn(otpRepository, 'create').mockReturnValue({
      id: 1,
      email: mockEmailAddress,
      hash: otpEntityMock.hash,
      createdAt: new Date(Date.now() - 25 * ONE_MINUTE_IN_MILLISECONDS),
      numOfAttempts: 0,
      updatedAt: new Date(Date.now() - 15 * ONE_MINUTE_IN_MILLISECONDS),
      expiredAt: new Date(Date.now() - 10 * ONE_MINUTE_IN_MILLISECONDS),
    })
    const { otp } = await otpService.getOtp(mockEmailAddress)
    const otpVerificationResult = await otpService.verifyOtp(
      mockEmailAddress,
      otp,
    )
    expect(otpVerificationResult).toBe(OTPVerificationResult.EXPIRED_OTP)
    mockExpiredOtp.mockRestore()
  })
  test('nonexistent OTP in db scenario 1: hitting endpoint directly', async () => {
    /* User submits OTP with no corresponding email in db
     * Scenario 1: user is hitting endpoint directly (suspicious!)
     * Expected result: User fails with OTPVerificationResult.INCORRECT_OTP
     */
    jest.spyOn(logger, 'warn')
    const otpVerificationResult = await otpService.verifyOtp(
      mockEmailAddress,
      '123456', // will always be incorrect since otp db is empty
    )
    const otp = await otpRepository.findOneBy({
      email: mockEmailAddress,
    })
    expect(otp).toBeNull()
    expect(otpVerificationResult).toBe(OTPVerificationResult.INCORRECT_OTP)
    expect(logger.warn).toHaveBeenCalled()
  })
  it('nonexistent OTP in db scenario 2: two consecutive correct OTP submissions', async () => {
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
  test('prev OTP invalidated by new OTP request', async () => {
    /*
     * User requests OTP A
     * User requests new OTP B
     * User submits OTP A
     * User fails with OTPVerificationResult.INCORRECT_OTP
     * User submits OTP B
     * User succeeds with OTPVerificationResult.SUCCESS
     * User resubmits OTP A
     * User fails with OTPVerificationResult.INCORRECT_OTP
     * */
    const { otp: otpA } = await otpService.getOtp(mockEmailAddress)
    const { otp: otpB } = await otpService.getOtp(mockEmailAddress)
    const otpAVerificationResultAttempt1 = await otpService.verifyOtp(
      mockEmailAddress,
      otpA,
    )
    // there is a small chance of failure if otpA and otpB are the same
    expect(otpAVerificationResultAttempt1).toBe(
      OTPVerificationResult.INCORRECT_OTP,
    )
    const otpBVerificationResult = await otpService.verifyOtp(
      mockEmailAddress,
      otpB,
    )
    expect(otpBVerificationResult).toBe(OTPVerificationResult.SUCCESS)
    const otpAVerificationResultAttempt2 = await otpService.verifyOtp(
      mockEmailAddress,
      otpA,
    )
    expect(otpAVerificationResultAttempt2).toBe(
      OTPVerificationResult.INCORRECT_OTP,
    )
  })
})
