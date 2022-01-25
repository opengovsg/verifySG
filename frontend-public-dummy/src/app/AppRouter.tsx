import { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'

import { CALLBACK_ROUTE, LOGIN_ROUTE, ROOT_ROUTE } from 'constants/routes'

import { DashboardPage } from 'pages/dashboard'
import { CallbackPage, LoginPage } from 'pages/login'

import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PublicRoute'

export const AppRouter = (): JSX.Element => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <PublicRoute exact path={LOGIN_ROUTE}>
          <LoginPage />
        </PublicRoute>
        <PublicRoute exact path={CALLBACK_ROUTE}>
          <CallbackPage />
        </PublicRoute>
        <PrivateRoute path={ROOT_ROUTE}>
          <DashboardPage />
        </PrivateRoute>
        <Route path="*">
          <div>404</div>
        </Route>
      </Switch>
    </Suspense>
  )
}
