import { ReactNode, useState } from 'react'

import { NotificationDataContext } from './NotificationDataContext'

// NotificationData provider props & declaration
interface NotificationDataProps {
  children: ReactNode
}

export const NotificationDataProvider = ({
  children,
}: NotificationDataProps) => {
  const [targetNRIC, setTargetNRIC] = useState('')

  return (
    <NotificationDataContext.Provider
      value={{
        targetNRIC,
        setTargetNRIC,
      }}
    >
      {children}
    </NotificationDataContext.Provider>
  )
}

export default NotificationDataProvider
