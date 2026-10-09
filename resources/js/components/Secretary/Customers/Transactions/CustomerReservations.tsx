import { useEffect, useState } from "react";

import {
    Badge,
    Box,
    Flex,
    Heading,
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
    getReservations,
    RESERVATION_STATUSES,
    type Reservation,
    type ReservationStatus,
} from "../../../../api/ReservationManagement/reservationApi";
import DetailsLink from "../../../Shared/Details/DetailsLink";

interface CustomerReservationsProps {
    customerId: number;
}

export default function CustomerReservations({
    customerId,
}: CustomerReservationsProps) {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await getReservations();

                setReservations(
                    data.filter(
                        (reservation) =>
                            reservation.customer_id === customerId
                    )
                );
            } catch (err) {
                console.error(
                    "Failed to load customer reservations:",
                    err
                );

                setError("Failed to load reservation records.");
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [customerId]);

    const getStatusColor = (status: ReservationStatus) => {
        switch (status) {
            case "reserved":
            case "completed":
                return "green";
            case "pending_reservation":
            case "pending_documents":
            case "pending_financing":
            case "pending_payment":
                return "yellow";
            case "rejected":
            case "cancelled":
                return "red";
            case "expired":
                return "gray";
            default:
                return "gray";
        }
    };

    const getStatusLabel = (status: ReservationStatus) => {
        return (
            RESERVATION_STATUSES.find(
                (item) => item.value === status
            )?.label ?? status
        );
    };

    const getVehicleName = (
        reservation: Reservation
    ): string => {
        const vehicle = reservation.vehicle;

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
            <Box>
                <Heading size="sm">Reservation History</Heading>

                <Text
                    mt={1}
                    color="gray.500"
                    fontSize="sm"
                >
                    Displays all vehicle reservation records made by this customer.
                </Text>
            </Box>

            <Box
                borderWidth="1px"
                borderRadius="lg"
                overflowX="auto"
            >
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>No.</Th>
                            <Th>Reservation No.</Th>
                            <Th>Vehicle</Th>
                            <Th>Purchase Option</Th>
                            <Th>Date Reserved</Th>
                            <Th>Reservation Expires</Th>
                            <Th>Status</Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={7} textAlign="center" py={8}>
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
                                    colSpan={7}
                                    textAlign="center"
                                    py={8}
                                    color="red.500"
                                >
                                    {error}
                                </Td>
                            </Tr>
                        ) : reservations.length === 0 ? (
                            <Tr>
                                <Td
                                    colSpan={7}
                                    textAlign="center"
                                >
                                    No reservation records found.
                                </Td>
                            </Tr>
                        ) : (
                            reservations.map((reservation, index) => (
                                <Tr key={reservation.id}>
                                    <Td>{index + 1}</Td>

                                    <Td fontWeight="medium">
                                        RES-
                                        {String(reservation.id).padStart(
                                            4,
                                            "0"
                                        )}
                                    </Td>

                                    <Td><DetailsLink type="vehicle" id={reservation.vehicle?.id ?? reservation.vehicle_id}>{getVehicleName(reservation)}</DetailsLink></Td>

                                    <Td textTransform="capitalize">
                                        {reservation.purchase_option}
                                    </Td>

                                    <Td>
                                        {formatDate(reservation.reserved_at)}
                                    </Td>

                                    <Td fontWeight="semibold">
                                        {formatDate(reservation.expires_at)}
                                    </Td>

                                    <Td>
                                        <Badge
                                            colorScheme={getStatusColor(
                                                reservation.reservation_status
                                            )}
                                            px={2}
                                            py={1}
                                            borderRadius="md"
                                            textTransform="capitalize"
                                        >
                                            {getStatusLabel(
                                                reservation.reservation_status
                                            )}
                                        </Badge>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </Box>

            <Text
                fontSize="xs"
                color="gray.500"
            >
                Customer ID: {customerId}
            </Text>
        </VStack>
    );
}