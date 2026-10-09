import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";

import CustomerPageHeader from "../../components/Customers/Vehicles/CustomerPageHeader";
import CustomerFooter from "../../components/Customers/Vehicles/CustomerFooter";
import { business } from "../../config/business";

const steps = [
  {
    title: "Pick a unit",
    body: "Every car on the site is on our lot right now, with the plate, mileage and the CR/OR on file. Ask us for more photos anytime.",
  },
  {
    title: "Reserve it",
    body: "Upload a valid ID and pay the reservation fee (usually ₱10,000–₱25,000, depending on the unit). We hold the car for 7 days. Your ID stays on file, so you won't need to upload it again next time.",
  },
  {
    title: "Pay cash or go through a bank",
    body: "Pay in full or in parts through GCash, bank transfer or cash at the lot. For financing, we help you put together the bank's requirements and track the approval.",
  },
  {
    title: "Release",
    body: "Once fully paid, we prepare the deed of sale and release the car. You can download the receipt and deed from your account.",
  },
];

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" bg="gray.50" minH="100vh">
      <CustomerPageHeader />

      <Container maxW="5xl" flex="1" py={{ base: 8, md: 14 }}>
        <Stack spacing={{ base: 10, md: 14 }}>
          <Box maxW="3xl">
            <Heading color="dark.800" size={{ base: "lg", md: "xl" }} letterSpacing="-0.02em">
              Used cars in {business.area}
            </Heading>
            <Text color="gray.600" fontSize="md" lineHeight="1.8" mt={4}>
              We sell second-hand cars to buyers around Cagayan de Oro and
              Misamis Oriental. Each listing shows the actual unit on our lot:
              year, mileage, plate number and photos, plus the price and the
              reservation fee.
            </Text>
            <Text color="gray.600" fontSize="md" lineHeight="1.8" mt={3}>
              After you buy, you can still bring the car back to us for oil
              changes, tire replacement or repairs. Just file a service request
              from your account.
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="700" color="brand.600" mb={4}>
              How buying from us works
            </Text>
            <Stack spacing={0}>
              {steps.map((step, index) => (
                <HStack
                  key={step.title}
                  align="start"
                  spacing={5}
                  py={5}
                  borderTop="1px solid"
                  borderColor="gray.200"
                >
                  <Text fontSize="2xl" fontWeight="800" color="gray.300" lineHeight="1" w="32px" flexShrink={0}>
                    {index + 1}
                  </Text>
                  <Box>
                    <Text fontWeight="700" color="dark.800">
                      {step.title}
                    </Text>
                    <Text color="gray.600" fontSize="sm" lineHeight="1.7" mt={1} maxW="2xl">
                      {step.body}
                    </Text>
                  </Box>
                </HStack>
              ))}
            </Stack>
          </Box>

          <Flex
            bg="dark.800"
            color="white"
            borderRadius="md"
            p={{ base: 5, md: 7 }}
            gap={4}
            direction={{ base: "column", md: "row" }}
            align={{ md: "center" }}
            justify="space-between"
          >
            <Box>
              <Text fontWeight="700">Want to see a car in person?</Text>
              <Text color="gray.300" fontSize="sm" mt={1}>
                Call {business.phone} before you go so we can have the unit ready.
              </Text>
            </Box>
            <HStack spacing={3}>
              <Button colorScheme="brand" size="sm" onClick={() => navigate("/browse-vehicles")}>
                See cars for sale
              </Button>
              <Button variant="outline" size="sm" color="white" _hover={{ bg: "whiteAlpha.200" }} onClick={() => navigate("/contact")}>
                Directions
              </Button>
            </HStack>
          </Flex>
        </Stack>
      </Container>

      <CustomerFooter />
    </Flex>
  );
}
