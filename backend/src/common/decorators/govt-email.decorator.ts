import { registerDecorator } from 'class-validator'

export function IsGovtEmail() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string): void {
    registerDecorator({
      name: 'isGovtEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'Must be a valid .gov.sg email',
      },
      validator: {
        // TODO: refactor regexp into shared directory (3/3)
        validate(value: string): boolean {
          return !!value.match(
            "[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+.gov.sg",
          )
        },
      },
    })
  }
}
