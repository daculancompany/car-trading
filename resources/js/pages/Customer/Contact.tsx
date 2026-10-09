import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import CustomerPageHeader from "../../components/Customers/Vehicles/CustomerPageHeader";
import CustomerFooter from "../../components/Customers/Vehicles/CustomerFooter";
import { business, mapsEmbedUrl, mapsUrl } from "../../config/business";

export default function Contact() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" bg="gray.50" minH="100vh">
      <CustomerPageHeader />

      <Container maxW="6xl" flex="1" py={{ base: 8, md: 14 }}>
        <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 8, lg: 12 }}>
          <Stack spacing={6} flex="1" maxW={{ lg: "440px" }}>
            <Box>
              <Heading color="dark.800" size={{ base: "lg", md: "xl" }} letterSpacing="-0.02em">
                Drop by the lot or give us a call
              </Heading>
              <Text color="gray.600" mt={3} lineHeight="1.7">
                Seeing a car in person is always better. Call ahead so we can
                have the unit ready for a test drive, or send us a message on
                Facebook if you want photos of a specific part of the car.
              </Text>
            </Box>

            <Stack spacing={0} divider={<Box borderBottom="1px solid" borderColor="gray.200" />}>
              <Detail label="Address">
                {business.address}
                <Link href={mapsUrl} isExternal color="brand.600" fontSize="sm" display="block" mt={1}>
                  Open in Google Maps
                </Link>
              </Detail>
              <Detail label="Phone">
                {business.phones.map((phone) => (
                  <Link key={phone} href={`tel:+63${phone.replace(/\s/g, "").slice(1)}`} color="dark.800" fontWeight="600" display="block">
                    {phone}
                  </Link>
                ))}
              </Detail>
              <Detail label="Facebook">
                <Link href={business.facebookUrl} isExternal color="dark.800" fontWeight="600">
                  {business.facebookName}
                </Link>
              </Detail>
              <Detail label="Hours">{business.hours}</Detail>
            </Stack>

            <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
              <Text fontSize="sm" color="gray.700">
                Already reserved a unit? Log in to message our secretary
                directly and keep everything in one thread.
              </Text>
              <Button mt={3} size="sm" colorScheme="brand" onClick={() => navigate("/login")}>
                Log in
              </Button>
            </Box>
          </Stack>

          <Box flex="1" minH={{ base: "280px", lg: "460px" }} borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200" bg="gray.100">
            <iframe
              title={`Map to ${business.name}`}
              src={mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 280 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Box>
        </Flex>
      </Container>

      <CustomerFooter />
    </Flex>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Flex py={4} gap={4}>
      <Text w="88px" flexShrink={0} fontSize="sm" color="gray.500">
        {label}
      </Text>
      <Box fontSize="sm" color="dark.800">
        {children}
      </Box>
    </Flex>
  );
}
