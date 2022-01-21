import { Box } from '@chakra-ui/react'
import type { NextPage } from 'next'
import React, { useContext } from 'react'
import { CallerWizard } from '../components/CallerWizard'
import LoginWizard from '../components/LoginWizard'
import { AuthContext } from '../contexts/AuthProvider'
const Home: NextPage = () => {
  const { authState } = useContext(AuthContext)
  return (
    <div>
      {!authState.isAuthenticated ? <LoginWizard /> : <CallerWizard />}
    </div>
  )
}

export default Home
