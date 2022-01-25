import { Box, Flex, Heading, HStack } from '@chakra-ui/layout'
import { Select, Spacer } from '@chakra-ui/react'
import React from 'react'
import LanguageDropdown from './LanguageDropdown'

const NavBar = () => {
  //   <Flex>
  //     <Box p="4">
  //       <div>WhoDis.gov.sg</div>
  //     </Box>
  //     <Spacer></Spacer>
  //     <Box p="4">
  // ;<LanguageDropdown />
  //     </Box>
  //   </Flex>
  return (
    // Copied fron frontend-govt
    <HStack spacing={8}>
      <HStack spacing={0}>
        <Heading color={'brand.green'} size={'lg'}>
          WhoDis
        </Heading>
        <Heading size={'lg'}>.gov.sg</Heading>
      </HStack>
      <Select>
        <option value="English">English</option>
      </Select>
    </HStack>
  )
}

export default NavBar
