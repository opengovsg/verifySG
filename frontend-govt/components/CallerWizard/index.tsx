import { Box, Heading, VStack, Text, Input, Button } from "@chakra-ui/react"

export const CallerWizard = () => {
    return (
        <VStack align='left'>
            <Heading>
                Make a secure call
            </Heading>

            <Text>
                Please enter the NRIC of the person to call
            </Text>

            <Input placeholder="NRIC" />

            <Button colorScheme="teal"> Next </Button>
            
        </VStack>
    )
}