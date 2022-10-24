// considered setting these as env variables, but we shouldn't vary these that much?
// similarly, if we support expiryPeriod, should that be an env variable or a constant?

import { customAlphabet } from 'nanoid'

const uniqueParamStringConfig = {
  // use this to calculate collision probability https://zelark.github.io/nano-id-cc/
  customAlphabet: '346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz', // remove lookalikes
  length: 20,
}

const uniqueParamStringGenerator = customAlphabet(
  uniqueParamStringConfig.customAlphabet,
  uniqueParamStringConfig.length,
)

export const generateUniqueParamString = (): string => {
  return uniqueParamStringGenerator()
}
