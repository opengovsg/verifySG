import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import React from 'react'

const LanguageDropdown = () => {
  return (
    <Menu>
      <MenuButton
        px={4}
        py={2}
        transition="all 0.2s"
        borderRadius="md"
        borderWidth="1px"
        borderColor="teal"
      >
        English <ChevronDownIcon />
      </MenuButton>
      <MenuList>
        <MenuItem>English</MenuItem>
        <MenuItem>English</MenuItem>
        <MenuItem>English</MenuItem>
        <MenuItem>English</MenuItem>
      </MenuList>
    </Menu>
  )
}

export default LanguageDropdown
