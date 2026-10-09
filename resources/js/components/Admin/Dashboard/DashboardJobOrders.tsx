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
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import {
  getDashboardJobOrders,
  type DashboardJobOrder,
} from "../../../api/DashboardManagement/dashboardJobOrdersApi";

// Status Styles

const getStatusStyles = (status: string) => {
  switch (status) {
    case "Pending":
      return {
        bg: "warning.50",
        color: "warning.700",
        borderColor: "warning.100",
      };

    case "Ongoing":
      return {
        bg: "brand.50",
        color: "brand.700",
        borderColor: "brand.100",
      };

    case "Completed":
      return {
        bg: "success.50",
        color: "success.700",
        borderColor: "success.100",
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

// Dashboard Job Orders

export default function DashboardJobOrders() {
  const [jobOrders, setJobOrders] = useState<
    DashboardJobOrder[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Fetch Job Orders

  useEffect(() => {
    const fetchJobOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getDashboardJobOrders();

        setJobOrders(data);
      } catch (err) {
        console.error(
          "Failed to fetch job orders:",
          err
        );

        setError("Failed to load job orders.");
        setJobOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobOrders();
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
              as={WrenchScrewdriverIcon}
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
              Job Orders
            </Heading>

            <Text
              mt={0.5}
              fontSize="10px"
              color="gray.500"
              lineHeight="1.4"
            >
              Monitor assigned maintenance and service tasks.
            </Text>
          </Box>
        </Flex>
      </Flex>

      {/* TABLE No horizontal / vertical scrolling */}

      <TableContainer
        flex="1"
        w="full"
        overflow="hidden"
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
                px={1.5}
                fontSize="9px"
                color="gray.600"
                fontWeight="700"
              >
                Job No.
              </Th>

              <Th
                py={1.5}
                px={1.5}
                fontSize="9px"
                color="gray.600"
                fontWeight="700"
              >
                Customer
              </Th>

              <Th
                py={1.5}
                px={1.5}
                fontSize="9px"
                color="gray.600"
                fontWeight="700"
              >
                Vehicle
              </Th>

              <Th
                py={1.5}
                px={1.5}
                fontSize="9px"
                color="gray.600"
                fontWeight="700"
              >
                Service
              </Th>

              <Th
                py={1.5}
                px={1.5}
                fontSize="9px"
                color="gray.600"
                fontWeight="700"
              >
                Assigned To
              </Th>

              <Th
                py={1.5}
                px={1.5}
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
                  colSpan={6}
                  textAlign="center"
                  py={8}
                >
                  <Icon
                    as={WrenchScrewdriverIcon}
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
              jobOrders.length === 0 && (
                <Tr>
                  <Td
                    colSpan={6}
                    textAlign="center"
                    py={8}
                  >
                    <Icon
                      as={WrenchScrewdriverIcon}
                      boxSize={7}
                      color="gray.300"
                      mb={2}
                    />

                    <Text
                      fontSize="11px"
                      fontWeight="700"
                      color="gray.500"
                    >
                      No job orders found
                    </Text>

                    <Text
                      mt={1}
                      fontSize="9px"
                      color="gray.400"
                    >
                      No maintenance or service tasks
                      have been assigned yet.
                    </Text>
                  </Td>
                </Tr>
              )}

            {/* Job Orders */}

            {!loading &&
              !error &&
              jobOrders.map((job) => {
                const statusStyles =
                  getStatusStyles(job.status);

                return (
                  <Tr
                    key={job.job_order_id}
                    transition="background 0.15s ease"
                    _hover={{
                      bg: "brand.50",
                    }}
                  >
                    {/* Job No. */}

                    <Td
                      py={1.5}
                      px={1.5}
                      fontSize="9px"
                      fontWeight="700"
                      color="dark.800"
                      whiteSpace="nowrap"
                    >
                      {job.job_no}
                    </Td>

                    {/* Customer */}

                    <Td
                      py={1.5}
                      px={1.5}
                      fontSize="9px"
                      color="gray.700"
                      whiteSpace="nowrap"
                    >
                      {job.customer}
                    </Td>

                    {/* Vehicle */}

                    <Td
                      py={1.5}
                      px={1.5}
                      fontSize="9px"
                      color="gray.700"
                      whiteSpace="nowrap"
                    >
                      {job.vehicle}
                    </Td>

                    {/* Service */}

                    <Td
                      py={1.5}
                      px={1.5}
                      fontSize="9px"
                      color="gray.700"
                      whiteSpace="nowrap"
                    >
                      {job.service}
                    </Td>

                    {/* Assigned To */}

                    <Td
                      py={1.5}
                      px={1.5}
                      fontSize="9px"
                      color="gray.600"
                      whiteSpace="nowrap"
                    >
                      {job.assigned_to}
                    </Td>

                    {/* Status */}

                    <Td
                      py={1.5}
                      px={1.5}
                    >
                      <Badge
                        bg={statusStyles.bg}
                        color={statusStyles.color}
                        border="1px solid"
                        borderColor={
                          statusStyles.borderColor
                        }
                        rounded="full"
                        px={1.5}
                        py={0.5}
                        fontSize="8px"
                        fontWeight="700"
                        textTransform="none"
                      >
                        {job.status}
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