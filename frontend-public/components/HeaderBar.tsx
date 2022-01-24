import { Box, Flex, Heading } from '@chakra-ui/layout'
import { Spacer } from '@chakra-ui/react'
import React from 'react'
import LanguageDropdown from './LanguageDropdown'

const HeaderBar = () => {
  return (
    <Flex>
      <Box p="4">
        <div>WhoDis.gov.sg</div>
      </Box>
      <Spacer></Spacer>
      <Box p="4">
        <LanguageDropdown />
      </Box>
    </Flex>
  )
}

export default HeaderBar
