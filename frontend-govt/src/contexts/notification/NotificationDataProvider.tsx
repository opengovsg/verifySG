import { ReactNode, useState } from 'react'

import { NotificationDataContext } from './NotificationDataContext'

// NotificationData provider props & declaration
interface NotificationDataProps {
  children: ReactNode
}

export const NotificationDataProvider = ({
  children,
}: NotificationDataProps) => {
  const [targetPhoneNumber, setTargetPhoneNumber] = useState('')
  const [msgTemplateKey, setMsgTemplateKey] = useState('')

  return (
    <NotificationDataContext.Provider
      value={{
        targetPhoneNumber,
        setTargetPhoneNumber,
        msgTemplateKey,
        setMsgTemplateKey,
      }}
    >
      {children}
    </NotificationDataContext.Provider>
  )
}

export default NotificationDataProvider
