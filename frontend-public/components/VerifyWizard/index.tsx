import { StarIcon } from '@chakra-ui/icons'
import { Text, Badge, Box, Heading, VStack } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../contexts/AuthProvider'
import { CallerService } from '../../services'
import { socket } from '../../services/SocketService'
import CallerCard, { Caller } from '../CallerCard'
import { PastVerifiedCalls } from './PastVerifiedCalls'

const VerifyWizard = () => {
  const {
    authState: { nric },
  } = useContext(AuthContext)
  const [caller, setCaller] = useState<Caller & { createdAt: string }>(
    { name: '', position: '', agency: '', createdAt: '' },
    // {
    //   name: 'Benjamin Tan',
    //   position: 'Manager',
    //   agency: 'Ministry of Health',
    // },
  )
  const isLatestCall = () => {
    if (!caller.createdAt) {
      return false
    }
    const date = new Date(caller.createdAt)
    const today = new Date()
    return date.getDay() === today.getDay()
  }
  useEffect(() => {
    CallerService.getLatestCallForMop()
      .then(({ createdAt, officer: { name, agency, position } }) => {
        if (name && agency) {
          setCaller({
            name,
            position,
            agency,
            createdAt,
          })
        }
      })
      .catch((e) => console.log(e))
    // TODO: Updat this function to be within CallService and also to filter for mopId === current authenticated user
    socket.on(
      `call_created${nric}`,
      ({ createdAt, officer: { name, agency, position } }) => {
        setCaller({
          name,
          position,
          agency,
          createdAt,
        })
      },
    )
  }, [nric])

  const [hasRefreshed, setHasRefreshed] = useState(false)
  return (
    <>
      <VStack align="left" padding={10} spacing={5}>
        <VStack spacing={2} align="left">
          <Heading size={'md'}>Who&apos;s calling</Heading>
          {caller.name ? (
            <CallerSection caller={caller} />
          ) : (
            <NoCallerSection />
          )}
        </VStack>

        <PastVerifiedCalls />
      </VStack>
    </>
  )
}

interface CallerSectionProps {
  caller: Caller
}
const CallerSection = ({ caller }: CallerSectionProps) => {
  return (
    <>
      <Text color="brand.green" fontWeight="bold">
        Official call found
      </Text>
      <Text>
        Ask the caller for their name and agency, and{' '}
        <b>make sure it matches these details:</b>
      </Text>
      <CallerCard caller={caller} />
    </>
  )
}

interface NoCallerSectionProps {}
const NoCallerSection = ({}: NoCallerSectionProps) => {
  return (
    <>
      <div>No active calls found</div>
    </>
  )
}

export default VerifyWizard
