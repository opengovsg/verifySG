import { Button } from '@chakra-ui/react'
import React, { useCallback, useContext } from 'react'
import { AuthContext } from '../contexts/AuthProvider'

interface SingpassLoginButtonProps {
  buttonOnClick: () => void
}
const SingpassLoginButton = ({ buttonOnClick }: SingpassLoginButtonProps) => {
  return (
    <Button colorScheme={'teal'} onClick={buttonOnClick}>
      Log in with Singpass []
    </Button>
  )
}

export default SingpassLoginButton
