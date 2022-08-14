import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { ClassConstructor } from 'class-transformer/types/interfaces'

export const validateDto = async <T extends object, V>(
  cls: ClassConstructor<T>,
  dto: V,
) => {
  const generatedDto = plainToInstance(cls, dto)
  return await validate(generatedDto)
}
