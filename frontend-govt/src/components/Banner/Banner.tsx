import { Box } from '@chakra-ui/react'

type MessageType = React.FC
type BannerProps = {
  message: MessageType
}

export const Banner: React.FC<BannerProps> = ({
  message,
}: {
  message: MessageType
}): JSX.Element => {
  const Message = message
  return (
    <Box
      h="50px"
      minH="50px"
      color="neutral.100"
      zIndex="2000"
      background="red.500"
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
