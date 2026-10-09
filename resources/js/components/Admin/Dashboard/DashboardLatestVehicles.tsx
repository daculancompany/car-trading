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
import { TruckIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import {
  getDashboardLatestVehicles,
  type LatestVehicle,
} from "../../../api/DashboardManagement/dashboardLatestVehiclesApi";

// Status Styles

const getStatusStyles = (status: string) => {
  switch (status) {
    case "Available":
      return {
        bg: "success.50",
        color: "success.700",
        borderColor: "success.100",
      };

    case "Reserved":
      return {
        bg: "warning.50",
        color: "warning.700",
        borderColor: "warning.100",
      };

    case "Sold":
      return {
        bg: "gray.100",
        color: "dark.700",
        borderColor: "gray.200",
      };

    case "Maintenance":
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

// Format Price

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(price);
};

// Dashboard Latest Vehicles

export default function DashboardLatestVehicles() {
  const [latestVehicles, setLatestVehicles] = useState<LatestVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Latest Vehicles

  useEffect(() => {
    const fetchLatestVehicles = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getDashboardLatestVehicles();

        setLatestVehicles(data);
      } catch (err) {
        console.error("Failed to fetch latest vehicles:", err);

        setError("Failed to load latest vehicles.");
        setLatestVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestVehicles();
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
        boxShadow: "0 4px 12px rgba(16, 24, 40, 0.08)",
      }}
    >
      {/* HEADER */}

      <Flex justify="space-between" align="center" mb={3}>
        <Flex align="center" gap={3} minW={0}>
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
            <Icon as={TruckIcon} boxSize={5} />
          </Flex>

          {/* Title */}

          <Box minW={0}>
            <Heading
              size="sm"
              fontWeight="800"
              color="dark.900"
              lineHeight="1.3"
            >
              Latest Vehicles
            </Heading>

            <Text
              mt={0.5}
              fontSize="10px"
              color="gray.500"
              lineHeight="1.4"
            >
              Recently added vehicles in the inventory.
            </Text>
          </Box>
        </Flex>
      </Flex>

      {/* TABLE No scrolling */}

      <TableContainer
        flex="1"
        w="full"
        overflow="hidden"
      >
        <Table size="sm" variant="simple" w="full">
          <Thead bg="gray.50">
            <Tr>
              <Th
                py={1.5}
                px={2}
                fontSize="9px"
                color="gray.600"
                fontWeight="700"
              >
                Stock No.
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
                isNumeric
                fontSize="9px"
                color="gray.600"
                fontWeight="700"
              >
                Price
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
                <Td colSpan={4} textAlign="center" py={8}>
                  <Text
                    fontSize="11px"
                    fontWeight="600"
                    color="red.500"
                  >
                    {error}
                  </Text>

                  <Text
                    mt={1}
                    fontSize="9px"
                    color="gray.500"
                  >
                    Please try again later.
                  </Text>
                </Td>
              </Tr>
            )}

            {/* Empty */}

            {!loading && !error && latestVehicles.length === 0 && (
              <Tr>
                <Td colSpan={4} textAlign="center" py={8}>
                  <Icon
                    as={TruckIcon}
                    boxSize={7}
                    color="gray.300"
                    mb={2}
                  />

                  <Text
                    fontSize="11px"
                    fontWeight="700"
                    color="gray.500"
                  >
                    No vehicles found
                  </Text>

                  <Text
                    mt={1}
                    fontSize="9px"
                    color="gray.400"
                  >
                    No vehicles have been added yet.
                  </Text>
                </Td>
              </Tr>
            )}

            {/* Vehicles */}

            {!loading &&
              !error &&
              latestVehicles.map((vehicle) => {
                const statusStyles = getStatusStyles(
                  vehicle.status
                );

                return (
                  <Tr
                    key={vehicle.vehicle_id}
                    transition="background 0.15s ease"
                    _hover={{
                      bg: "brand.50",
                    }}
                  >
                    {/* Stock No. */}

                    <Td
                      py={1.5}
                      px={2}
                      fontSize="10px"
                      fontWeight="700"
                      color="dark.800"
                      whiteSpace="nowrap"
                    >
                      {vehicle.stock_no}
                    </Td>

                    {/* Vehicle */}

                    <Td
                      py={1.5}
                      px={2}
                      fontSize="10px"
                      color="gray.700"
                      whiteSpace="nowrap"
                    >
                      {vehicle.vehicle}
                    </Td>

                    {/* Price */}

                    <Td
                      py={1.5}
                      px={2}
                      isNumeric
                      fontSize="10px"
                      fontWeight="700"
                      color="dark.800"
                      whiteSpace="nowrap"
                    >
                      {formatPrice(vehicle.price)}
                    </Td>

                    {/* Status */}

                    <Td py={1.5} px={2}>
                      <Badge
                        bg={statusStyles.bg}
                        color={statusStyles.color}
                        border="1px solid"
                        borderColor={statusStyles.borderColor}
                        rounded="full"
                        px={1.5}
                        py={0.5}
                        fontSize="8px"
                        fontWeight="700"
                        textTransform="none"
                      >
                        {vehicle.status}
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