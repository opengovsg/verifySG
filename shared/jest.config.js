/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  transform: { ...tsjPreset.transform },
  rootDir: './',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  modulePaths: ['<rootDir>/src'],
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,js}'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
}
