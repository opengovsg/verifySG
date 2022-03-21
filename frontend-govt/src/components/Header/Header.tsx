import React from 'react'
import { Flex, HStack, Image, TabList, Tabs } from '@chakra-ui/react'
import Logo from '../../assets/CheckWhoLogo.svg'
import { Tab } from '@opengovsg/design-system-react'
import { Link } from 'react-router-dom'
import { PROFILE_ROUTE } from '../../constants/routes'
import { AvatarControl } from './AvatarControl'

interface NavlinkProps {
  label: string
  route: string
}

interface HeaderProps {
  navlinks?: Array<NavlinkProps>
}

const defaultNavlinks: Array<NavlinkProps> = [
  {
    label: 'CALL DASHBOARD',
    route: PROFILE_ROUTE,
  },
]

export const Header: React.FC<HeaderProps> = (props) => {
  let { navlinks } = props

  // use default navlinks if not provided
  if (!navlinks) navlinks = defaultNavlinks

  return (
    <Flex
      h="72px"
      w="100vw"
      borderBottom="1px solid"
      borderBottomColor="#DADEE3"
      justifyContent="space-between"
      shrink={0}
    >
      {/** Left Cluster */}
      <HStack spacing="56px" ml="56px" align="center">
        {/* Logo */}
        <Image src={Logo} w="150px" />

        {/* Tabs */}
        <Tabs>
          <TabList>
            {navlinks.map((navlink, index) => (
              <Link key={index} to={navlink.route}>
                <Tab>{navlink.label}</Tab>
              </Link>
            ))}
          </TabList>
        </Tabs>
      </HStack>

      {/* Right Cluster */}
      <AvatarControl
        //TODO: fill this in based on user context
        name="A"
        bgColor="#1B3C87"
      />
    </Flex>
  )
}
