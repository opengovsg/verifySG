import { registerDecorator } from 'class-validator'
import nric from 'nric'

export function IsNric() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string): void {
    registerDecorator({
      name: 'isNric',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'Must be a valid NRIC/FIN',
      },
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false
          }
          return nric.validate(value)
        },
      },
    })
  }
}
