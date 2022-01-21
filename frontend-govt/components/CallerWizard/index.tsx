import { InfoIcon } from '@chakra-ui/icons'
import {
  Box,
  Heading,
  VStack,
  Text,
  Input,
  Button,
  Spinner,
  HStack,
  Alert,
  Spacer,
} from '@chakra-ui/react'
import { Dispatch, SetStateAction, useCallback, useState } from 'react'

export const CallerWizard = () => {
  const [section, setSection] = useState(0)
  const [nric, setNric] = useState('')
  const components = [
    <FirstSection setSection={setSection} nric={nric} setNric={setNric} />,
    <SecondSection nric={nric} setSection={setSection} />,
  ]
  return <VStack align="left">{components[section]}</VStack>
}

interface SectionProps {
  setSection: Dispatch<SetStateAction<number>>
  nric: string
  setNric: Dispatch<SetStateAction<string>>
}

const FirstSection = ({ setSection, nric, setNric }: SectionProps) => {
  const handleNricChange = useCallback(
    (e) => {
      setNric(e.target.value)
    },
    [nric],
  )

  return (
    <Box>
      <VStack align={'left'}>
        <Heading size="lg">Make a secure call</Heading>

        <Text>Please enter the NRIC of the person to call</Text>

        <Input placeholder="NRIC" value={nric} onChange={handleNricChange} />

        <Button
          colorScheme="brand"
          onClick={() => setSection((section) => section + 1)}
        >
          Next
        </Button>

        <Text>
          Call recipients are able to verify your identity, to help protect them
          from scams
        </Text>
      </VStack>
    </Box>
  )
}

const SecondSection = ({
  nric,
  setSection,
}: {
  nric: string
  setSection: Dispatch<SetStateAction<number>>
}) => {
  return (
    <VStack align="left">
      <HStack>
        <Spinner color="brand.green" speed="2s" />{' '}
        <Heading color={'brand.green'}>Call in progress</Heading>{' '}
      </HStack>

      <Text fontSize="xl" fontWeight={'bold'}>
        NRIC: {nric}
      </Text>

      <Button colorScheme="red" onClick={() => setSection(0)}>
        End Call
      </Button>

      <Spacer />
      <Spacer />
      <HStack align='left' backgroundColor='green.200' borderRadius='4px' padding='16px'>
        <InfoIcon color='brand.green' boxSize={'20px'}/>
        <Text>
          To help the recipient identify this as an official call, ask them to
          visit whodis.gov.sg on their phone or desktop browser
        </Text>
      </HStack>
    </VStack>
  )
}
