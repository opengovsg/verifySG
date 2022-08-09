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
  const [msgTemplateKey, setMsgTemplateKey] = useState('')

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
