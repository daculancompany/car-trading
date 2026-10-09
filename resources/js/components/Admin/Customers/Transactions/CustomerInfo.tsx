import {
    Badge,
    Box,
    Divider,
    Grid,
    GridItem,
    Heading,
    SimpleGrid,
    Text,
    VStack,
} from "@chakra-ui/react";

import type { Customer } from "../../../../api/UserManagement/customerApi";

interface CustomerInfoProps {
    customer: Customer;
}

interface InfoItemProps {
    label: string;
    value?: string | number | null;
}

function InfoItem({ label, value }: InfoItemProps) {
    return (
        <Box>
            <Text
                fontSize="sm"
                color="gray.500"
                fontWeight="medium"
                mb={1}
            >
                {label}
            </Text>

            <Text fontWeight="semibold">
                {value || "-"}
            </Text>
        </Box>
    );
}

export default function CustomerInfo({
    customer,
}: CustomerInfoProps) {
    const fullName = [
        customer.first_name,
        customer.middle_name,
        customer.last_name,
    ]
        .filter(Boolean)
        .join(" ");

    const isActive = customer.is_active;

    return (
        <VStack
            align="stretch"
            spacing={6}
        >
            {/* Personal Information */}
            <Box
                borderWidth="1px"
                borderRadius="lg"
                p={5}
            >
                <Heading
                    size="sm"
                    mb={4}
                >
                    Personal Information
                </Heading>

                <SimpleGrid
                    columns={{ base: 1, md: 2 }}
                    spacing={6}
                >
                    <InfoItem
                        label="Full Name"
                        value={fullName}
                    />

                    <InfoItem
                        label="Username"
                        value={customer.user?.username}
                    />

                    <InfoItem
                        label="Email Address"
                        value={customer.user?.email}
                    />

                    <InfoItem
                        label="Mobile Number"
                        value={customer.mobile_number}
                    />

                    <InfoItem
                        label="Facebook"
                        value={customer.facebook}
                    />

                    <InfoItem
                        label="Address"
                        value={customer.address}
                    />
                </SimpleGrid>
            </Box>

            {/* Account Information */}
            <Box
                borderWidth="1px"
                borderRadius="lg"
                p={5}
            >
                <Heading
                    size="sm"
                    mb={4}
                >
                    Account Information
                </Heading>

                <Grid
                    templateColumns={{
                        base: "1fr",
                        md: "repeat(2, 1fr)",
                    }}
                    gap={6}
                >
                    <GridItem>
                        <Text
                            fontSize="sm"
                            color="gray.500"
                            mb={1}
                        >
                            Customer ID
                        </Text>

                        <Text fontWeight="semibold">
                            CST-{String(customer.id).padStart(4, "0")}
                        </Text>
                    </GridItem>

                    <GridItem>
                        <Text
                            fontSize="sm"
                            color="gray.500"
                            mb={1}
                        >
                            Status
                        </Text>

                        <Badge
                            colorScheme={
                                isActive ? "green" : "red"
                            }
                            px={4}
                            py={2}
                            rounded="md"
                            fontSize="sm"
                            textTransform="capitalize"
                        >
                            {isActive ? "Active" : "Inactive"}
                        </Badge>
                    </GridItem>

                    <GridItem>
                        <Text
                            fontSize="sm"
                            color="gray.500"
                            mb={1}
                        >
                            Registered On
                        </Text>

                        <Text fontWeight="semibold">
                            {customer.created_at
                                ? new Date(
                                    customer.created_at
                                ).toLocaleDateString()
                                : "-"}
                        </Text>
                    </GridItem>

                    <GridItem>
                        <Text
                            fontSize="sm"
                            color="gray.500"
                            mb={1}
                        >
                            Last Updated
                        </Text>

                        <Text fontWeight="semibold">
                            {customer.updated_at
                                ? new Date(
                                    customer.updated_at
                                ).toLocaleDateString()
                                : "-"}
                        </Text>
                    </GridItem>
                </Grid>
            </Box>

            <Divider />

            {/* Notes */}
            <Box
                borderWidth="1px"
                borderRadius="lg"
                p={5}
            >
                <Heading
                    size="sm"
                    mb={3}
                >
                    Notes
                </Heading>

                <Text
                    color="gray.600"
                    fontSize="sm"
                >
                    This tab displays the customer's personal and account
                    information. Reservation history, payment records, and
                    vehicle release information are available in their
                    respective tabs.
                </Text>
            </Box>
        </VStack>
    );
}