import { CheckCircleIcon } from '@chakra-ui/icons'
import { Badge, Box, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import React from 'react'

export type Caller = {
  name: string
  position: string
  agency: string
}
interface CallerSectionProps {
  caller: Caller
}
const CallerCard = ({ caller }: CallerSectionProps) => {
  return (
    <Box background={'#EDF6F4'} p={5} borderRadius={'4px'}>
      <HStack spacing={5}>
        <Box>
          <Icon as={CheckCircleIcon} color={'#357867'} boxSize={45} />
        </Box>
        <VStack align="left" spacing={1}>
          <Box isTruncated>
            <Text fontWeight="bold" fontSize="20px">
              {caller.name}
            </Text>
          </Box>
          <Box>
            <Text color="#357867" fontWeight="bold" fontSize="16px">
              {caller.agency}
            </Text>
          </Box>
          <Box>
            <Badge borderRadius="full" px="3" bgColor={'#89898959'}>
              <Text textTransform="capitalize">{caller.position}</Text>
            </Badge>
          </Box>
        </VStack>
      </HStack>
    </Box>
  )
}

export default CallerCard
