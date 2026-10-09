import {
  Badge,
  Box,
  Flex,
  Heading,
  Icon,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import {
  getDashboardRecentReservations,
  type RecentReservation,
} from "../../../api/DashboardManagement/dashboardRecentReservationsApi";

// Status Styles

const getStatusStyles = (status: string) => {
  switch (status) {
    case "Approved":
      return {
        bg: "success.50",
        color: "success.700",
        borderColor: "success.100",
      };

    case "Pending":
      return {
        bg: "warning.50",
        color: "warning.700",
        borderColor: "warning.100",
      };

    case "Completed":
      return {
        bg: "brand.50",
        color: "brand.700",
        borderColor: "brand.100",
      };

    case "Cancelled":
      return {
        bg: "danger.50",
        color: "danger.700",
        borderColor: "danger.100",
      };

    default:
      return {
        bg: "gray.100",
        color: "gray.700",
        borderColor: "gray.200",
      };
  }
};

// Format Reservation Date

const formatReservationDate = (date: string) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Dashboard Recent Reservations

export default function DashboardRecentReservations() {
  const [reservations, setReservations] = useState<
    RecentReservation[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Fetch Recent Reservations

  useEffect(() => {
    const fetchRecentReservations = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getDashboardRecentReservations();

        setReservations(data);
      } catch (err) {
        console.error(
          "Failed to fetch recent reservations:",
          err
        );

        setError("Failed to load recent reservations.");
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentReservations();
  }, []);

  return (
    <Box
      bg="white"
      w="full"
      h={{
        base: "auto",
        lg: "310px",
      }}
      px={{
        base: 3,
        md: 4,
      }}
      py={{
        base: 3,
        md: 4,
      }}
      rounded="xl"
      layerStyle="panel"
      display="flex"
      flexDirection="column"
      transition="all 0.2s ease"
      _hover={{
        boxShadow:
          "0 4px 12px rgba(16, 24, 40, 0.08)",
      }}
    >
      {/* HEADER */}

      <Flex
        justify="space-between"
        align="center"
        mb={3}
      >
        <Flex
          align="center"
          gap={3}
          minW={0}
        >
          {/* Icon */}

          <Flex
            w="34px"
            h="34px"
            flexShrink={0}
            align="center"
            justify="center"
            bg="brand.500"
            color="white"
            rounded="lg"
          >
            <Icon
              as={CalendarDaysIcon}
              boxSize={5}
            />
          </Flex>

          {/* Title */}

          <Box minW={0}>
            <Heading
              size="sm"
              fontWeight="800"
              color="dark.900"
              lineHeight="1.3"
            >
              Recent Reservations
            </Heading>

            <Text
              mt={0.5}
              color="gray.500"
              fontSize="10px"
              lineHeight="1.4"
            >
              Latest vehicle reservation requests.
            </Text>
          </Box>
        </Flex>
      </Flex>

      {/* TABLE No horizontal / vertical scrolling */}

      <TableContainer
        flex="1"
        w="full"
      >
        <Table
          size="sm"
          variant="simple"
          w="full"
        >
          <Thead bg="gray.50">
            <Tr>
              <Th
                py={1.5}
                px={2}
                fontSize="9px"
                color="gray.600"
                fontWeight="700"
              >
                Reservation No.
              </Th>

              <Th
                py={1.5}
                px={2}
                fontSize="9px"
                color="gray.600"
                fontWeight="700"
              >
                Customer
              </Th>

              <Th
                py={1.5}
                px={2}
                fontSize="9px"
                color="gray.600"
                fontWeight="700"
              >
                Vehicle
              </Th>

              <Th
                py={1.5}
                px={2}
                fontSize="9px"
                color="gray.600"
                fontWeight="700"
              >
                Date
              </Th>

              <Th
                py={1.5}
                px={2}
                fontSize="9px"
                color="gray.600"
                fontWeight="700"
              >
                Status
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {/* Error */}

            {!loading && error && (
              <Tr>
                <Td
                  colSpan={5}
                  textAlign="center"
                  py={8}
                >
                  <Icon
                    as={CalendarDaysIcon}
                    boxSize={7}
                    color="gray.300"
                    mb={2}
                  />

                  <Text
                    fontSize="11px"
                    fontWeight="700"
                    color="red.500"
                  >
                    {error}
                  </Text>

                  <Text
                    mt={1}
                    fontSize="9px"
                    color="gray.400"
                  >
                    Please try again later.
                  </Text>
                </Td>
              </Tr>
            )}

            {/* Empty */}

            {!loading &&
              !error &&
              reservations.length === 0 && (
                <Tr>
                  <Td
                    colSpan={5}
                    textAlign="center"
                    py={8}
                  >
                    <Icon
                      as={CalendarDaysIcon}
                      boxSize={7}
                      color="gray.300"
                      mb={2}
                    />

                    <Text
                      fontSize="11px"
                      fontWeight="700"
                      color="gray.500"
                    >
                      No reservations found
                    </Text>

                    <Text
                      mt={1}
                      fontSize="9px"
                      color="gray.400"
                    >
                      No vehicle reservations have been
                      made yet.
                    </Text>
                  </Td>
                </Tr>
              )}

            {/* Reservations */}

            {!loading &&
              !error &&
              reservations.map((reservation) => {
                const statusStyles =
                  getStatusStyles(reservation.status);

                return (
                  <Tr
                    key={reservation.reservation_id}
                    transition="background 0.15s ease"
                    _hover={{
                      bg: "brand.50",
                    }}
                  >
                    {/* Reservation No. */}

                    <Td
                      py={1.5}
                      px={2}
                      fontSize="10px"
                      fontWeight="700"
                      color="dark.800"
                    >
                      {reservation.reservation_no}
                    </Td>

                    {/* Customer */}

                    <Td
                      py={1.5}
                      px={2}
                      fontSize="10px"
                      color="gray.700"
                    >
                      {reservation.customer}
                    </Td>

                    {/* Vehicle */}

                    <Td
                      py={1.5}
                      px={2}
                      fontSize="10px"
                      color="gray.700"
                    >
                      {reservation.vehicle}
                    </Td>

                    {/* Date */}

                    <Td
                      py={1.5}
                      px={2}
                      fontSize="10px"
                      color="gray.600"
                    >
                      {formatReservationDate(
                        reservation.date
                      )}
                    </Td>

                    {/* Status */}

                    <Td
                      py={1.5}
                      px={2}
                    >
                      <Badge
                        bg={statusStyles.bg}
                        color={statusStyles.color}
                        border="1px solid"
                        borderColor={
                          statusStyles.borderColor
                        }
                        rounded="full"
                        px={2}
                        py={0.5}
                        fontSize="9px"
                        fontWeight="700"
                        textTransform="none"
                      >
                        {reservation.status}
                      </Badge>
                    </Td>
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}