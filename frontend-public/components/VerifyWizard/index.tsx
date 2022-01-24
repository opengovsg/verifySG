import { StarIcon } from '@chakra-ui/icons'
import { Badge, Box, Heading, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'

type Caller = {
  name?: string
  role?: string
  organization?: string
}
const VerifyWizard = () => {
  const [caller, setCaller] = useState(
    //   {} as Caller
    {
      name: 'Benjamin Tan',
      role: 'Manager',
      organization: 'Ministry of Health',
    },
  )
  return (
    <>
      <VStack align="left" padding={10}>
        <Heading>Who's calling</Heading>
        {caller.name ? (
          <CallerHeader caller={caller} />
        ) : (
          <CallerHeader caller={caller} />
        )}
      </VStack>
    </>
  )
}

interface CallerHeaderProps {
  caller: Caller
}
const CallerHeader = ({ caller }: CallerHeaderProps) => {
  return (
    <>
      <div>Official call found</div>
      <div>Please verify that the person calling you is:</div>
      <Box mt={10} background={'lightgrey'}>
        <Box display="flex" alignItems="baseline">
          <Badge borderRadius="full" px="2" colorScheme="teal">
            {caller.organization}
          </Badge>
        </Box>
        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          isTruncated
        >
          {caller.name}
        </Box>

        <Box>{caller.role}</Box>
      </Box>
    </>
  )
}

const NoCallerHeader = ({ caller }: CallerHeaderProps) => {
  return (
    <>
      <div>No official call found</div>
      <div>
        <b>Do not</b> disclose any personal information
      </div>
      <Box mt={10} background={'lightgrey'}>
        <Box display="flex" alignItems="baseline">
          <Badge borderRadius="full" px="2" colorScheme="teal">
            {caller.organization}
          </Badge>
        </Box>
        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          isTruncated
        >
          {caller.name}
        </Box>

        <Box>{caller.role}</Box>
      </Box>
    </>
  )
}

export default VerifyWizard
