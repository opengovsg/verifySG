import { extendTheme } from '@chakra-ui/react'
import { theme as ogpTheme } from '@opengovsg/design-system-react'

import { colors } from './colors'

export const theme = extendTheme(ogpTheme, {
  colors,
})
