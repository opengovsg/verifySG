import { Image, Text, VStack } from '@chakra-ui/react'
import HeaderContainer from '../../components/HeaderContainer'
import WelcomeSplash from '../../assets/WelcomeSplash.svg'
import { Button } from '@opengovsg/design-system-react'
import { BiPlus } from 'react-icons/bi'
import { useHistory } from 'react-router-dom'
import { PROFILE_ROUTE } from '../../constants/routes'

export const WelcomePage: React.FC = () => {
  const history = useHistory()

  return (
    <HeaderContainer>
      <VStack mt="64px" spacing="32px">
        <VStack spacing="16px" maxW="460px">
          <Text textAlign="center" textStyle="h2" color="#1B3C87">
            Welcome to your CheckWho dashboard!
          </Text>
          <Text textAlign="center" color="#2C3A4B">
            Start by creating your caller profile, so members of the public can
            know who is calling them.
          </Text>
        </VStack>
        <Image w="300px" h="300px" src={WelcomeSplash} />
        <Button
          bg="#1B3C87"
          leftIcon={<BiPlus size="24px" />}
          onClick={() => history.push(PROFILE_ROUTE)}
        >
          Create Caller Profile
        </Button>
      </VStack>
    </HeaderContainer>
  )
}
