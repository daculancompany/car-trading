import { useEffect, useState } from "react";

import {
  Box,
  Flex,
  Heading,
  Text,
  Icon,
} from "@chakra-ui/react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { TruckIcon } from "@heroicons/react/24/outline";

import {
  getDashboardVehicleStatus,
  type VehicleStatusData,
} from "../../../api/DashboardManagement/dashboardVehicleStatusApi";

const COLORS = [
  "#ED1C24",
  "#F59E0B",
  "#22C55E",
  "#EF4444",
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
  }>;
}) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const item = payload[0];

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
        {item.name}
      </Text>

      <Text
        fontSize="sm"
        color="brand.300"
        fontWeight="800"
      >
        {item.value} vehicles
      </Text>
    </Box>
  );
}

function CustomLegend({
  payload,
}: {
  payload?: Array<{
    value: string;
    color: string;
  }>;
}) {
  if (!payload) {
    return null;
  }

  return (
    <Flex
      justify="center"
      align="center"
      flexWrap="wrap"
      gap={2}
      mt={0}
    >
      {payload.map((entry) => (
        <Flex
          key={entry.value}
          align="center"
          gap={1.5}
        >
          <Box
            w="7px"
            h="7px"
            borderRadius="full"
            bg={entry.color}
          />

          <Text
            fontSize="xs"
            color="gray.600"
            fontWeight="500"
          >
            {entry.value}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}

export default function DashboardVehicleStatus() {
  const [vehicleStatusData, setVehicleStatusData] =
    useState<VehicleStatusData[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const fetchVehicleStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getDashboardVehicleStatus();

        setVehicleStatusData(data);
      } catch (error) {
        console.error(
          "Failed to load vehicle status:",
          error
        );

        setError(
          "Failed to load vehicle status."
        );

        setVehicleStatusData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleStatus();
  }, []);

  /*
   * Keep all four statuses visible even when
   * their database count is zero.
   */
  const chartData: VehicleStatusData[] = [
    {
      name: "Available",
      value:
        vehicleStatusData.find(
          (item) => item.name === "Available"
        )?.value ?? 0,
    },
    {
      name: "Reserved",
      value:
        vehicleStatusData.find(
          (item) => item.name === "Reserved"
        )?.value ?? 0,
    },
    {
      name: "Sold",
      value:
        vehicleStatusData.find(
          (item) => item.name === "Sold"
        )?.value ?? 0,
    },
    {
      name: "Maintenance",
      value:
        vehicleStatusData.find(
          (item) => item.name === "Maintenance"
        )?.value ?? 0,
    },
  ];

  /*
   * Recharts Pie does not display a useful chart
   * when every value is zero. Use a visual placeholder
   * only in that situation.
   *
   * The placeholder does NOT represent real vehicles.
   */
  const hasVehicles = chartData.some(
    (item) => item.value > 0
  );

  const displayData = hasVehicles
    ? chartData
    : chartData.map((item) => ({
      ...item,
      value: 1,
    }));

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
        align="center"
        gap={3}
        mb={3}
      >
        <Flex
          w="36px"
          h="36px"
          flexShrink={0}
          align="center"
          justify="center"
          bg="brand.500"
          color="white"
          rounded="lg"
        >
          <Icon
            as={TruckIcon}
            boxSize={5}
          />
        </Flex>

        <Box minW={0}>
          <Heading
            size="sm"
            fontWeight="800"
            color="dark.900"
            lineHeight="1.3"
          >
            Vehicle Status
          </Heading>

          <Text
            mt={1}
            fontSize="xs"
            color="gray.500"
            lineHeight="1.4"
          >
            Distribution of vehicles by current status.
          </Text>
        </Box>
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
              <PieChart>
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="43%"
                  outerRadius={68}
                  innerRadius={36}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  label={
                    hasVehicles
                      ? ({ percent }) =>
                        `${(
                          (percent ?? 0) * 100
                        ).toFixed(0)}%`
                      : false
                  }
                  labelLine={false}
                >
                  {displayData.map(
                    (entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          hasVehicles
                            ? COLORS[
                            index %
                            COLORS.length
                            ]
                            : "#E5E7E9"
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip
                  content={
                    <CustomTooltip />
                  }
                />

                <Legend
                  verticalAlign="bottom"
                  content={
                    <CustomLegend />
                  }
                />
              </PieChart>
            </ResponsiveContainer>

            {/* No vehicle data */}
            {!hasVehicles && !error && (
              <Flex
                position="absolute"
                top="43%"
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
                  whiteSpace="nowrap"
                >
                  No vehicles
                </Text>

                <Text
                  fontSize="xs"
                  color="gray.400"
                  mt={1}
                  whiteSpace="nowrap"
                >
                  No inventory data available.
                </Text>
              </Flex>
            )}

            {/* API error */}
            {error && (
              <Flex
                position="absolute"
                top="43%"
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
                  whiteSpace="nowrap"
                >
                  Unable to load status
                </Text>

                <Text
                  fontSize="xs"
                  color="gray.500"
                  mt={1}
                  whiteSpace="nowrap"
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