import { useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'

import { WELCOME_ROUTE } from '../../constants/routes'
import { OfficerService } from '../../services/OfficerService'

export const ProfileGuard: React.FC = ({ children }) => {
  const history = useHistory()

  useQuery('profile', OfficerService.getOfficer, {
    onSuccess: ({ name, position }) => {
      if (!name || !position) history.push(WELCOME_ROUTE)
    },
  })

  // always render children
  return <>{children}</>
}
