import { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'

import { ROOT_ROUTE, LOGIN_ROUTE } from '../constants/routes'

import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PublicRoute'

const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))

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
        <Route path="*">404</Route>
      </Switch>
    </Suspense>
  )
}
