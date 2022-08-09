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
  const [msgTemplateKey, setMsgTemplateKey] = useState<string | undefined>()

  return (
    <NotificationDataContext.Provider
      value={{
        targetNRIC,
        setTargetNRIC,
        msgTemplateKey,
        setMsgTemplateKey,
      }}
    >
      {children}
    </NotificationDataContext.Provider>
  )
}

export default NotificationDataProvider
