import { useEffect, useState, type ReactNode } from "react";

import {
    Badge,
    Box,
    Button,
    FormControl,
    FormLabel,
    Grid,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    Textarea,
    useToast,
} from "@chakra-ui/react";

import {
    BanknotesIcon,
    CheckCircleIcon,
    CreditCardIcon,
    IdentificationIcon,
    InformationCircleIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline";

import {
    verifyPayment,
    rejectPayment,
    type Payment,
} from "../../../api/PaymentManagement/paymentApi";

interface VerifyPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: Payment | null;
    onVerified: () => void;
}

// Section Header

const SectionHeader = ({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description?: string;
}) => {
    return (
        <Box
            px={4}
            py={3}
            borderBottom="1px solid"
            borderColor="gray.200"
        >
            <Stack
                direction="row"
                spacing={3}
                align="center"
            >
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    w="34px"
                    h="34px"
                    rounded="md"
                    bg="brand.50"
                    color="brand.500"
                    flexShrink={0}
                >
                    {icon}
                </Box>

                <Box>
                    <Text
                        fontSize="sm"
                        fontWeight="700"
                        color="gray.800"
                    >
                        {title}
                    </Text>

                    {description && (
                        <Text
                            fontSize="xs"
                            color="gray.500"
                            mt={0.5}
                        >
                            {description}
                        </Text>
                    )}
                </Box>
            </Stack>
        </Box>
    );
};

// Readonly Field

const ReadonlyField = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => {
    return (
        <FormControl>
            <FormLabel
                fontSize="xs"
                fontWeight="600"
                color="gray.600"
                mb={1.5}
            >
                {label}
            </FormLabel>

            <Input
                value={value}
                isReadOnly
                size="sm"
                bg="gray.50"
                borderColor="gray.200"
                color="gray.800"
                rounded="md"
                cursor="default"
                _hover={{
                    borderColor: "gray.200",
                }}
            />
        </FormControl>
    );
};

