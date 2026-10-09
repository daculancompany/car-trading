import {
    Box,
    Container,
    Flex,
    Link,
    SimpleGrid,
    Stack,
    Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import { business, mapsUrl } from "../../../config/business";

export default function CustomerFooter() {
    return (
        <Box
            as="footer"
            id="about-us"
            scrollMarginTop="80px"
            bg="dark.800"
            color="gray.300"
            borderTop="3px solid"
            borderColor="brand.600"
            w="full"
        >
            <Container maxW="1300px" px={{ base: 4, sm: 6, md: 8 }} py={{ base: 8, md: 10 }}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 10 }}>
                    <Stack spacing={2}>
                        <Text color="white" fontWeight="800" fontSize="lg" letterSpacing="-0.01em">
                            {business.name}
                        </Text>
                        <Text fontSize="sm" lineHeight="1.7" maxW="320px" color="gray.300">
                            Second-hand cars in {business.area}. Cash or bank
                            financing, with after-sales service at our own shop.
                        </Text>
                    </Stack>

                    <Stack spacing={1.5} fontSize="sm" id="contact-us">
                        <Text color="white" fontWeight="700" mb={1}>Visit</Text>
                        <Text color="gray.300">{business.address}</Text>
                        <Text color="gray.300">{business.hours}</Text>
                        <Link href={mapsUrl} isExternal color="brand.300">Get directions</Link>
                    </Stack>

                    <Stack spacing={1.5} fontSize="sm">
                        <Text color="white" fontWeight="700" mb={1}>Talk to us</Text>
                        <Link href={business.phoneHref}>{business.phone}</Link>
                        <Link href={business.facebookUrl} isExternal>Facebook: {business.facebookName}</Link>
                        <Link as={RouterLink} to="/login" color="brand.300">Log in</Link>
                    </Stack>
                </SimpleGrid>

                <Flex
                    mt={8}
                    pt={5}
                    borderTop="1px solid"
                    borderColor="dark.600"
                    justify="space-between"
                    gap={3}
                    direction={{ base: "column", sm: "row" }}
                    fontSize="xs"
                    color="gray.500"
                >
                    <Text color="gray.500">© {new Date().getFullYear()} {business.name}</Text>
                    <Flex gap={4}>
                        <Link as={RouterLink} to="/browse-vehicles">Cars for sale</Link>
                        <Link as={RouterLink} to="/about">About</Link>
                        <Link as={RouterLink} to="/contact">Contact</Link>
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
}
