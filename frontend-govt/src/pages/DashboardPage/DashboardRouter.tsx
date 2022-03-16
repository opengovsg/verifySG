import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useRouteMatch,
} from 'react-router-dom'
import CallerProfileForm from '../../components/CallerProfileForm'
import CallForm from '../../components/CallForm'
import { DASHBOARD_ROUTE } from '../../constants/routes'

export const DashboardRouter = (): JSX.Element => {
  const match = useRouteMatch()
  const history = useHistory()
  const callRedirect = () => history.push(`${DASHBOARD_ROUTE}/call`)

  return (
    <Switch>
      {/**TODO: implement path switching based on caller profile state */}
      <Route exact path={`${match.url}/call`}>
        <CallForm />
      </Route>
      <Route exact path={`${match.url}/profile`}>
        <CallerProfileForm onSubmit={callRedirect} />
      </Route>
      <Route exact path={`${match.url}/`}>
        <Redirect to={`${DASHBOARD_ROUTE}/profile`} />
      </Route>
    </Switch>
  )
}
