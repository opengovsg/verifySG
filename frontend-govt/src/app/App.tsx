// import inter.css from design system to provide default text styles
import '@opengovsg/design-system-react/build/fonts/inter.css'

// app imports
import { ThemeProvider } from '@opengovsg/design-system-react'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './AppRouter'
import AuthProvider from '../contexts/AuthProvider/AuthProvider'

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
