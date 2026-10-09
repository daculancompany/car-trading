import {
    Box,
    Flex,
    Grid,
    Heading,
    HStack,
    Icon,
    Stat,
    StatLabel,
    StatNumber,
    Text,
} from "@chakra-ui/react";

import {
    CalendarDaysIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    BanknotesIcon,
    CreditCardIcon,
} from "@heroicons/react/24/outline";

import { useEffect, useState } from "react";

import {
    getDashboardReservationPipeline,
    type DashboardReservationPipeline as DashboardReservationPipelineData,
} from "../../../api/DashboardManagement/dashboardReservationPipelineApi";

// Types

interface PipelineCardProps {
    label: string;
    value: number;
    icon: typeof ClockIcon;

    // Card color
    cardBg: string;

    // Icon color
    iconBg: string;
    iconColor: string;
}

// Reusable Stat Card

function PipelineStatCard({
    label,
    value,
    icon,
    cardBg,
    iconBg,
    iconColor,
}: PipelineCardProps) {
    return (
        <Box
            bg={cardBg}
            px={3}
            py={3}
            rounded="lg"
            layerStyle="panel"
            transition="all 0.2s ease"
            _hover={{
                transform: "translateY(-2px)",
                boxShadow:
                    "0 4px 12px rgba(16, 24, 40, 0.08)",
            }}
        >
            <Flex
                justify="space-between"
                align="center"
                gap={2}
            >
                {/* LABEL + VALUE */}

                <Stat minW={0}>
                    <StatLabel
                        color="gray.600"
                        fontSize="xs"
                        fontWeight="400"
                        mb={0.5}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        {label}
                    </StatLabel>

                    <StatNumber
                        color="dark.600"
                        fontSize={{
                            base: "md",
                            md: "lg",
                        }}
                        fontWeight="700"
                        lineHeight="1.2"
                        letterSpacing="-0.02em"
                        whiteSpace="nowrap"
                    >
                        {value}
                    </StatNumber>
                </Stat>

                {/* STATUS ICON */}

                <Flex
                    w="38px"
                    h="38px"
                    flexShrink={0}
                    align="center"
                    justify="center"
                    bg={iconBg}
                    color={iconColor}
                    rounded="lg"
                >
                    <Icon
                        as={icon}
                        boxSize={5}
                    />
                </Flex>
            </Flex>
        </Box>
    );
}

// Main Component

