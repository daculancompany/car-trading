import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Flex,
  Heading,
  Icon,
  Text,
  Button,
} from "@chakra-ui/react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

import { ChartBarIcon } from "@heroicons/react/24/outline";

import {
  getDashboardTopSelling,
  type TopSellingVehicle,
  type SellingPeriod,
} from "../../../api/DashboardManagement/dashboardTopSellingApi";

const COLORS = [
  "#ED1C24",
  "#FB7185",
  "#FDA4AF",
  "#FECDD3",
  "#FFE4E6",
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
}) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <Box
      bg="dark.900"
      color="white"
      px={3}
      py={2}
      borderRadius="lg"
      boxShadow="0 6px 18px rgba(15, 17, 18, 0.20)"
    >
      <Text
        fontSize="xs"
        color="gray.300"
        fontWeight="600"
        mb={0.5}
      >
        Completed Sales
      </Text>

      <Text
        fontSize="sm"
        color="brand.300"
        fontWeight="800"
      >
        {payload[0].value} vehicles
      </Text>
    </Box>
  );
}

export default function DashboardTopSelling() {
  const [period, setPeriod] =
    useState<SellingPeriod>("Week");

  const [vehicles, setVehicles] =
    useState<TopSellingVehicle[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getDashboardTopSelling(period);

        setVehicles(response.top_selling_vehicles);
      } catch (error) {
        console.error(
          "Failed to load top-selling vehicles:",
          error
        );

        setVehicles([]);

        setError(
          "Failed to load top-selling vehicles."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTopSelling();
  }, [period]);

  /*
   * Use actual API data when available.
   *
   * When there are no completed sales, use
   * zero-value placeholders so the chart UI
   * remains visible.
   */
  const chartVehicles = useMemo(() => {
    if (vehicles.length > 0) {
      return [...vehicles].sort(
        (a, b) => b.sold - a.sold
      );
    }

    return [
      {
        vehicle_id: -1,
        vehicle: "No sales",
        sold: 0,
      },
    ];
  }, [vehicles]);

  /*
   * Sort vehicles by completed sales.
   *
   * This determines the color ranking.
   */
  const sortedVehicles = useMemo(() => {
    return [...vehicles].sort(
      (a, b) => b.sold - a.sold
    );
  }, [vehicles]);

  /*
   * Assign colors according to sales ranking.
   */
  const vehicleColors = useMemo(() => {
    return new Map(
      sortedVehicles.map((vehicle, index) => [
        vehicle.vehicle,
        COLORS[index % COLORS.length],
      ])
    );
  }, [sortedVehicles]);

  return (
    <Box
      bg="white"
      w="100%"
      h="340px"
      px={{ base: 4, md: 5 }}
      py={{ base: 4, md: 5 }}
      rounded="xl"
      layerStyle="panel"
      transition="all 0.2s ease"
      _hover={{
        boxShadow:
          "0 4px 12px rgba(16, 24, 40, 0.08)",
      }}
    >
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        mb={4}
        gap={3}
      >
        <Flex
          align="center"
          gap={3}
          minW={0}
        >
          <Flex
            w="38px"
            h="38px"
            flexShrink={0}
            align="center"
            justify="center"
            bg="brand.500"
            color="white"
            rounded="lg"
          >
            <Icon
              as={ChartBarIcon}
              boxSize={6}
            />
          </Flex>

          <Box minW={0}>
            <Heading
              size="sm"
              fontWeight="800"
              color="dark.900"
              lineHeight="1.3"
            >
              Top Selling Vehicles
            </Heading>

            <Text
              mt={1}
              fontSize="xs"
              color="gray.500"
              lineHeight="1.4"
            >
              Best-selling vehicles based on completed sales.
            </Text>
          </Box>
        </Flex>

        {/* Week / Month Buttons */}
        <Flex
          flexShrink={0}
          gap={1}
          bg="gray.100"
          p={1}
          rounded="lg"
        >
          {(["Week", "Month"] as SellingPeriod[]).map(
            (item) => {
              const isActive = period === item;

              return (
                <Button
                  key={item}
                  size="xs"
                  h="28px"
                  px={3}
                  rounded="md"
                  fontSize="11px"
                  fontWeight="700"
                  isDisabled={loading}
                  bg={
                    isActive
                      ? "brand.500"
                      : "transparent"
                  }
                  color={
                    isActive
                      ? "white"
                      : "gray.600"
                  }
                  _hover={{
                    bg: isActive
                      ? "brand.600"
                      : "gray.200",
                  }}
                  onClick={() => setPeriod(item)}
                >
                  {item}
                </Button>
              );
            }
          )}
        </Flex>
      </Flex>

      {/* Chart */}
      <Box
        h="250px"
        w="100%"
        position="relative"
      >
        {loading ? null : (
          <>
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={chartVehicles}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 20,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#363C40"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  domain={[0, "auto"]}
                  tick={{
                    fontSize: 13,
                    fill: "#1B1F22",
                    fontWeight: 600,
                  }}
                  axisLine={{
                    stroke: "#E5E7E9",
                  }}
                  tickLine={false}
                />

                <YAxis
                  dataKey="vehicle"
                  type="category"
                  width={130}
                  tick={{
                    fontSize: 14,
                    fill: "#1B1F22",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    fill: "rgba(253, 164, 175, 0.08)",
                  }}
                />

                <Bar
                  dataKey="sold"
                  radius={[0, 8, 8, 0]}
                  barSize={16}
                >
                  {chartVehicles.map((entry, index) => (
                    <Cell
                      key={entry.vehicle_id}
                      fill={
                        vehicles.length === 0
                          ? "#E5E7E9"
                          : vehicleColors.get(
                            entry.vehicle
                          ) ||
                          COLORS[
                          index % COLORS.length
                          ]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Empty state message */}
            {vehicles.length === 0 && !error && (
              <Flex
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                direction="column"
                align="center"
                pointerEvents="none"
              >
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  color="gray.500"
                  bg="white"
                  px={3}
                  py={1}
                  borderRadius="md"
                >
                  No completed sales
                </Text>

                <Text
                  fontSize="xs"
                  color="gray.400"
                  mt={1}
                >
                  Sales will appear here once completed.
                </Text>
              </Flex>
            )}

            {/* Error message */}
            {error && (
              <Flex
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                direction="column"
                align="center"
                bg="white"
                px={4}
                py={2}
                borderRadius="lg"
              >
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  color="red.500"
                >
                  Unable to load sales
                </Text>

                <Text
                  fontSize="xs"
                  color="gray.500"
                  mt={1}
                >
                  Please try again later.
                </Text>
              </Flex>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}