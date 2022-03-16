import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'

import { LOGIN_ROUTE, DASHBOARD_ROUTE, ROOT_ROUTE } from '../constants/routes'

import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PublicRoute'

const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))

export const AppRouter = (): JSX.Element => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        {/* TODO: add root page */}
        <PublicRoute exact path={ROOT_ROUTE}>
          <Redirect to={LOGIN_ROUTE} />
        </PublicRoute>
        <PublicRoute exact path={LOGIN_ROUTE}>
          <LoginPage />
        </PublicRoute>
        <PrivateRoute path={DASHBOARD_ROUTE}>
          <DashboardPage />
        </PrivateRoute>
        {/* TODO: add 404 page */}
        <Route path="*">404</Route>
      </Switch>
    </Suspense>
  )
}
