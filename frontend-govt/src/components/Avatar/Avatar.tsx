import React, { Fragment, useMemo } from 'react'
import {
  Circle,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemProps,
  MenuList,
  SquareProps,
} from '@chakra-ui/react'
import { BxsChevronDown, BxsChevronUp } from '@opengovsg/design-system-react'

interface AvatarMenuItem extends Omit<MenuItemProps, 'children'> {
  label: string
  hasDivider?: boolean
}

interface AvatarProps extends SquareProps {
  name?: string
  withDropdown?: boolean
  menuItems?: AvatarMenuItem[]
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  withDropdown,
  menuItems,
  ...props
}) => {
  const initials = useMemo(() => {
    const parts = name?.split(' ') ?? '?'
    return parts[0].charAt(0) + (parts[1] ? parts[1].charAt(0) : '')
  }, [name])

  return (
    <Menu>
      {({ isOpen }) => (
        <>
          <MenuButton
            p="4px"
            my="auto"
            border="none"
            borderRadius="4px"
            _active={{ outline: 'none' }}
          >
            {/* Avatar / Dropdown */}
            <HStack spacing="8px">
              <Circle w="40px" h="40px" {...props}>
                {initials}
              </Circle>
              {withDropdown && (
                <Icon
                  as={isOpen ? BxsChevronUp : BxsChevronDown}
                  w="24px"
                  h="24px"
                  color={'secondary.300'}
                />
              )}
            </HStack>
          </MenuButton>
          {/* Menu Items */}
          <MenuList>
            {menuItems &&
              menuItems.map(({ label, hasDivider, ...itemProps }) => (
                <Fragment key={label}>
                  {hasDivider && <MenuDivider key={`${label}-divider`} />}
                  <MenuItem {...itemProps} key={label}>
                    {label}
                  </MenuItem>
                </Fragment>
              ))}
          </MenuList>
        </>
      )}
    </Menu>
  )
}
