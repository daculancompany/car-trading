import {
    Badge,
    Box,
    Flex,
    Grid,
    GridItem,
    Heading,
    Select,
    Text,
} from "@chakra-ui/react";

import type { Payment } from "../../../api/PaymentManagement/paymentApi";

interface PaymentSummaryProps {
    payments: Payment[];
    selectedReservationId: number | null;
    onReservationChange: (reservationId: number | null) => void;
}

export default function CustomerPaymentSummary({
    payments,
    selectedReservationId,
    onReservationChange,
}: PaymentSummaryProps) {
    // RESERVATIONS

    const reservations = Array.from(
        new Map(
            payments
                .filter((payment) => payment.reservation)
                .map((payment) => [
                    payment.reservation_id,
                    payment.reservation,
                ])
        ).values()
    );

    const selectedReservation =
        reservations.find(
            (reservation) =>
                reservation?.id === selectedReservationId
        ) ?? reservations[0];

    // RESERVATION PAYMENTS

    const reservationPayments = payments.filter(
        (payment) =>
            payment.reservation_id === selectedReservation?.id
    );

    // TOTAL VERIFIED PAYMENTS

    const totalPaid = reservationPayments
        .filter(
            (payment) =>
                payment.payment_status === "verified"
        )
        .reduce(
            (total, payment) =>
                total + Number(payment.amount || 0),
            0
        );

    // SALE

    const selectedSale =
        reservationPayments.find(
            (payment) => payment.sale
        )?.sale ??
        payments.find(
            (payment) =>
                payment.reservation_id ===
                selectedReservation?.id &&
                payment.sale
        )?.sale ??
        null;

    // SELLING PRICE

    const sellingPrice = Number(
        selectedReservation?.vehicle?.selling_price ?? 0
    );

    // DISCOUNT

    const discountAmount = Number(
        selectedSale?.discount_amount ?? 0
    );

    // TOTAL SALE AMOUNT

    const totalSaleAmount = Math.max(
        sellingPrice - discountAmount,
        0
    );

    // REMAINING BALANCE

    // Payments sent but not yet checked by staff. They are not counted as paid
    // yet, but the customer shouldn't be asked to pay that amount twice.
    const pendingPayments = reservationPayments.filter(
        (payment) => payment.payment_status === "pending"
    );
    const totalPending = pendingPayments.reduce(
        (total, payment) => total + Number(payment.amount || 0),
        0
    );

    const remainingBalance = Math.max(
        totalSaleAmount - totalPaid - totalPending,
        0
    );

    // LATEST PAYMENT

    const latestPayment =
        reservationPayments.length > 0
            ? [...reservationPayments].sort(
                (a, b) =>
                    new Date(
                        b.created_at ?? b.payment_date
                    ).getTime() -
                    new Date(
                        a.created_at ?? a.payment_date
                    ).getTime()
            )[0]
            : null;

    // EMPTY STATE

    if (!selectedReservation) {
        return (
            <Box
                layerStyle="panel"
                p={{ base: 4, md: 5 }}
            >
                <Text
                    color="gray.500"
                    fontSize="sm"
                >
                    No payment summary available.
                </Text>
            </Box>
        );
    }

    // COMPONENT

    return (
        <Box
            layerStyle="panel"
            p={{ base: 4, md: 5 }}
            overflow="hidden"
        >
            {/* HEADER */}

            <Flex
                direction={{
                    base: "column",
                    md: "row",
                }}
                justify="space-between"
                align={{
                    base: "flex-start",
                    md: "center",
                }}
                gap={3}
                mb={4}
            >
                <Box>
                    <Heading
                        size={{
                            base: "sm",
                            md: "md",
                        }}
                    >
                        Payment Summary
                    </Heading>

                    <Text
                        fontSize={{
                            base: "xs",
                            md: "sm",
                        }}
                        color="gray.500"
                        mt={1}
                    >
                        View your payment progress and remaining
                        vehicle balance.
                    </Text>
                </Box>

                <Select
                    value={
                        selectedReservationId ??
                        selectedReservation.id
                    }
                    onChange={(e) => {
                        const value = e.target.value;

                        onReservationChange(
                            value ? Number(value) : null
                        );
                    }}
                    w={{
                        base: "100%",
                        sm: "280px",
                        md: "300px",
                    }}
                    size="sm"
                    bg="white"
                >
                    {reservations.map(
                        (reservation) => (
                            <option
                                key={reservation?.id}
                                value={reservation?.id}
                            >
                                {
                                    reservation?.vehicle
                                        ?.brand?.brand
                                }{" "}
                                {
                                    reservation?.vehicle
                                        ?.model?.model
                                }{" "}
                                {
                                    reservation?.vehicle
                                        ?.variant?.variant
                                }
                            </option>
                        )
                    )}
                </Select>
            </Flex>

            {/* SUMMARY CARDS */}

            <Grid
                templateColumns={{
                    base: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(3, minmax(0, 1fr))",
                    lg: "repeat(6, minmax(0, 1fr))",
                }}
                gap={{
                    base: 2,
                    sm: 3,
                    lg: 2,
                }}
            >
                {/* SELLING PRICE */}

                <GridItem>
                    <Box
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        px={{
                            base: 3,
                            md: 3,
                        }}
                        py={{
                            base: 2.5,
                            md: 3,
                        }}
                        h="100%"
                        bg="white"
                    >
                        <Text
                            fontSize="9px"
                            fontWeight="semibold"
                            color="gray.500"
                            textTransform="uppercase"
                            letterSpacing="wide"
                            mb={1}
                        >
                            Selling Price
                        </Text>

                        <Text
                            fontSize={{
                                base: "md",
                                md: "lg",
                            }}
                            fontWeight="bold"
                            color="gray.800"
                            noOfLines={1}
                        >
                            ₱
                            {sellingPrice.toLocaleString(
                                "en-PH",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </Text>
                    </Box>
                </GridItem>

                {/* DISCOUNT */}

                <GridItem>
                    <Box
                        border="1px solid"
                        borderColor="red.100"
                        borderRadius="md"
                        px={3}
                        py={{
                            base: 2.5,
                            md: 3,
                        }}
                        h="100%"
                        bg="red.50"
                    >
                        <Text
                            fontSize="9px"
                            fontWeight="semibold"
                            color="red.500"
                            textTransform="uppercase"
                            letterSpacing="wide"
                            mb={1}
                        >
                            Discount
                        </Text>

                        <Text
                            fontSize={{
                                base: "md",
                                md: "lg",
                            }}
                            fontWeight="bold"
                            color="red.600"
                            noOfLines={1}
                        >
                            - ₱
                            {discountAmount.toLocaleString(
                                "en-PH",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </Text>
                    </Box>
                </GridItem>

                {/* TOTAL SALE */}

                <GridItem>
                    <Box
                        border="1px solid"
                        borderColor="blue.100"
                        borderRadius="md"
                        px={3}
                        py={{
                            base: 2.5,
                            md: 3,
                        }}
                        h="100%"
                        bg="blue.50"
                    >
                        <Text
                            fontSize="9px"
                            fontWeight="semibold"
                            color="blue.500"
                            textTransform="uppercase"
                            letterSpacing="wide"
                            mb={1}
                        >
                            Total Sale
                        </Text>

                        <Text
                            fontSize={{
                                base: "md",
                                md: "lg",
                            }}
                            fontWeight="bold"
                            color="blue.600"
                            noOfLines={1}
                        >
                            ₱
                            {totalSaleAmount.toLocaleString(
                                "en-PH",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </Text>
                    </Box>
                </GridItem>

                {/* VERIFIED PAYMENTS */}

                <GridItem>
                    <Box
                        border="1px solid"
                        borderColor="green.100"
                        borderRadius="md"
                        px={3}
                        py={{
                            base: 2.5,
                            md: 3,
                        }}
                        h="100%"
                        bg="green.50"
                    >
                        <Text
                            fontSize="9px"
                            fontWeight="semibold"
                            color="green.500"
                            textTransform="uppercase"
                            letterSpacing="wide"
                            mb={1}
                        >
                            Verified Paid
                        </Text>

                        <Text
                            fontSize={{
                                base: "md",
                                md: "lg",
                            }}
                            fontWeight="bold"
                            color="green.600"
                            noOfLines={1}
                        >
                            ₱
                            {totalPaid.toLocaleString(
                                "en-PH",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </Text>
                    </Box>
                </GridItem>

                {/* PENDING VERIFICATION */}

                <GridItem>
                    <Box
                        border="1px solid"
                        borderColor={totalPending > 0 ? "yellow.200" : "gray.100"}
                        borderRadius="md"
                        px={3}
                        py={{ base: 2.5, md: 3 }}
                        h="100%"
                        bg={totalPending > 0 ? "yellow.50" : "white"}
                    >
                        <Text
                            fontSize="9px"
                            fontWeight="semibold"
                            color={totalPending > 0 ? "yellow.700" : "gray.500"}
                            textTransform="uppercase"
                            letterSpacing="wide"
                            mb={1}
                        >
                            Pending Verification
                        </Text>
                        <Text
                            fontSize={{ base: "md", md: "lg" }}
                            fontWeight="bold"
                            color={totalPending > 0 ? "yellow.700" : "gray.500"}
                            noOfLines={1}
                        >
                            ₱
                            {totalPending.toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={0.5}>
                            {pendingPayments.length > 0
                                ? `${pendingPayments.length} payment${pendingPayments.length > 1 ? "s" : ""} waiting for our staff`
                                : "Nothing waiting"}
                        </Text>
                    </Box>
                </GridItem>

                {/* REMAINING BALANCE */}

                <GridItem>
                    <Box
                        border="1px solid"
                        borderColor={
                            remainingBalance > 0
                                ? "orange.100"
                                : "green.100"
                        }
                        borderRadius="md"
                        px={3}
                        py={{
                            base: 2.5,
                            md: 3,
                        }}
                        h="100%"
                        bg={
                            remainingBalance > 0
                                ? "orange.50"
                                : "green.50"
                        }
                    >
                        <Text
                            fontSize="9px"
                            fontWeight="semibold"
                            color={
                                remainingBalance > 0
                                    ? "orange.600"
                                    : "green.600"
                            }
                            textTransform="uppercase"
                            letterSpacing="wide"
                            mb={1}
                        >
                            Remaining
                        </Text>

                        <Text
                            fontSize={{
                                base: "md",
                                md: "lg",
                            }}
                            fontWeight="bold"
                            color={
                                remainingBalance > 0
                                    ? "orange.600"
                                    : "green.600"
                            }
                            noOfLines={1}
                        >
                            ₱
                            {remainingBalance.toLocaleString(
                                "en-PH",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </Text>
                        {totalPending > 0 && (
                            <Text fontSize="xs" color="gray.500" mt={0.5}>
                                after pending payments
                            </Text>
                        )}
                    </Box>
                </GridItem>
            </Grid>

            {/* LATEST PAYMENT */}

            {latestPayment && (
                <Flex
                    mt={4}
                    pt={3}
                    borderTop="1px"
                    borderColor="gray.200"
                    justify="space-between"
                    align={{
                        base: "flex-start",
                        sm: "center",
                    }}
                    direction={{
                        base: "column",
                        sm: "row",
                    }}
                    gap={2}
                >
                    <Box>
                        <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            color="gray.700"
                        >
                            Latest Payment
                        </Text>

                        <Text
                            fontSize="10px"
                            color="gray.500"
                            mt={0.5}
                        >
                            {latestPayment.payment_type
                                .replace(/_/g, " ")
                                .replace(
                                    /\b\w/g,
                                    (c) =>
                                        c.toUpperCase()
                                )}
                            {" • "}
                            ₱
                            {Number(
                                latestPayment.amount
                            ).toLocaleString(
                                "en-PH",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </Text>
                    </Box>

                    <Badge
                        colorScheme={
                            latestPayment.payment_status ===
                                "verified"
                                ? "green"
                                : latestPayment.payment_status ===
                                    "pending"
                                    ? "yellow"
                                    : "red"
                        }
                        px={2.5}
                        py={1}
                        borderRadius="full"
                        fontSize="10px"
                        textTransform="capitalize"
                    >
                        {latestPayment.payment_status}
                    </Badge>
                </Flex>
            )}
        </Box>
    );
}