import { ComponentStyleConfig } from '@chakra-ui/react'
import defaultTheme from '@chakra-ui/theme'
import { StyleFunctionProps } from '@chakra-ui/theme-tools'

export const Button: ComponentStyleConfig = {
  baseStyle: {
    bgColor: 'primary',
  },
  sizes: {
    md: {
      height: '44px',
      width: '145px',
    },
    sm: {
      height: '436x',
      width: '138px',
    },
  },
  variants: {
    link: (props: StyleFunctionProps) => ({
      ...defaultTheme.components.Button.variants.link(props),
      height: '44px',
    }),
  },
  defaultProps: {
    variant: 'solid',
    colorScheme: 'primary',
    size: 'md',
  },
}
