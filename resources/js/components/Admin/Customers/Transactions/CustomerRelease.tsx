import { useEffect, useState } from "react";

import {
    Badge,
    Box,
    Flex,
    Heading,
    HStack,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
} from "@chakra-ui/react";

import {
    getVehicleReleases,
    type VehicleRelease,
    type VehicleReleaseStatus,
} from "../../../../api/VehicleManagement/releaseApi";
import DetailsLink from "../../../Shared/Details/DetailsLink";

interface CustomerReleaseProps {
    customerId: number;
}

export default function CustomerRelease({
    customerId,
}: CustomerReleaseProps) {
    const [releases, setReleases] = useState<VehicleRelease[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReleases = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await getVehicleReleases();

                setReleases(
                    data.filter(
                        (release) =>
                            release.sale?.reservation?.customer_id ===
                            customerId
                    )
                );
            } catch (err) {
                console.error(
                    "Failed to load customer vehicle releases:",
                    err
                );

                setError("Failed to load release records.");
            } finally {
                setLoading(false);
            }
        };

        fetchReleases();
    }, [customerId]);

    const getStatusColor = (status: VehicleReleaseStatus) => {
        switch (status) {
            case "released":
                return "green";
            case "pending":
                return "yellow";
            case "cancelled":
                return "red";
            default:
                return "gray";
        }
    };

    const getVehicleName = (release: VehicleRelease): string => {
        const vehicle = release.sale?.reservation?.vehicle;

        if (!vehicle) {
            return "-";
        }

        return [
            vehicle.brand?.brand,
            vehicle.model?.model,
            vehicle.variant?.variant,
            vehicle.year_model,
        ]
            .filter(Boolean)
            .join(" ");
    };

    const formatDate = (value?: string | null) => {
        if (!value) {
            return "-";
        }

        return new Date(value).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <VStack align="stretch" spacing={5}>
            {/* Header */}
            <Box>
                <Heading size="sm">Vehicle Release History</Heading>

                <Text mt={1} fontSize="sm" color="gray.500">
                    Displays all vehicles that have been officially released to this
                    customer.
                </Text>
            </Box>

            {/* Release Table */}
            <Box
                borderWidth="1px"
                borderRadius="lg"
                overflowX="auto"
            >
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>No.</Th>
                            <Th>Release No.</Th>
                            <Th>Vehicle</Th>
                            <Th>Invoice No.</Th>
                            <Th>Release Date</Th>
                            <Th>Status</Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={6} textAlign="center" py={8}>
                                    <Flex justify="center">
                                        <Spinner
                                            size="sm"
                                            color="brand.500"
                                        />
                                    </Flex>
                                </Td>
                            </Tr>
                        ) : error ? (
                            <Tr>
                                <Td
                                    colSpan={6}
                                    textAlign="center"
                                    py={8}
                                    color="red.500"
                                >
                                    {error}
                                </Td>
                            </Tr>
                        ) : releases.length === 0 ? (
                            <Tr>
                                <Td colSpan={6} textAlign="center">
                                    No released vehicles found.
                                </Td>
                            </Tr>
                        ) : (
                            releases.map((release, index) => (
                                <Tr key={release.id}>
                                    <Td>{index + 1}</Td>

                                    <Td fontWeight="medium">
                                        {release.release_number}
                                    </Td>

                                    <Td><DetailsLink type="vehicle" id={release.sale?.reservation?.vehicle?.id}>{getVehicleName(release)}</DetailsLink></Td>

                                    <Td>
                                        {release.sale?.invoice_number ?? "-"}
                                    </Td>

                                    <Td>
                                        {formatDate(release.release_date)}
                                    </Td>

                                    <Td>
                                        <Badge
                                            colorScheme={getStatusColor(release.status)}
                                            px={2}
                                            py={1}
                                            borderRadius="md"
                                            textTransform="capitalize"
                                        >
                                            {release.status}
                                        </Badge>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </Box>

            <HStack justify="space-between">
                <Text fontSize="xs" color="gray.500">
                    Customer ID: {customerId}
                </Text>

                <Text fontSize="xs" color="gray.500">
                    Showing {releases.length} released vehicle
                    {releases.length !== 1 ? "s" : ""}
                </Text>
            </HStack>
        </VStack>
    );
}