export default function VerifyPaymentModal({
    isOpen,
    onClose,
    payment,
    onVerified,
}: VerifyPaymentModalProps) {
    const toast = useToast();

    const [loading, setLoading] = useState(false);

    const [remarks, setRemarks] = useState("");

    // Load Payment Remarks

    useEffect(() => {
        if (!payment) {
            setRemarks("");
            return;
        }

        setRemarks(payment.remarks ?? "");
    }, [payment]);

    // Format Text

    const formatText = (
        value?: string | null
    ) => {
        if (!value) {
            return "-";
        }

        return value
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );
    };

    // Verify Payment

    const handleVerify = async () => {
        if (!payment) {
            return;
        }

        try {
            setLoading(true);

            await verifyPayment(payment.id);

            toast({
                title: "Payment Verified",
                description:
                    "The payment has been verified successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onVerified();

            setRemarks("");

            onClose();
        } catch (error: any) {
            console.error(
                "Payment verification failed:",
                error
            );

            toast({
                title: "Verification Failed",
                description:
                    error?.response?.data?.message ??
                    "Unable to verify payment.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Reject Payment

    const handleReject = async () => {
        if (!payment) {
            return;
        }

        try {
            setLoading(true);

            if (!remarks.trim()) {
                toast({
                    title: "Remarks Required",
                    description: "Please provide a reason before rejecting this payment.",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            await rejectPayment(payment.id, {
                remarks: remarks.trim(),
            });

            toast({
                title: "Payment Rejected",
                description:
                    "The payment has been rejected.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            onVerified();

            setRemarks("");

            onClose();
        } catch (error: any) {
            console.error(
                "Payment rejection failed:",
                error
            );

            toast({
                title: "Reject Failed",
                description:
                    error?.response?.data?.message ??
                    "Unable to reject payment.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Close

    const handleClose = () => {
        if (loading) {
            return;
        }

        setRemarks("");

        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="4xl"
            isCentered
            scrollBehavior="inside"
        >
            <ModalOverlay bg="blackAlpha.500" />

            <ModalContent
                rounded="lg"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
                shadow="xl"
            >
                {/* HEADER */}

                <ModalHeader
                    px={6}
                    py={4}
                    bg="white"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                >
                    <Box pr={8}>
                        <Text
                            fontSize="md"
                            fontWeight="700"
                            color="gray.800"
                        >
                            Verify Payment
                        </Text>

                        <Text
                            fontSize="xs"
                            fontWeight="400"
                            color="gray.500"
                            mt={1}
                        >
                            Review the payment details before
                            approving or rejecting the transaction.
                        </Text>
                    </Box>
                </ModalHeader>

                <ModalCloseButton
                    top={3}
                    right={4}
                    rounded="md"
                    color="gray.500"
                    _hover={{
                        bg: "gray.100",
                        color: "gray.700",
                    }}
                    isDisabled={loading}
                />

                {/* BODY */}

                <ModalBody
                    bg="gray.50"
                    px={{ base: 4, md: 6 }}
                    py={5}
                >
                    <Stack spacing={4}>
                        {/* STATUS */}

                        <Box
                            bg="white"
                            rounded="lg"
                            border="1px solid"
                            borderColor="gray.200"
                            shadow="sm"
                            overflow="hidden"
                        >
                            <SectionHeader
                                icon={
                                    <InformationCircleIcon
                                        width={19}
                                        height={19}
                                    />
                                }
                                title="Payment Status"
                                description="Current verification status of this payment."
                            />

                            <Box p={4}>
                                <Badge
                                    colorScheme={
                                        payment?.payment_status ===
                                            "verified"
                                            ? "green"
                                            : payment?.payment_status ===
                                                "pending"
                                                ? "yellow"
                                                : "red"
                                    }
                                    textTransform="capitalize"
                                    fontSize="xs"
                                    fontWeight="600"
                                    px={3}
                                    py={1.5}
                                    rounded="md"
                                >
                                    {formatText(
                                        payment?.payment_status
                                    )}
                                </Badge>
                            </Box>
                        </Box>

                        {/* PAYMENT INFORMATION */}

                        <Box
                            bg="white"
                            rounded="lg"
                            border="1px solid"
                            borderColor="gray.200"
                            shadow="sm"
                            overflow="hidden"
                        >
                            <SectionHeader
                                icon={
                                    <BanknotesIcon
                                        width={19}
                                        height={19}
                                    />
                                }
                                title="Payment Information"
                                description="Transaction type, method, amount, and date."
                            />

                            <Box p={4}>
                                <Grid
                                    templateColumns={{
                                        base: "1fr",
                                        md: "repeat(2, 1fr)",
                                    }}
                                    gap={4}
                                >
                                    <ReadonlyField
                                        label="Payment Type"
                                        value={formatText(
                                            payment?.payment_type
                                        )}
                                    />

                                    <ReadonlyField
                                        label="Payment Method"
                                        value={formatText(
                                            payment?.payment_method
                                        )}
                                    />

                                    <ReadonlyField
                                        label="Amount"
                                        value={`₱ ${Number(
                                            payment?.amount ?? 0
                                        ).toLocaleString(
                                            "en-PH",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )
                                            } `}
                                    />

                                    <ReadonlyField
                                        label="Payment Date"
                                        value={
                                            payment?.payment_date
                                                ? new Date(
                                                    payment.payment_date
                                                ).toLocaleDateString(
                                                    "en-PH",
                                                    {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    }
                                                )
                                                : "-"
                                        }
                                    />

                                    <ReadonlyField
                                        label="Reference Number"
                                        value={
                                            payment?.reference_number ??
                                            "-"
                                        }
                                    />
                                </Grid>
                            </Box>
                        </Box>

                        {/* PAYMENT ACCOUNT */}

                        {payment?.paymentAccount && (
                            <Box
                                bg="white"
                                rounded="lg"
                                border="1px solid"
                                borderColor="gray.200"
                                shadow="sm"
                                overflow="hidden"
                            >
                                <SectionHeader
                                    icon={
                                        <CreditCardIcon
                                            width={19}
                                            height={19}
                                        />
                                    }
                                    title="Payment Account"
                                    description="Account used for the payment transaction."
                                />

                                <Box p={4}>
                                    <Grid
                                        templateColumns={{
                                            base: "1fr",
                                            md: "repeat(2, 1fr)",
                                        }}
                                        gap={4}
                                    >
                                        <ReadonlyField
                                            label="Provider"
                                            value={
                                                payment.paymentAccount
                                                    .account_provider
                                            }
                                        />

                                        <ReadonlyField
                                            label="Account Name"
                                            value={
                                                payment.paymentAccount
                                                    .account_name
                                            }
                                        />

                                        <ReadonlyField
                                            label="Account Number"
                                            value={
                                                payment.paymentAccount
                                                    .account_number
                                            }
                                        />
                                    </Grid>
                                </Box>
                            </Box>
                        )}

                        {/* PAYMENT PROOF */}

                        <Box
                            bg="white"
                            rounded="lg"
                            border="1px solid"
                            borderColor="gray.200"
                            shadow="sm"
                            overflow="hidden"
                        >
                            <SectionHeader
                                icon={
                                    <IdentificationIcon
                                        width={19}
                                        height={19}
                                    />
                                }
                                title="Payment Proof"
                                description="Uploaded proof associated with this payment."
                            />

                            <Box p={4}>
                                {payment?.payment_proof ? (
                                    <Box
                                        border="1px solid"
                                        borderColor="gray.200"
                                        rounded="md"
                                        overflow="hidden"
                                        bg="gray.50"
                                        p={3}
                                    >
                                        <Image
                                            src={`/storage/${payment.payment_proof}`}
                                            alt="Payment Proof"
                                            w="100%"
                                            maxH="420px"
                                            objectFit="contain"
                                            rounded="sm"
                                        />
                                    </Box >
                                ) : (
                                    <Box
                                        border="1px dashed"
                                        borderColor="gray.300"
                                        rounded="md"
                                        p={8}
                                        textAlign="center"
                                        bg="gray.50"
                                    >
                                        <IdentificationIcon
                                            width={28}
                                            height={28}
                                            style={{
                                                margin: "0 auto",
                                            }}
                                        />

                                        <Text
                                            fontSize="sm"
                                            fontWeight="500"
                                            color="gray.600"
                                            mt={2}
                                        >
                                            No payment proof uploaded.
                                        </Text>

                                        <Text
                                            fontSize="xs"
                                            color="gray.400"
                                            mt={1}
                                        >
                                            There is no proof attached
                                            to this transaction.
                                        </Text>
                                    </Box>
                                )}
                            </Box >
                        </Box >

                        {/* VERIFICATION REMARKS */}

                        < Box
                            bg="white"
                            rounded="lg"
                            border="1px solid"
                            borderColor="gray.200"
                            shadow="sm"
                            overflow="hidden"
                        >
                            <SectionHeader
                                icon={
                                    <InformationCircleIcon
                                        width={19}
                                        height={19}
                                    />
                                }
                                title="Verification Remarks"
                                description="Optional notes for the payment review."
                            />

                            <Box p={4}>
                                <FormControl>
                                    <FormLabel
                                        fontSize="xs"
                                        fontWeight="600"
                                        color="gray.600"
                                        mb={1.5}
                                    >
                                        Remarks
                                    </FormLabel>

                                    <Textarea
                                        size="sm"
                                        rows={4}
                                        value={remarks}
                                        onChange={(e) =>
                                            setRemarks(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter verification remarks..."
                                        bg="white"
                                        borderColor="gray.300"
                                        rounded="md"
                                        _hover={{
                                            borderColor: "gray.400",
                                        }}
                                        _focus={{
                                            borderColor: "brand.500",
                                            boxShadow:
                                                "0 0 0 1px var(--chakra-colors-brand-500)",
                                        }}
                                    />

                                    <Text
                                        fontSize="xs"
                                        color="gray.400"
                                        mt={2}
                                    >
                                        Note: remarks are currently
                                        displayed here but are not sent
                                        by the verify/reject endpoint.
                                    </Text>
                                </FormControl>
                            </Box>
                        </Box >
                    </Stack >
                </ModalBody >

                {/* FOOTER */}

                < ModalFooter
                    px={{ base: 4, md: 6 }}
                    py={4}
                    bg="white"
                    borderTop="1px solid"
                    borderColor="gray.200"
                >
                    <Stack
                        direction={{
                            base: "column-reverse",
                            sm: "row",
                        }}
                        spacing={2}
                        w="100%"
                        justify="flex-end"
                    >
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleClose}
                            isDisabled={loading}
                            color="gray.600"
                            _hover={{
                                bg: "gray.100",
                                color: "gray.800",
                            }}
                        >
                            Cancel
                        </Button>

                        {payment?.payment_status ===
                            "pending" && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        colorScheme="red"
                                        leftIcon={
                                            <XCircleIcon
                                                width={17}
                                                height={17}
                                            />
                                        }
                                        onClick={handleReject}
                                        isLoading={loading}
                                        loadingText="Rejecting"
                                    >
                                        Reject Payment
                                    </Button>

                                    <Button
                                        size="sm"
                                        colorScheme="brand"
                                        leftIcon={
                                            <CheckCircleIcon
                                                width={17}
                                                height={17}
                                            />
                                        }
                                        onClick={handleVerify}
                                        isLoading={loading}
                                        loadingText="Verifying"
                                    >
                                        Verify Payment
                                    </Button>
                                </>
                            )}
                    </Stack>
                </ModalFooter >
            </ModalContent >
        </Modal >
    );
}

