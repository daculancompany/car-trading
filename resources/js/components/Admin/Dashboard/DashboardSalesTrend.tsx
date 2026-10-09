import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { ChartBarIcon } from "@heroicons/react/24/outline";

import {
  getDashboardSalesTrend,
  type SalesData,
  type SalesPeriod,
} from "../../../api/DashboardManagement/dashboardSalesTrendApi";

const pesoFormatter = (value: number) =>
  `₱${value.toLocaleString()}`;

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
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
        fontWeight="600"
        color="gray.300"
        mb={0.5}
      >
        {label}
      </Text>

      <Text
        fontSize="sm"
        fontWeight="800"
        color="brand.300"
      >
        {pesoFormatter(Number(payload[0].value))}
      </Text>
    </Box>
  );
}

export default function DashboardSalesChart() {
  const [period, setPeriod] =
    useState<SalesPeriod>("1 Year");

  const [salesData, setSalesData] =
    useState<SalesData[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const fetchSalesTrend = async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getDashboardSalesTrend(period);

        setSalesData(response.sales_data);
      } catch (error) {
        console.error(
          "Failed to load sales trend:",
          error
        );

        setError(
          "Failed to load sales trend data."
        );

        setSalesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesTrend();
  }, [period]);

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
      <Flex
        justify="space-between"
        align={{
          base: "flex-start",
          md: "center",
        }}
        direction={{
          base: "column",
          md: "row",
        }}
        gap={3}
        mb={3}
      >
        {/* Header */}
        <Flex
          align="center"
          gap={3}
          minW={0}
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
              as={ChartBarIcon}
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
              Sales Trend
            </Heading>

            <Text
              fontSize="xs"
              color="gray.500"
              mt={1}
            >
              Sales performance over time.
            </Text>
          </Box>
        </Flex>

        {/* Period Buttons */}
        <Flex
          bg="gray.50"
          border="1px solid"
          borderColor="gray.100"
          rounded="lg"
          p={1}
          gap={1}
          flexShrink={0}
          w={{
            base: "100%",
            md: "auto",
          }}
          overflowX="auto"
        >
          {(
            [
              "7 Days",
              "30 Days",
              "6 Months",
              "1 Year",
            ] as SalesPeriod[]
          ).map((item) => (
            <Button
              key={item}
              size="xs"
              minW={{
                base: "auto",
                md: "68px",
              }}
              px={2}
              h="26px"
              rounded="md"
              fontSize="10px"
              fontWeight="700"
              flexShrink={0}
              isDisabled={loading}
              bg={
                period === item
                  ? "brand.500"
                  : "transparent"
              }
              color={
                period === item
                  ? "white"
                  : "gray.600"
              }
              _hover={{
                bg:
                  period === item
                    ? "brand.600"
                    : "brand.50",
                color:
                  period === item
                    ? "white"
                    : "brand.500",
              }}
              onClick={() => setPeriod(item)}
            >
              {item}
            </Button>
          ))}
        </Flex>
      </Flex>

      {/* Chart */}
      <Box
        h={{
          base: "235px",
          md: "240px",
        }}
        w="100%"
      >
        {loading ? null : error ? (
          <Flex
            h="100%"
            align="center"
            justify="center"
          >
            <Text
              fontSize="sm"
              color="red.500"
            >
              {error}
            </Text>
          </Flex>
        ) : salesData.length === 0 ? (
          <Flex
            h="100%"
            align="center"
            justify="center"
          >
            <Text
              fontSize="sm"
              color="gray.500"
            >
              No sales data available.
            </Text>
          </Flex>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={salesData}
              margin={{
                top: 5,
                right: 10,
                left: 5,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7E9"
                vertical={false}
              />

              <XAxis
                dataKey="period"
                tick={{
                  fontSize: 11,
                  fill: "#1B1F22",
                }}
                axisLine={{
                  stroke: "#ED1C24",
                }}
                tickLine={false}
              />

              <YAxis
                tickFormatter={(value) =>
                  `₱${value / 1000} k`
                }
                tick={{
                  fontSize: 10,
                  fill: "#1B1F22",
                }}
                axisLine={false}
                tickLine={false}
                width={65}
                tickMargin={5}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#15181A",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />

              <Line
                type="monotone"
                dataKey="sales"
                stroke="#ED1C24"
                strokeWidth={2.5}
                dot={{
                  r: 3,
                  fill: "#ED1C24",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5,
                  fill: "#ED1C24",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
}