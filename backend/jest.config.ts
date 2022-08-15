import type { Config } from '@jest/types'
import { defaults as tsjPreset } from 'ts-jest/presets'

const config: Config.InitialOptions = {
  preset: '@trendyol/jest-testcontainers',
  transform: { ...tsjPreset.transform },
  setupFilesAfterEnv: ['<rootDir>/jest.env.js'],
  testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,js}'],
  coveragePathIgnorePatterns: ['<rootDir>/build', '<rootDir>/node_modules'],
  modulePaths: ['<rootDir>/src'],
  moduleNameMapper: {
    '~shared/(.*)': '<rootDir>/../shared/src/$1',
  },
}

export default config
