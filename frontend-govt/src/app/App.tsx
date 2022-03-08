// import inter.css from design system to provide default text styles
import '@opengovsg/design-system-react/build/fonts/inter.css'

// app imports
import { ThemeProvider } from '@opengovsg/design-system-react'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './AppRouter'

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ThemeProvider>
  )
}
