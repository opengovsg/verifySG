import { Box, Flex, Spacer, VStack } from '@chakra-ui/react'
import type { NextPage } from 'next'
import React, { useContext } from 'react'
import { CallerWizard } from '../components/CallerWizard'
import LoginWizard from '../components/LoginWizard'
import Navbar from '../components/Navbar'
import { AuthContext } from '../contexts/AuthProvider'
const Home: NextPage = () => {
  const { authState } = useContext(AuthContext)
  return (
    <Box paddingX={5} paddingY={5} backgroundColor="#F6F7FA" height={'100vh'}>
      <Flex
        direction={'column'}
        backgroundColor="white"
        padding={5}
        borderRadius={'4px'}
        boxShadow="sm"
        height={'100%'}
      >
        <Box paddingBottom={5}>
          <Navbar />
        </Box>
        <Spacer />
        <VStack>
          {!authState.isAuthenticated ? <LoginWizard /> : <CallerWizard />}
        </VStack>
        <Spacer />
      </Flex>
    </Box>
  )
}

export default Home
