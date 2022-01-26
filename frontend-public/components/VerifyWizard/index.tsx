import { StarIcon } from '@chakra-ui/icons'
import { Badge, Box, Heading, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { CallerService } from '../../services'
import CallerCard, { Caller } from '../CallerCard'

const fetchCallers = async () => {
  const caller = await CallerService.getLatestCallForMop()
  console.log(caller)
}

const VerifyWizard = () => {
  const [caller, setCaller] = useState(
    // {} as Caller,
    {
      name: 'Benjamin Tan',
      role: 'Manager',
      agency: 'Ministry of Health',
    },
  )
  setTimeout(fetchCallers, 2000)

  const [hasRefreshed, setHasRefreshed] = useState(false)
  return (
    <>
      <VStack align="left" padding={10}>
        <Heading>Who&apos;s calling</Heading>
        {caller.name ? <CallerSection caller={caller} /> : <NoCallerSection />}
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
      <div>Official call found</div>
      <div>
        Ask the caller for their name and agency, and{' '}
        <b>make sure it matches these details:</b>
      </div>
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
