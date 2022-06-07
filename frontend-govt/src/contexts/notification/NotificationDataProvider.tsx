import { createContext, ReactNode, useContext, useState } from 'react'

interface NotificationDataContext {
  targetNRIC: string | undefined
  setTargetNRIC: (nric: string | undefined) => void
  purposeDescription: string | undefined
  setPurposeDescription: (purposeDescription: string | undefined) => void
}

interface NotificationDataProps {
  children: ReactNode
}

// specify defaults for notification context
export const NotificationDataContext = createContext<
  NotificationDataContext | undefined
>(undefined)

// convenience notification hook
export const useNotificationData = (): NotificationDataContext => {
  const notificationData = useContext(NotificationDataContext)
  if (!notificationData)
    throw new Error(
      'useNotificationData must be used within an NotificationDataProvider',
    )
  return notificationData
}

export const NotificationDataProvider = ({
  children,
}: NotificationDataProps) => {
  const [targetNRIC, setTargetNRIC] = useState<string | undefined>()
  const [purposeDescription, setPurposeDescription] = useState<
    string | undefined
  >()

  return (
    <NotificationDataContext.Provider
      value={{
        targetNRIC,
        setTargetNRIC,
        purposeDescription,
        setPurposeDescription,
      }}
    >
      {children}
    </NotificationDataContext.Provider>
  )
}
