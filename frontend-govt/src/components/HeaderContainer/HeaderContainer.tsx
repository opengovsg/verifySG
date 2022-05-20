import React from 'react'
import { Box, Container, Flex } from '@chakra-ui/react'

import Header from '../Header'

export const HeaderContainer: React.FC = ({ children }) => (
  <Flex flexDir="column" w="100vw">
    <Box minHeight="5vh">
      <Header navbarHeight="8vh" />
    </Box>
    <Container
      pt={['16px', '16px', '24px', '36px']}
      background="#F4F6F9"
      h="100%"
      minHeight="92vh"
      maxW="100%"
      centerContent
    >
      {children}
    </Container>
  </Flex>
)
