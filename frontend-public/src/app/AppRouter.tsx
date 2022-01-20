import { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'

import { LOGIN_ROUTE, ROOT_ROUTE } from 'constants/routes'

import { DashboardPage } from 'pages/dashboard'
import { LoginPage } from 'pages/login'

import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PublicRoute'

export const AppRouter = (): JSX.Element => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <PublicRoute exact path={LOGIN_ROUTE}>
          <LoginPage />
        </PublicRoute>
        <PrivateRoute exact path={ROOT_ROUTE}>
          <DashboardPage />
        </PrivateRoute>
        <Route path="*">
          <div>404</div>
        </Route>
      </Switch>
    </Suspense>
  )
}
