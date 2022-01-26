import { Badge, Box } from '@chakra-ui/react'
import React from 'react'

export type Caller = {
  name: string
  role?: string
  agency: string
}
interface CallerSectionProps {
  caller: Caller
}
const CallerCard = ({ caller }: CallerSectionProps) => {
  return (
    <Box mt={10} background={'lightgrey'}>
      <Box display="flex" alignItems="baseline">
        <Badge borderRadius="full" px="2" colorScheme="teal">
          {caller.agency}
        </Badge>
      </Box>
      <Box mt="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
        {caller.name}
      </Box>

      <Box>{caller.role}</Box>
    </Box>
  )
}

export default CallerCard
