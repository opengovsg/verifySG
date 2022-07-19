// import inter.css from design system to provide default text styles
import '@opengovsg/design-system-react/build/fonts/inter.css'

// app imports
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@opengovsg/design-system-react'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import axios from 'axios'

import StagingBanner from '../components/StagingBanner'
import AuthProvider from '../contexts/auth/AuthProvider'
import NotificationDataProvider from '../contexts/notification/NotificationDataProvider'
import { theme } from '../theme'
import { EnvDto } from '../types/env'

import { AppRouter } from './AppRouter'

// If Sentry params are specified, init sentry.
axios.get<EnvDto>('/api/env').then((res) => {
  const { dsn, env } = res.data
  if (dsn && env) {
    Sentry.init({
      dsn,
      environment: env,
      integrations: [
        new Integrations.BrowserTracing({
          routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
        }),
      ],
    })
  }
})

export const App: React.FC = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <NotificationDataProvider>
              <StagingBanner />
              <AppRouter />
            </NotificationDataProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
