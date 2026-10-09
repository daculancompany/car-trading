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
    getDashboardFinancialPerformance,
    type FinancialPeriod,
    type FinancialData,
} from ".././../../api/DashboardManagement/dashboardFinancialPerformanceApi";

// Peso Formatter

const pesoFormatter = (value: number) => {
    if (value >= 1000000) {
        return `₱${(value / 1000000).toFixed(1)}M`;
    }

    if (value >= 1000) {
        return `₱${(value / 1000).toFixed(0)}K`;
    }

    return `₱${value.toLocaleString()}`;
};

// Custom Tooltip

function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
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
            py={2.5}
            rounded="lg"
            boxShadow="0 6px 18px rgba(15, 17, 18, 0.20)"
        >
            <Text
                fontSize="xs"
                color="gray.300"
                fontWeight="700"
                mb={2}
            >
                {label}
            </Text>

            {payload.map((item) => (
                <Flex
                    key={item.name}
                    justify="space-between"
                    align="center"
                    gap={5}
                    mb={1}
                >
                    <Flex
                        align="center"
                        gap={2}
                    >
                        <Box
                            w="7px"
                            h="7px"
                            rounded="full"
                            bg={item.color}
                        />

                        <Text
                            fontSize="xs"
                            color="gray.300"
                        >
                            {item.name}
                        </Text>
                    </Flex>

                    <Text
                        fontSize="xs"
                        fontWeight="800"
                        color="white"
                    >
                        ₱{Number(item.value).toLocaleString()}
                    </Text>
                </Flex>
            ))}
        </Box>
    );
}

// Main Component

export default function DashboardFinancialPerformance() {
    // State

    const [period, setPeriod] =
        useState<FinancialPeriod>("Month");

    const [financialData, setFinancialData] =
        useState<FinancialData[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    // Fetch Financial Data

    useEffect(() => {
        const fetchFinancialPerformance = async () => {
            try {
                setLoading(true);
                setError(null);

                const result =
                    await getDashboardFinancialPerformance(
                        period
                    );

                setFinancialData(
                    result.financial_data
                );
            } catch (err: any) {
                console.error(
                    "Financial performance error:",
                    err?.response?.data || err
                );

                setError(
                    err?.response?.data?.message ||
                        "Failed to load financial performance."
                );

                setFinancialData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFinancialPerformance();
    }, [period]);

    // Render

    return (
        <Box
            bg="white"
            w="100%"
            h={{ base: "340px", md: "340px" }}
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
            {/* HEADER */}

            <Flex
                justify="space-between"
                align={{ base: "start", md: "center" }}
                gap={3}
                mb={3}
            >
                {/* TITLE */}

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
                            Financial Performance
                        </Heading>

                        <Text
                            mt={1}
                            fontSize="xs"
                            color="gray.500"
                            lineHeight="1.4"
                        >
                            Track sales, expenses, and profit.
                        </Text>
                    </Box>
                </Flex>

                {/* PERIOD BUTTONS */}

                <Flex
                    flexShrink={0}
                    gap={1}
                    bg="gray.100"
                    p={1}
                    rounded="lg"
                >
                    {(["Week", "Month"] as FinancialPeriod[]).map(
                        (item) => {
                            const isActive =
                                period === item;

                            return (
                                <Button
                                    key={item}
                                    size="xs"
                                    h="27px"
                                    px={3}
                                    rounded="md"
                                    fontSize="10px"
                                    fontWeight="700"
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
                                    onClick={() =>
                                        setPeriod(item)
                                    }
                                    isDisabled={loading}
                                >
                                    {item}
                                </Button>
                            );
                        }
                    )}
                </Flex>
            </Flex>

            {/* LEGEND */}

            <Flex
                mb={2}
                gap={{ base: 3, md: 4 }}
                flexWrap="wrap"
            >
                <Flex
                    align="center"
                    gap={2}
                >
                    <Box
                        w="7px"
                        h="7px"
                        rounded="full"
                        bg="brand.500"
                    />

                    <Text
                        fontSize="10px"
                        color="gray.600"
                        fontWeight="600"
                    >
                        Total Sales
                    </Text>
                </Flex>

                <Flex
                    align="center"
                    gap={2}
                >
                    <Box
                        w="7px"
                        h="7px"
                        rounded="full"
                        bg="warning.500"
                    />

                    <Text
                        fontSize="10px"
                        color="gray.600"
                        fontWeight="600"
                    >
                        Total Expenses
                    </Text>
                </Flex>

                <Flex
                    align="center"
                    gap={2}
                >
                    <Box
                        w="7px"
                        h="7px"
                        rounded="full"
                        bg="success.500"
                    />

                    <Text
                        fontSize="10px"
                        color="gray.600"
                        fontWeight="600"
                    >
                        Profit
                    </Text>
                </Flex>
            </Flex>

            {/* CHART AREA */}

            <Box
                h={{ base: "230px", md: "235px" }}
                w="100%"
            >
                {/* ERROR */}

                {!loading && error && (
                    <Flex
                        w="100%"
                        h="100%"
                        align="center"
                        justify="center"
                        px={4}
                    >
                        <Text
                            fontSize="sm"
                            color="danger.600"
                            fontWeight="600"
                            textAlign="center"
                        >
                            {error}
                        </Text>
                    </Flex>
                )}

                {/* CHART */}

                {!loading &&
                    !error &&
                    financialData.length > 0 && (
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <LineChart
                                data={financialData}
                                margin={{
                                    top: 5,
                                    right: 8,
                                    left: 0,
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
                                        fontSize: 10,
                                        fill: "#62696E",
                                        fontWeight: 600,
                                    }}
                                    axisLine={{
                                        stroke: "#E5E7E9",
                                    }}
                                    tickLine={false}
                                />

                                <YAxis
                                    tickFormatter={pesoFormatter}
                                    tick={{
                                        fontSize: 9,
                                        fill: "#62696E",
                                        fontWeight: 600,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={55}
                                    tickMargin={4}
                                />

                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{
                                        stroke: "#FDA4AF",
                                        strokeWidth: 1,
                                    }}
                                />

                                {/* SALES */}

                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    name="Total Sales"
                                    stroke="#ED1C24"
                                    strokeWidth={2.5}
                                    dot={{
                                        r: 3,
                                        fill: "#ED1C24",
                                        strokeWidth: 0,
                                    }}
                                    activeDot={{
                                        r: 5,
                                    }}
                                />

                                {/* EXPENSES */}

                                <Line
                                    type="monotone"
                                    dataKey="expenses"
                                    name="Total Expenses"
                                    stroke="#F59E0B"
                                    strokeWidth={2.5}
                                    dot={{
                                        r: 3,
                                        fill: "#F59E0B",
                                        strokeWidth: 0,
                                    }}
                                    activeDot={{
                                        r: 5,
                                    }}
                                />

                                {/* PROFIT */}

                                <Line
                                    type="monotone"
                                    dataKey="profit"
                                    name="Profit"
                                    stroke="#22C55E"
                                    strokeWidth={2.5}
                                    dot={{
                                        r: 3,
                                        fill: "#22C55E",
                                        strokeWidth: 0,
                                    }}
                                    activeDot={{
                                        r: 5,
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}

                {/* EMPTY DATA */}

                {!loading &&
                    !error &&
                    financialData.length === 0 && (
                        <Flex
                            w="100%"
                            h="100%"
                            align="center"
                            justify="center"
                        >
                            <Text
                                fontSize="sm"
                                color="gray.500"
                            >
                                No financial data available.
                            </Text>
                        </Flex>
                    )}
            </Box>
        </Box>
    );
}

