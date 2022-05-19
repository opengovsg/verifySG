import React, { useState } from 'react'
import { BiLogOutCircle, BiUser } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { Link, useHistory } from 'react-router-dom'
import { Flex, HStack, Image, TabList, Tabs } from '@chakra-ui/react'
import { Tab } from '@opengovsg/design-system-react'

import Logo from '../../assets/CheckWhoLogo.svg'
import { NOTIFICATIONFORM_ROUTE, PROFILE_ROUTE } from '../../constants/routes'
import { useAuth } from '../../contexts/auth/AuthContext'
import { OfficerService } from '../../services/OfficerService'
import Avatar from '../Avatar'

interface NavlinkProps {
  label: string
  route: string
}

interface HeaderProps {
  navlinks?: Array<NavlinkProps>
}

export const Header: React.FC<HeaderProps> = ({ navlinks }) => {
  const history = useHistory()
  const [officerName, setOfficerName] = useState<string | undefined>()

  // attempt to retrieve officer name from profile
  useQuery('profile', OfficerService.getOfficer, {
    onSuccess: ({ name }) => {
      setOfficerName(name)
    },
  })

  const { logout } = useAuth()

  return (
    <Flex
      h="72px"
      w="100vw"
      borderBottom="1px solid"
      borderBottomColor="#DADEE3"
      justifyContent="space-between"
      shrink={0}
      px={['1.5em', '1.5em', '2em', '2em']}
    >
      {/** Left Cluster */}
      <HStack spacing="56px" align="center">
        {/* Logo */}
        <Link key={'checkwho logo'} to={NOTIFICATIONFORM_ROUTE}>
          <Image src={Logo} w="150px" />
        </Link>

        {/* Tabs */}
        <Tabs>
          <TabList>
            {navlinks &&
              navlinks.map((navlink, index) => (
                <Link key={index} to={navlink.route}>
                  <Tab>{navlink.label}</Tab>
                </Link>
              ))}
          </TabList>
        </Tabs>
      </HStack>

      {/* Right Cluster */}
      <Avatar
        //TODO: shift these into theme folder for cleanup refactor
        withDropdown
        name={officerName}
        bgColor={officerName !== null ? '#1B3C87' : 'neutral.500'}
        textColor="#FFFFFF"
        menuItems={[
          {
            label: 'Edit Profile',
            icon: <BiUser />,
            onClick: () => {
              history.push(PROFILE_ROUTE)
            },
          },
          {
            label: 'Sign Out',
            hasDivider: true,
            icon: <BiLogOutCircle />,
            onClick: logout,
            textColor: 'red.500',
          },
        ]}
      />
    </Flex>
  )
}
