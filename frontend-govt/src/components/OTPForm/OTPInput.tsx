import React, {
  FocusEvent,
  FocusEventHandler,
  useCallback,
  useRef,
} from 'react'
import {
  HStack,
  PinInput,
  PinInputProps,
  useControllableState,
  useOutsideClick,
} from '@chakra-ui/react'

import OTPInputField from './OTPInputField'

export interface OTPInputProps extends Omit<PinInputProps, 'children'> {
  // specifies the length of the OTP (default: 6)
  length?: number

  // specifies the character used to represent an empty input (default: ' ')
  emptyChar?: string

  // specifies focus/blur event callbacks
  onBlur?: (token: string) => void
  onFocus?: FocusEventHandler<HTMLInputElement>
}

export const OTPInput = React.forwardRef<HTMLInputElement, OTPInputProps>(
  (
    {
      // optional defaults
      length = 6,
      emptyChar = ' ',

      // new props
      onBlur,
      onFocus,

      // customized props
      value,
      defaultValue,
      onChange,
      onComplete,
      ...rest
    },
    // forwards the ref of the first input, useful for resetting focus on field clear
    ref,
  ) => {
    // internal token value - uses external value prop if specified
    const [token, setToken] = useControllableState<string>({
      value,
      onChange,
      defaultValue: '',
    })
    const editIndex = useRef(0)

    // handle input blurring
    const containerRef = useRef(null)
    useOutsideClick({
      ref: containerRef,
      handler: () => onBlur?.(token),
    })

    // handle input updates
    const handleChange = (newVal: string) => {
      // get index position of edited input
      const currIndex = editIndex.current

      // if user deletes character before immediate end of token ('321' -> '3 1')
      if (newVal.length < token.length && currIndex < token.length - 1) {
        // prevent token from shrinking by adding an empty space (represented by emptyChar)
        newVal =
          newVal.slice(0, currIndex) + emptyChar + newVal.slice(currIndex)
      }

      // if user enters character beyond immediate end of token ('1' -> '1 3')
      else if (newVal.length - token.length === 1 && currIndex > token.length) {
        // add extra empty spaces to keep spacing between old value and new character
        newVal =
          newVal.slice(0, -1) +
          ' '.repeat(currIndex - token.length) +
          newVal.slice(-1)
      }

      // update token value
      setToken(newVal)

      // check if the updated value completes the OTP
      const isComplete = newVal.length === length && !newVal.includes(emptyChar)

      // trigger onComplete callback if OTP is completed
      isComplete && onComplete?.(newVal)
    }

    // handle input field focus updates
    const handleFocus = useCallback(
      (e: FocusEvent<HTMLInputElement>, inputIndex: number) => {
        editIndex.current = inputIndex
        onFocus?.(e)
      },
      [onFocus],
    )

    return (
      <HStack ref={containerRef} spacing={2}>
        <PinInput
          otp
          type="number"
          size="lg"
          focusBorderColor="primary.500"
          errorBorderColor="danger.500"
          value={token}
          defaultValue={defaultValue}
          onChange={handleChange}
          {...rest}
        >
          {/* Generate (length) OTP fields */}
          {[...Array(length)].map((_, i) => (
            <OTPInputField
              key={i}
              ref={i === 0 ? ref : undefined}
              emptyChar={emptyChar}
              onFocus={(e) => handleFocus(e, i)}
            />
          ))}
        </PinInput>
      </HStack>
    )
  },
)

export default OTPInput
