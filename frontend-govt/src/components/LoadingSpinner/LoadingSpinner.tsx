import { Flex, Spinner } from '@chakra-ui/react'

export const LoadingSpinner = () => (
  <Flex w="100vw" h="100vh" alignItems="center" justifyContent="center">
    <Spinner
      thickness="5px"
      speed="0.65s"
      emptyColor="neutral.200"
      color="primary"
      w="72px"
      h="72px"
    />
  </Flex>
)
