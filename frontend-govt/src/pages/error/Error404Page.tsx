import React from 'react'
import { Center, Divider, Flex, Image, Text } from '@chakra-ui/react'

import Logo from '@/assets/CheckWhoLogo.svg'
import SignInSplash from '@/assets/SignInSplash.svg'

export const Error404Page: React.FC = () => {
  return (
    <Flex flex={1} direction="column" h="100vh">
      <Center flex={1} bg="#1B3C87">
        <Image
          src={SignInSplash}
          minHeight="280px"
          maxHeight="480px"
          mb="-10%"
        />
      </Center>
      <Flex
        justifyContent="start"
        flex={2}
        mt="15%"
        direction="column"
        w="100%"
        align="center"
        px="5%"
      >
        <Text textStyle="h1" fontSize="1.7rem" mb="1rem" align="center">
          Oops! We can&apos;t find the page you are looking for.
        </Text>
        <Text color="secondary.400">Please check your link again.</Text>
        <Divider maxW="25rem" mt="5rem" mb="1rem" />
        <Text textTransform="uppercase" color="secondary.400">
          Powered by
        </Text>
        <Image src={Logo} w="223px" />
      </Flex>
    </Flex>
  )
}
