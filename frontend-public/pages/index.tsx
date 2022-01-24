import { Box } from '@chakra-ui/react'
import { NextPage } from 'next'
import React, { useContext } from 'react'
import HeaderBar from '../components/HeaderBar'
import LoginWizard from '../components/LoginWizard'
import VerifyWizard from '../components/VerifyWizard'
import { AuthContext } from '../contexts/AuthProvider'

const Home: NextPage = () => {
  const { authState } = useContext(AuthContext)
  return (
    <>
      <Box ml={10} mr={10} mt={10}>
        <HeaderBar />
      </Box>
      {!authState.isAuthenticated ? <LoginWizard /> : <VerifyWizard />}
    </>
  )
}

export default Home
