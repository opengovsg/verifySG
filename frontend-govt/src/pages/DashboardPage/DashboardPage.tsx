import { Flex } from '@chakra-ui/react'
import Header from '../../components/Header'
import { DashboardRouter } from './DashboardRouter'

//TODO: implement dashboard page
export const DashboardPage = () => (
  <Flex flexDir="column" w="100vw" h="100vh">
    <Header />
    <Flex background="#F4F6F9" w="100%" h="100%" justifyContent="center">
      <DashboardRouter />
    </Flex>
  </Flex>
)
