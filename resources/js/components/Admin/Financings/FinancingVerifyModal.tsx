import { useEffect, useRef, useState } from "react";

import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Badge,
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    HStack,
    SimpleGrid,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react";

import {
    CheckCircleIcon,
    WarningIcon,
} from "@chakra-ui/icons";

import type {
    Financing,
    FinancingStatus,
} from "../../../api/FinancingManagement/financingInfoApi";

// Props

interface FinancingVerifyModalProps {
    isOpen: boolean;
    onClose: () => void;

    financing: Financing | null;

    onConfirm: (
        financing: Financing,
        status: FinancingStatus,
        remarks: string,
    ) => Promise<void> | void;

    loading?: boolean;
}

// Component

export default function FinancingVerifyModal({
    isOpen,
    onClose,
    financing,
    onConfirm,
    loading = false,
}: FinancingVerifyModalProps) {
    const cancelRef = useRef<HTMLButtonElement>(null);

    const [remarks, setRemarks] = useState("");
    const [action, setAction] = useState<"approve" | "reject">("approve");

    // Reset

    useEffect(() => {
        if (isOpen) {
            setRemarks("");
            setAction("approve");
        }
    }, [isOpen, financing]);

    // Helpers

    const formatCurrency = (amount?: number | null): string => {
        if (amount === null || amount === undefined) {
            return "—";
        }

        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2,
        }).format(Number(amount));
    };

    const getCustomerName = (): string => {
        const customer = financing?.reservation?.customer;

        if (!customer) {
            return "—";
        }

        return [
            customer.first_name,
            customer.middle_name,
            customer.last_name,
        ]
            .filter(Boolean)
            .join(" ");
    };

    const getStatusColor = (status: FinancingStatus): string => {
        switch (status) {
            case "pending":
                return "yellow";

            case "approved":
                return "green";

            case "rejected":
                return "red";

            case "completed":
                return "purple";

            default:
                return "gray";
        }
    };

    const formatStatus = (status: FinancingStatus): string => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    // Submit

    const handleConfirm = async (status: FinancingStatus) => {
        if (!financing) return;

        if (status === "rejected" && !remarks.trim()) {
            setAction("reject");
            return;
        }

        await onConfirm(
            financing,
            status,
            remarks.trim(),
        );
    };

    // Render

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            isCentered
        >
            <AlertDialogOverlay />

            <AlertDialogContent
                borderRadius="2xl"
                mx={4}
                maxW="650px"
                maxH="90vh"
                overflow="hidden"
            >
                {/* Header */}

                <AlertDialogHeader
                    borderBottom="1px"
                    borderColor="gray.200"
                    px={6}
                    py={4}
                >
                    <HStack spacing={3}>
                        <Box
                            bg={action === "approve" ? "green.100" : "red.100"}
                            p={2}
                            borderRadius="lg"
                        >
                            {action === "approve" ? (
                                <CheckCircleIcon
                                    color="green.600"
                                    boxSize={5}
                                />
                            ) : (
                                <WarningIcon
                                    color="red.600"
                                    boxSize={5}
                                />
                            )}
                        </Box>

                        <Box>
                            <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="gray.800"
                            >
                                Financing Verification
                            </Text>

                            <Text
                                fontSize="xs"
                                color="gray.500"
                                mt={1}
                            >
                                Review the financing information before
                                making a decision.
                            </Text>
                        </Box>
                    </HStack>
                </AlertDialogHeader>

                {/* Body */}

                <AlertDialogBody
                    px={6}
                    py={5}
                    overflowY="auto"
                >
                    <VStack
                        align="stretch"
                        spacing={5}
                    >
                        {/* Status */}

                        {financing && (
                            <HStack
                                justify="space-between"
                                bg="blue.50"
                                border="1px"
                                borderColor="blue.100"
                                borderRadius="lg"
                                px={4}
                                py={3}
                            >
                                <Text
                                    fontSize="sm"
                                    fontWeight="medium"
                                    color="blue.800"
                                >
                                    Financing Status
                                </Text>

                                <Badge
                                    colorScheme={getStatusColor(
                                        financing.financing_status,
                                    )}
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                >
                                    {formatStatus(
                                        financing.financing_status,
                                    )}
                                </Badge>
                            </HStack>
                        )}

                        {/* Customer / Reservation */}

                        <Box>
                            <Text
                                fontSize="md"
                                fontWeight="bold"
                                color="gray.700"
                                mb={3}
                            >
                                Customer Information
                            </Text>

                            <Box
                                border="1px"
                                borderColor="gray.200"
                                borderRadius="lg"
                                p={4}
                            >
                                <SimpleGrid
                                    columns={{ base: 1, sm: 2 }}
                                    spacing={4}
                                >
                                    <Box>
                                        <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            mb={1}
                                        >
                                            Customer Name
                                        </Text>

                                        <Text
                                            fontSize="sm"
                                            fontWeight="semibold"
                                            color="gray.800"
                                        >
                                            {getCustomerName()}
                                        </Text>
                                    </Box>

                                    <Box>
                                        <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            mb={1}
                                        >
                                            Reservation ID
                                        </Text>

                                        <Text
                                            fontSize="sm"
                                            fontWeight="semibold"
                                            color="gray.800"
                                        >
                                            #{financing?.reservation_id ?? "—"}
                                        </Text>
                                    </Box>
                                </SimpleGrid>
                            </Box>
                        </Box>

                        {/* Financing Company */}

                        <Box>
                            <Text
                                fontSize="md"
                                fontWeight="bold"
                                color="gray.700"
                                mb={3}
                            >
                                Financing Company
                            </Text>

                            <Box
                                border="1px"
                                borderColor="gray.200"
                                borderRadius="lg"
                                p={4}
                            >
                                <VStack
                                    align="stretch"
                                    spacing={4}
                                >
                                    <Box>
                                        <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            mb={1}
                                        >
                                            Company Name
                                        </Text>

                                        <Text
                                            fontSize="sm"
                                            fontWeight="semibold"
                                            color="gray.800"
                                        >
                                            {financing?.company_name ?? "—"}
                                        </Text>
                                    </Box>

                                    <Divider />

                                    <SimpleGrid
                                        columns={{ base: 1, sm: 2 }}
                                        spacing={4}
                                    >
                                        <Box>
                                            <Text
                                                fontSize="xs"
                                                color="gray.500"
                                                mb={1}
                                            >
                                                Contact Person
                                            </Text>

                                            <Text
                                                fontSize="sm"
                                                fontWeight="semibold"
                                                color="gray.800"
                                            >
                                                {financing?.contact_person ?? "—"}
                                            </Text>
                                        </Box>

                                        <Box>
                                            <Text
                                                fontSize="xs"
                                                color="gray.500"
                                                mb={1}
                                            >
                                                Contact Number
                                            </Text>

                                            <Text
                                                fontSize="sm"
                                                fontWeight="semibold"
                                                color="gray.800"
                                            >
                                                {financing?.contact_number ?? "—"}
                                            </Text>
                                        </Box>

                                        <Box>
                                            <Text
                                                fontSize="xs"
                                                color="gray.500"
                                                mb={1}
                                            >
                                                Email Address
                                            </Text>

                                            <Text
                                                fontSize="sm"
                                                fontWeight="semibold"
                                                color="gray.800"
                                                wordBreak="break-word"
                                            >
                                                {financing?.email ?? "—"}
                                            </Text>
                                        </Box>

                                        <Box>
                                            <Text
                                                fontSize="xs"
                                                color="gray.500"
                                                mb={1}
                                            >
                                                Address
                                            </Text>

                                            <Text
                                                fontSize="sm"
                                                fontWeight="semibold"
                                                color="gray.800"
                                            >
                                                {financing?.address ?? "—"}
                                            </Text>
                                        </Box>
                                    </SimpleGrid>
                                </VStack>
                            </Box>
                        </Box>

                        {/* Financing Details */}

                        <Box>
                            <Text
                                fontSize="md"
                                fontWeight="bold"
                                color="gray.700"
                                mb={3}
                            >
                                Financing Details
                            </Text>

                            <Box
                                border="1px"
                                borderColor="gray.200"
                                borderRadius="lg"
                                p={4}
                            >
                                <SimpleGrid
                                    columns={{ base: 1, sm: 2 }}
                                    spacing={4}
                                >
                                    <Box>
                                        <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            mb={1}
                                        >
                                            Financing Reference No.
                                        </Text>

                                        <Text
                                            fontSize="sm"
                                            fontWeight="semibold"
                                            color="gray.800"
                                        >
                                            {financing?.financing_reference_no ??
                                                "—"}
                                        </Text>
                                    </Box>

                                    <Box>
                                        <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            mb={1}
                                        >
                                            Financed Amount
                                        </Text>

                                        <Text
                                            fontSize="md"
                                            fontWeight="bold"
                                            color="blue.600"
                                        >
                                            {formatCurrency(
                                                financing?.financed_amount,
                                            )}
                                        </Text>
                                    </Box>

                                    <Box>
                                        <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            mb={1}
                                        >
                                            Monthly Payment
                                        </Text>

                                        <Text
                                            fontSize="sm"
                                            fontWeight="semibold"
                                            color="gray.800"
                                        >
                                            {formatCurrency(
                                                financing?.monthly_payment,
                                            )}
                                        </Text>
                                    </Box>

                                    <Box>
                                        <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            mb={1}
                                        >
                                            Loan Term
                                        </Text>

                                        <Text
                                            fontSize="sm"
                                            fontWeight="semibold"
                                            color="gray.800"
                                        >
                                            {financing?.loan_term_months
                                                ? `${financing.loan_term_months} Months`
                                                : "—"}
                                        </Text>
                                    </Box>
                                </SimpleGrid>
                            </Box>
                        </Box>

                        {/* Existing Remarks */}

                        {financing?.remarks && (
                            <Box>
                                <Text
                                    fontSize="md"
                                    fontWeight="bold"
                                    color="gray.700"
                                    mb={3}
                                >
                                    Existing Remarks
                                </Text>

                                <Box
                                    bg="gray.50"
                                    border="1px"
                                    borderColor="gray.200"
                                    borderRadius="lg"
                                    p={4}
                                >
                                    <Text
                                        fontSize="sm"
                                        color="gray.700"
                                        whiteSpace="pre-wrap"
                                    >
                                        {financing.remarks}
                                    </Text>
                                </Box>
                            </Box>
                        )}

                        {/* Verification Remarks */}

                        <FormControl
                            isRequired={action === "reject"}
                        >
                            <FormLabel
                                fontSize="sm"
                                fontWeight="bold"
                                color="gray.700"
                            >
                                Verification Remarks
                            </FormLabel>

                            <Textarea
                                placeholder={
                                    action === "reject"
                                        ? "Enter the reason for rejection..."
                                        : "Enter verification remarks (optional)..."
                                }
                                value={remarks}
                                onChange={(event) =>
                                    setRemarks(event.target.value)
                                }
                                rows={4}
                                resize="vertical"
                                isDisabled={loading}
                                borderRadius="lg"
                                focusBorderColor={
                                    action === "reject"
                                        ? "red.400"
                                        : "blue.400"
                                }
                            />

                            {action === "reject" && (
                                <Text
                                    fontSize="xs"
                                    color="red.500"
                                    mt={1}
                                >
                                    A rejection reason is required.
                                </Text>
                            )}
                        </FormControl>
                    </VStack>
                </AlertDialogBody>

                {/* Footer */}

                <AlertDialogFooter
                    borderTop="1px"
                    borderColor="gray.200"
                    px={6}
                    py={4}
                >
                    <HStack
                        spacing={3}
                        width="100%"
                        justify="flex-end"
                    >
                        <Button
                            ref={cancelRef}
                            onClick={onClose}
                            variant="ghost"
                            isDisabled={loading}
                        >
                            Close
                        </Button>

                        <Button
                            colorScheme="red"
                            variant="outline"
                            onClick={() => {
                                setAction("reject");

                                if (remarks.trim()) {
                                    handleConfirm("rejected");
                                }
                            }}
                            isLoading={
                                loading && action === "reject"
                            }
                            isDisabled={
                                loading || !financing
                            }
                        >
                            <WarningIcon mr={2} />
                            Reject
                        </Button>

                        <Button
                            colorScheme="green"
                            onClick={() => {
                                setAction("approve");
                                handleConfirm("approved");
                            }}
                            isLoading={
                                loading && action === "approve"
                            }
                            loadingText="Verifying..."
                            isDisabled={
                                loading || !financing
                            }
                        >
                            <CheckCircleIcon mr={2} />
                            Verify
                        </Button>
                    </HStack>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}