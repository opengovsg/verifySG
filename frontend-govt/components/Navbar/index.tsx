import { Heading, HStack, Select } from '@chakra-ui/react'

const Navbar = () => {
  return (
    <HStack spacing={8}>
      <HStack spacing={0}>
        <Heading color={'brand.green'} size={'lg'}>
          WhoThis
        </Heading>

        <Heading size={'lg'}>.gov.sg</Heading>
      </HStack>
      <Select>
        <option value="English">English</option>
      </Select>
    </HStack>
  )
}

export default Navbar
