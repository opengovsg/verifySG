import { Container, Flex } from '@chakra-ui/react'
import React from 'react'
import Header from '../Header'

export const HeaderContainer: React.FC = ({ children }) => (
  <Flex flexDir="column" w="100vw" h="100vh">
    <Header />
    <Container background="#F4F6F9" maxW="100%" h="100%">
      {children}
    </Container>
  </Flex>
)