const DashboardReservationPipeline = () => {
    // State

    const [data, setData] =
        useState<DashboardReservationPipelineData | null>(
            null
        );

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    // Fetch Dashboard Data

    useEffect(() => {
        const fetchReservationPipeline = async () => {
            try {
                setLoading(true);
                setError(null);

                const result =
                    await getDashboardReservationPipeline();

                setData(result);
            } catch (err: any) {
                console.error(
                    "Dashboard reservation pipeline error:",
                    err?.response?.data || err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to load reservation pipeline statistics."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReservationPipeline();
    }, []);

    // Loading State

    if (loading) {
        return null;
    }

    // Error State

    if (error || !data) {
        return (
            <Box
                w="full"
                bg="danger.50"
                rounded="xl"
                px={4}
                py={4}
            >
                <Text
                    fontSize="sm"
                    color="danger.600"
                    fontWeight="600"
                >
                    {error ||
                        "Unable to load reservation pipeline."}
                </Text>
            </Box>
        );
    }

    // Reservation Pipeline

    const reservationPipeline: PipelineCardProps[] = [
        {
            label: "Pending",
            value: data.reservation_pipeline.pending,
            icon: ClockIcon,

            cardBg: "warning.50",
            iconBg: "warning.100",
            iconColor: "warning.600",
        },

        {
            label: "Approved",
            value: data.reservation_pipeline.approved,
            icon: CheckCircleIcon,

            cardBg: "success.50",
            iconBg: "success.100",
            iconColor: "success.600",
        },

        {
            label: "Completed",
            value: data.reservation_pipeline.completed,
            icon: CheckCircleIcon,

            cardBg: "brand.50",
            iconBg: "brand.100",
            iconColor: "brand.600",
        },

        {
            label: "Cancelled",
            value: data.reservation_pipeline.cancelled,
            icon: XCircleIcon,

            cardBg: "danger.50",
            iconBg: "danger.100",
            iconColor: "danger.600",
        },
    ];

    // Payment Methods

    const paymentMethods: PipelineCardProps[] = [
        {
            label: "Cash",
            value: data.payment_methods.cash,
            icon: BanknotesIcon,

            cardBg: "success.50",
            iconBg: "success.100",
            iconColor: "success.600",
        },

        {
            label: "Financing",
            value: data.payment_methods.financing,
            icon: CreditCardIcon,

            cardBg: "brand.50",
            iconBg: "brand.100",
            iconColor: "brand.600",
        },
    ];

    // Totals

    const totalReservations =
        data.reservation_pipeline.total;

    const totalPayments =
        data.payment_methods.total;

    // Render

    return (
        <Grid
            templateColumns={{
                base: "1fr",
                lg: "repeat(2, 1fr)",
            }}
            gap={{ base: 2, md: 3 }}
            w="full"
        >
            {/* RESERVATION PIPELINE */}

            <Box
                bg="white"
                rounded="xl"
                overflow="hidden"
                
                transition="all 0.2s ease"
                _hover={{
                    boxShadow:
                        "0 4px 12px rgba(16, 24, 40, 0.08)",
                }}
            >
                {/* Header */}

                <Flex
                    align="center"
                    gap={4}
                    px={{ base: 3, md: 4 }}
                    py={{ base: 3, md: 3 }}
                >
                    <HStack spacing={3}>
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
                                as={CalendarDaysIcon}
                                boxSize={6}
                            />
                        </Flex>

                        <Box minW={0}>
                            <Heading
                                size="sm"
                                color="dark.900"
                                fontWeight="800"
                            >
                                Reservation Pipeline
                            </Heading>

                            <Text
                                fontSize="xs"
                                color="gray.500"
                                mt={0.5}
                            >
                                Customer reservation progress
                            </Text>
                        </Box>
                    </HStack>
                </Flex>

                {/* Pipeline Cards */}

                <Grid
                    templateColumns={{
                        base: "repeat(2, 1fr)",
                        sm: "repeat(4, 1fr)",
                    }}
                    gap={{ base: 2, md: 2 }}
                    px={{ base: 2, md: 3 }}
                    pb={{ base: 2, md: 3 }}
                >
                    {reservationPipeline.map((item) => (
                        <PipelineStatCard
                            key={item.label}
                            {...item}
                        />
                    ))}
                </Grid>

                {/* Footer */}

                <Flex
                    align="center"
                    justify="space-between"
                    px={{ base: 3, md: 4 }}
                    pb={{ base: 3, md: 3 }}
                >
                    <Text
                        fontSize="xs"
                        color="gray.500"
                    >
                        Total reservations
                    </Text>

                    <Text
                        fontSize="sm"
                        fontWeight="800"
                        color="dark.700"
                    >
                        {totalReservations}
                    </Text>
                </Flex>
            </Box>

            {/* PAYMENT METHOD */}

            <Box
                bg="white"
                rounded="xl"
                overflow="hidden"
                
                transition="all 0.2s ease"
                _hover={{
                    boxShadow:
                        "0 4px 12px rgba(16, 24, 40, 0.08)",
                }}
            >
                {/* Header */}

                <Flex
                    align="center"
                    px={{ base: 3, md: 4 }}
                    py={{ base: 3, md: 3 }}
                >
                    <HStack spacing={3}>
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
                                as={BanknotesIcon}
                                boxSize={5}
                            />
                        </Flex>

                        <Box minW={0}>
                            <Heading
                                size="sm"
                                color="dark.900"
                                fontWeight="800"
                            >
                                Payment Method
                            </Heading>

                            <Text
                                fontSize="xs"
                                color="gray.500"
                                mt={0.5}
                            >
                                Customer payment preferences
                            </Text>
                        </Box>
                    </HStack>
                </Flex>

                {/* Payment Cards */}

                <Grid
                    templateColumns="repeat(2, 1fr)"
                    gap={{ base: 2, md: 2 }}
                    px={{ base: 2, md: 3 }}
                    pb={{ base: 2, md: 3 }}
                >
                    {paymentMethods.map((item) => (
                        <PipelineStatCard
                            key={item.label}
                            {...item}
                        />
                    ))}
                </Grid>

                {/* Footer */}

                <Flex
                    align="center"
                    justify="space-between"
                    px={{ base: 3, md: 4 }}
                    pb={{ base: 3, md: 3 }}
                >
                    <Text
                        fontSize="xs"
                        color="gray.500"
                    >
                        Total payment selections
                    </Text>

                    <Text
                        fontSize="sm"
                        fontWeight="800"
                        color="dark.700"
                    >
                        {totalPayments}
                    </Text>
                </Flex>
            </Box>
        </Grid>
    );
};

export default DashboardReservationPipeline;