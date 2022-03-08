import '../styles/globals.css'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import AuthProvider from '../contexts/AuthProvider'

const theme = extendTheme({
  colors: {
    brand: {
      green: '#357867',
      500: '#357867'
    },
    green: {
      200: '#D7E4E1'
    }
  }
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ChakraProvider>
  )
}

export default MyApp
