import React from 'react'
import { chakra, PinInputFieldProps, usePinInputField } from '@chakra-ui/react'

interface OTPInputFieldProps extends PinInputFieldProps {
  // specifies the character to interpret as an empty string
  emptyChar?: string
}

export const OTPInputField = React.forwardRef<
  HTMLInputElement,
  OTPInputFieldProps
>(({ emptyChar, ...props }, ref) => {
  const { value, ...rest } = usePinInputField(props, ref)

  // allow spaces to be used as empty pin values
  return <chakra.input {...rest} value={value === emptyChar ? '' : value} />
})

export default OTPInputField
