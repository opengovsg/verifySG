import { HStack, Avatar, Icon, AvatarProps } from '@chakra-ui/react'
import { BxsChevronDown } from '@opengovsg/design-system-react'
import React from 'react'

export const AvatarControl: React.FC<AvatarProps> = (props) => {
  return (
    <HStack spacing={2} mr="56px" align="center">
      <Avatar h={10} w={10} {...props} />
      <Icon as={BxsChevronDown} w={6} h={6} color="secondary.300"></Icon>
    </HStack>
  )
}
