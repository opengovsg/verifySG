import React from 'react'
import { Box } from '@chakra-ui/react'

type BannerProps = {
  message: React.FC
  background?: string
}

export const Banner: React.FC<BannerProps> = ({
  message,
  background = 'primary.500',
}): JSX.Element => {
  const Message = message
  return (
    <Box
      p="1rem"
      minH="50px"
      color="neutral.100"
      zIndex="2000"
      background={background}
      display="flex"
      justifyContent="center"
      alignItems="center"
      className="banner"
      fontWeight="medium"
    >
      <Message />
    </Box>
  )
}
