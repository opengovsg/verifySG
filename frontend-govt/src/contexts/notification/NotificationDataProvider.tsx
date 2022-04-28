import { ReactNode, useState } from 'react'

import { NotificationDataContext } from './NotificationDataContext'

// NotificationData provider props & declaration
interface NotificationDataProps {
  children: ReactNode
}

export const NotificationDataProvider = ({
  children,
}: NotificationDataProps) => {
  const [targetNRIC, setTargetNRIC] = useState<string | undefined>()

  return (
    <NotificationDataContext.Provider
      value={{
        targetNRIC,
        setTargetNRIC: (nric) => {
          setTargetNRIC(nric)
        },
      }}
    >
      {children}
    </NotificationDataContext.Provider>
  )
}

export default NotificationDataProvider
