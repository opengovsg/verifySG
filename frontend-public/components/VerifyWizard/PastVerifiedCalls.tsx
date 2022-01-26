import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import {
  Accordion,
  Box,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  Heading,
  HStack,
  Spacer,
  Flex,
  VStack,
  Badge,
  Text,
  Icon,
} from '@chakra-ui/react'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../contexts/AuthProvider'
import { CallerService, CallResponse } from '../../services'
import { toFormattedDateTime } from '../../utils/dateUtils'

interface PastCallsProps {
  key: number
  callDetails: {
    officerName: string
    position: string
    agency: string
    createdAt: string
  }
}

const PastCallsCard = ({ key, callDetails }: PastCallsProps) => {
  return (
    <VStack align="left" bgColor="#F8F8F8" p={3} spacing={1} borderRadius={4}>
      <Box>
        <Badge borderRadius="full" px="3" bgColor="#35786759">
          <Text color="#357867" fontSize="9" textTransform="capitalize">
            {callDetails.agency}
          </Text>
        </Badge>
      </Box>
      <Text fontWeight="bold" fontSize="md">
        {callDetails.officerName}
      </Text>
      <Text fontWeight={'medium'}>{callDetails.position}</Text>
      <Text fontSize="xs" color="#B9B9B9">
        {toFormattedDateTime(callDetails.createdAt)}
      </Text>
    </VStack>
  )
}

export const PastVerifiedCalls = () => {
  const authState = useContext(AuthContext)
  const [pastCalls, setPastCalls] = useState<CallResponse[]>([])
  const [pastCallsVisible, setPastCallsVisible] = useState(false)

  const handleDropdownClick = () => {
    setPastCallsVisible(!pastCallsVisible)
  }

  useEffect(() => {
    const getPastCalls = async () => {
      const pastCalls = await CallerService.getAllCallsForMop()
      setPastCalls(pastCalls)
    }
    getPastCalls()
  }, [])

  return (
    <Box>
      <HStack onClick={handleDropdownClick}>
        <Heading size="md">Past Verified Calls</Heading>
        <Spacer />
        {pastCallsVisible ? (
          <Icon as={ChevronDownIcon} mr={2} boxSize={7} color="#445072" />
        ) : (
          <Icon as={ChevronUpIcon} mr={2} boxSize={7} color="#445072" />
        )}
      </HStack>
      {pastCallsVisible &&
        pastCalls.map((call, indx) => {
          return (
            <Box key={call.id} mt={2.5}>
              <PastCallsCard
                key={call.id}
                callDetails={{
                  officerName: call.officer.name,
                  position: call.officer.position,
                  agency: call.officer.agency,
                  createdAt: call.createdAt,
                }}
              />
            </Box>
          )
        })}
    </Box>
  )
}
