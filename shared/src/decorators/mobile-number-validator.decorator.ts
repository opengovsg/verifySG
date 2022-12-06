import { registerDecorator } from 'class-validator'

export function IsMobileNumber() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string): void {
    registerDecorator({
      name: 'isMobileNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'Must be a valid Singapore mobile number',
      },
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false
          }
          return /^(\+65|65)?[89]\d{7}$/.test(value)
        },
      },
    })
  }
}
