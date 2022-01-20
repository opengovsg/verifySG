import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Button, ButtonGroup, Flex, Heading } from '@chakra-ui/react'

import { LOGGED_IN_KEY } from 'constants/localStorage'
import { useLocalStorage } from 'hooks/localStorage'

export const LoginPage = (): JSX.Element => {
  const [, setIsAuthenticated] = useLocalStorage<boolean>(LOGGED_IN_KEY)

  const login = useCallback(() => {
    setIsAuthenticated(true)
  }, [setIsAuthenticated])

  return (
    <Flex flexDir="column">
      <Heading>This is a mock login page - Government only</Heading>
      <ButtonGroup>
        <Button onClick={login}>Log in</Button>

        <Button>
          <Link to="/">
            Attempt to go to restricted route (and see nothing happen)
          </Link>
        </Button>
      </ButtonGroup>
    </Flex>
  )
}
