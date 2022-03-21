// import inter.css from design system to provide default text styles
import '@opengovsg/design-system-react/build/fonts/inter.css'

// app imports
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider } from '@opengovsg/design-system-react'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './AppRouter'
import AuthProvider from '../contexts/auth/AuthProvider'

export const App: React.FC = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
