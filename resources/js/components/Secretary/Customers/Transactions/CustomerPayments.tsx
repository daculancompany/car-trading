import { useEffect, useState } from "react";

import {
    Badge,
    Box,
    Flex,
    Heading,
    HStack,
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
    getPayments,
    type Payment,
    type PaymentStatus,
} from "../../../../api/PaymentManagement/paymentApi";

import { formatPeso } from "../../../../utils/numberFormatter";

interface CustomerPaymentsProps {
    customerId: number;
}

export default function CustomerPayments({
    customerId,
}: CustomerPaymentsProps) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await getPayments();

                setPayments(
                    data.filter(
                        (payment) =>
                            payment.reservation?.customer_id ===
                            customerId
                    )
                );
            } catch (err) {
                console.error(
                    "Failed to load customer payments:",
                    err
                );

                setError("Failed to load payment records.");
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [customerId]);

    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case "verified":
                return "green";
            case "pending":
                return "yellow";
            case "rejected":
                return "red";
            default:
                return "gray";
        }
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

    const formatMethod = (method: string) => {
        return method
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    return (
        <VStack align="stretch" spacing={5}>
            {/* Header */}
            <Box>
                <Heading size="sm">Payment History</Heading>

                <Text mt={1} fontSize="sm" color="gray.500">
                    Displays all payment transactions made by this customer.
                </Text>
            </Box>

            {/* Payment Table */}
            <Box borderWidth="1px" borderRadius="lg" overflowX="auto">
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>No.</Th>
                            <Th>Payment No.</Th>
                            <Th>Payment Date</Th>
                            <Th>Method</Th>
                            <Th isNumeric>Amount</Th>
                            <Th>Status</Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={6} textAlign="center" py={8}>
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
                                    colSpan={6}
                                    textAlign="center"
                                    py={8}
                                    color="red.500"
                                >
                                    {error}
                                </Td>
                            </Tr>
                        ) : payments.length === 0 ? (
                            <Tr>
                                <Td colSpan={6} textAlign="center">
                                    No payment records found.
                                </Td>
                            </Tr>
                        ) : (
                            payments.map((payment, index) => (
                                <Tr key={payment.id}>
                                    <Td>{index + 1}</Td>

                                    <Td fontWeight="medium">
                                        PAY-
                                        {String(payment.id).padStart(
                                            4,
                                            "0"
                                        )}
                                    </Td>

                                    <Td>
                                        {formatDate(payment.payment_date)}
                                    </Td>

                                    <Td>
                                        {formatMethod(payment.payment_method)}
                                    </Td>

                                    <Td isNumeric fontWeight="semibold">
                                        {formatPeso(payment.amount)}
                                    </Td>

                                    <Td>
                                        <Badge
                                            colorScheme={getStatusColor(
                                                payment.payment_status
                                            )}
                                            px={2}
                                            py={1}
                                            borderRadius="md"
                                            textTransform="capitalize"
                                        >
                                            {payment.payment_status}
                                        </Badge>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </Box>

            <HStack justify="space-between">
                <Text fontSize="xs" color="gray.500">
                    Customer ID: {customerId}
                </Text>

                <Text fontSize="xs" color="gray.500">
                    Showing {payments.length} payment
                    {payments.length !== 1 ? "s" : ""}
                </Text>
            </HStack>
        </VStack>
    );
}