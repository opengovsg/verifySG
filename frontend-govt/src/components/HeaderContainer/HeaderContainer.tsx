import React from 'react'
import { Container, Flex } from '@chakra-ui/react'

import { NOTIFICATIONFORM_ROUTE } from '../../constants/routes'
import Header from '../Header'

export const HeaderContainer: React.FC = ({ children }) => (
  <Flex flexDir="column" w="100vw" h="100vh">
    <Header
      navlinks={[
        {
          label: 'CALL DASHBOARD',
          route: NOTIFICATIONFORM_ROUTE,
        },
      ]}
    />
    <Container background="#F4F6F9" maxW="100%" h="100%">
      {children}
    </Container>
  </Flex>
)
