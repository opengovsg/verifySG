import { Button, Container, Flex, Image, Text } from '@chakra-ui/react'

import { AuthService } from 'services'

export const LoginPage = (): JSX.Element => {
  const login = async () => {
    const { authUrl } = await AuthService.getAuthEndpoint()
    window.location.href = authUrl
  }

  return (
    <Container>
      <Flex flexDir="column" alignItems="center">
        <Text textStyle="display1" color="primary.700">
          Welcome to
        </Text>
        <Text textStyle="display2" color="primary.700">
          Hi
        </Text>
        <Text textStyle="subhead1" color="primary.500" mt={2}>
          Health records in your pocket
        </Text>
      </Flex>
      <Button mt={6} onClick={login}>
        Login via Singpass
      </Button>
    </Container>
  )
}
