// stopgap solution for until Jest supports TypeScript properly
// https://stackoverflow.com/questions/55366037/inject-typeorm-repository-into-nestjs-service-for-mock-data-testing
import { Repository } from 'typeorm'

export type MockType<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]: jest.Mock<{}>
  // [P in keyof T]?: jest.Mock<{}>
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const repositoryMockFactory: () => MockType<Repository<unknown>> =
  jest.fn(() => ({
    findOne: jest.fn((entity) => entity),
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => entity),
    delete: jest.fn((entity) => entity),
  }))
