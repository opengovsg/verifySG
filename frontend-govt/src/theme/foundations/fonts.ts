import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/jetbrains-mono'

import { theme } from '@chakra-ui/react'

export const fonts = {
  ...theme.fonts,
  body: "'Inter', sans-serif",
  heading: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
}
