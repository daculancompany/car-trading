import { useEffect, useState } from "react";
import api from "../../../api/api";

import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Text,
    Textarea,
    VStack,
    HStack,
    Image,
    useToast,
} from "@chakra-ui/react";

import {
    createPayment,
    type Payment,
    type PaymentMethod,
} from "../../../api/PaymentManagement/paymentApi";

import {
    getPaymentAccounts,
    type PaymentAccount,
} from "../../../api/PaymentManagement/accountApi";

interface PaymentSale {
    id: number;
    reservation_id: number;
    invoice_number?: string | null;
    discount_amount?: number | string | null;
    sale_date?: string | null;
}

interface CustomerPayRemainingBalanceProps {
    isOpen: boolean;
    onClose: () => void;
    payment: Payment | null;
    remainingBalance: number;
    onPaid: () => void;
}

export default function CustomerPayRemainingBalance({
    isOpen,
    onClose,
    payment,
    onPaid,
}: CustomerPayRemainingBalanceProps) {
    const toast = useToast();

    const [sale, setSale] = useState<PaymentSale | null>(
        payment?.sale ?? null
    );

    const [saleLoading, setSaleLoading] = useState(false);
    const [verifiedTotal, setVerifiedTotal] = useState(0);
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const [paymentAccounts, setPaymentAccounts] = useState<
        PaymentAccount[]
    >([]);

    const [selectedAccount, setSelectedAccount] =
        useState<PaymentAccount | null>(null);

    const [paymentProof, setPaymentProof] =
        useState<File | null>(null);

    const [preview, setPreview] = useState("");

    // Online payments only.
    // Cash has been removed.
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>("" as PaymentMethod);

    const [paymentAccountId, setPaymentAccountId] =
        useState<number | null>(null);

    const [referenceNumber, setReferenceNumber] =
        useState("");

    const [remarks, setRemarks] = useState("");

    // LOAD PAYMENT ACCOUNTS

    const loadPaymentAccounts = async (): Promise<void> => {
        try {
            const accounts = await getPaymentAccounts();

            setPaymentAccounts(
                accounts.filter((account) =>
                    Boolean(account.is_active)
                )
            );
        } catch (error) {
            console.error(
                "Unable to load payment accounts:",
                error
            );

            toast({
                title: "Unable to load payment accounts.",
                description: "Please try again later.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // INITIALIZE MODAL

    useEffect(() => {
        if (!isOpen) return;

        const initializeModal = async () => {
            await loadPaymentAccounts();

            let saleData: PaymentSale | null =
                payment?.sale ?? null;

            // LOAD SALE INFORMATION

            if (!saleData && payment?.reservation_id) {
                try {
                    setSaleLoading(true);

                    const response = await api.get<{
                        message?: string;
                        data?: PaymentSale[];
                    }>("/sales");

                    const sales = Array.isArray(
                        response.data?.data
                    )
                        ? response.data.data
                        : [];

                    saleData =
                        sales.find(
                            (item) =>
                                Number(item.reservation_id) ===
                                Number(payment.reservation_id)
                        ) ?? null;
                } catch (error) {
                    console.error(
                        "Unable to load sale information:",
                        error
                    );
                } finally {
                    setSaleLoading(false);
                }
            }

            setSale(saleData);

            // LOAD VERIFIED PAYMENTS

            if (payment?.reservation_id) {
                try {
                    setBalanceLoading(true);

                    const paymentResponse = await api.get<{
                        message?: string;
                        data?: Array<{
                            id: number;
                            reservation_id: number;
                            amount: number | string;
                            payment_status: string;
                        }>;
                    }>("/payments");

                    const allPayments = Array.isArray(
                        paymentResponse.data?.data
                    )
                        ? paymentResponse.data.data
                        : [];

                    const verifiedPayments =
                        allPayments.filter(
                            (item) =>
                                Number(item.reservation_id) ===
                                Number(
                                    payment.reservation_id
                                ) &&
                                item.payment_status ===
                                "verified"
                        );

                    const totalVerified =
                        verifiedPayments.reduce(
                            (total, item) =>
                                total +
                                Number(item.amount || 0),
                            0
                        );

                    setVerifiedTotal(totalVerified);
                } catch (error) {
                    console.error(
                        "Unable to calculate verified payments:",
                        error
                    );

                    setVerifiedTotal(0);
                } finally {
                    setBalanceLoading(false);
                }
            } else {
                setVerifiedTotal(0);
            }

            // RESET ONLINE PAYMENT FORM

            setPaymentMethod("" as PaymentMethod);
            setPaymentAccountId(null);
            setSelectedAccount(null);
            setPaymentProof(null);
            setPreview("");
            setReferenceNumber("");
            setRemarks("");
        };

        initializeModal();
    }, [isOpen, payment]);

    // PAYMENT METHOD CHANGE

    const handlePaymentMethodChange = (
        method: PaymentMethod
    ) => {
        setPaymentMethod(method);

        setPaymentAccountId(null);
        setSelectedAccount(null);

        setPaymentProof(null);

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setPreview("");
        setReferenceNumber("");
    };

    // PAYMENT ACCOUNT CHANGE

    const handlePaymentAccountChange = (
        value: string
    ) => {
        if (!value) {
            setPaymentAccountId(null);
            setSelectedAccount(null);
            return;
        }

        const accountId = Number(value);

        const account =
            paymentAccounts.find(
                (item) => item.id === accountId
            ) ?? null;

        setPaymentAccountId(accountId);
        setSelectedAccount(account);
    };

    // PAYMENT PROOF

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Invalid payment proof.",
                description:
                    "Please upload a JPG, JPEG, PNG, or WEBP image.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "Payment proof is too large.",
                description:
                    "Maximum file size is 2MB.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setPaymentProof(file);
        setPreview(URL.createObjectURL(file));
    };

    // VEHICLE / SALE CALCULATIONS

    const vehicle =
        payment?.reservation?.vehicle;

    const vehicleName = [
        vehicle?.brand?.brand,
        vehicle?.model?.model,
        vehicle?.variant?.variant,
    ]
        .filter(Boolean)
        .join(" ");

    const sellingPrice = Number(
        vehicle?.selling_price ?? 0
    );

    const discountAmount = Math.max(
        Number(sale?.discount_amount ?? 0),
        0
    );

    const totalSaleAmount = Math.max(
        sellingPrice - discountAmount,
        0
    );

    const calculatedRemainingBalance = Math.max(
        totalSaleAmount - verifiedTotal,
        0
    );

    const isFullyPaid =
        calculatedRemainingBalance <= 0;

    const formatCurrency = (amount: number) =>
        Number(amount).toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );

    // SUBMIT PAYMENT

    const handleSubmit = async () => {
        if (!payment) {
            toast({
                title: "Payment information is missing.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        const reservationId =
            payment.reservation_id;

        if (!reservationId) {
            toast({
                title: "Reservation not found.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        if (calculatedRemainingBalance <= 0) {
            toast({
                title: "No remaining balance.",
                description:
                    "There is no outstanding balance to pay.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        const amount =
            calculatedRemainingBalance;

        // PAYMENT ACCOUNT IS ALWAYS REQUIRED

        if (!paymentAccountId) {
            toast({
                title: "Payment Account Required",
                description:
                    "Please select the payment account.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        // REFERENCE NUMBER IS ALWAYS REQUIRED

        if (!referenceNumber.trim()) {
            toast({
                title: "Reference Number Required",
                description:
                    "Please enter the payment reference number.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        // PAYMENT PROOF IS ALWAYS REQUIRED

        if (!paymentProof) {
            toast({
                title: "Payment Proof Required",
                description:
                    "Please upload your payment proof.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        // SALE REQUIRED

        if (!sale?.id) {
            toast({
                title: "Sale information is missing.",
                description:
                    "A sale must exist before the remaining balance can be paid.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });

            return;
        }

        try {
            setLoading(true);

            await createPayment({
                reservation_id: reservationId,
                sale_id: sale.id,
                payer_type: "customer",
                payment_account_id: paymentAccountId,
                payment_type: "full_payment",
                payment_method: paymentMethod,
                amount,
                reference_number:
                    referenceNumber.trim(),
                payment_proof: paymentProof,
                remarks: remarks.trim() || null,
            });

            toast({
                title: "Payment Submitted",
                description:
                    "Your remaining balance payment has been submitted for verification.",
                status: "success",
                duration: 4000,
                isClosable: true,
            });

            onPaid();
            handleClose();
        } catch (error: any) {
            console.error(
                "Remaining balance payment failed:",
                error
            );

            toast({
                title: "Payment Failed",
                description:
                    error?.response?.data?.message ??
                    "Unable to submit payment.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // CLOSE MODAL

    const handleClose = () => {
        if (loading) return;

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setPaymentMethod("gcash");
        setPaymentAccountId(null);
        setSelectedAccount(null);
        setPaymentProof(null);
        setPreview("");
        setReferenceNumber("");
        setRemarks("");
        setSale(null);
        setVerifiedTotal(0);

        onClose();
    };

    // FILTER PAYMENT ACCOUNTS

    const filteredAccounts =
        paymentAccounts.filter((account) => {
            const provider =
                account.account_provider.toLowerCase();

            if (paymentMethod === "gcash") {
                return provider.includes("gcash");
            }

            if (
                paymentMethod ===
                "bank_transfer"
            ) {
                return !provider.includes("gcash");
            }

            return false;
        });

    // UI

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="2xl"
            scrollBehavior="inside"
            isCentered
        >
            <ModalOverlay />

            <ModalContent>
                <ModalHeader>
                    Pay Remaining Balance
                </ModalHeader>

                <ModalCloseButton />

                <ModalBody>
                    <VStack
                        spacing={5}
                        align="stretch"
                    >
                        {/* SALE SUMMARY */}

                        <Box
                            borderWidth="1px"
                            borderRadius="xl"
                            overflow="hidden"
                            bg="white"
                        >
                            <Box
                                px={5}
                                py={4}
                                bg="blue.50"
                                borderBottomWidth="1px"
                            >
                                <Text
                                    fontSize="lg"
                                    fontWeight="bold"
                                    color="blue.700"
                                >
                                    Sale Summary
                                </Text>

                                <Text
                                    fontSize="sm"
                                    color="gray.600"
                                    mt={1}
                                >
                                    Review the sale amount
                                    and remaining balance
                                    before submitting payment.
                                </Text>
                            </Box>

                            <VStack
                                p={5}
                                spacing={3}
                                align="stretch"
                            >
                                {vehicleName && (
                                    <HStack
                                        justify="space-between"
                                        align="flex-start"
                                    >
                                        <Text
                                            color="gray.500"
                                            fontSize="sm"
                                        >
                                            Vehicle
                                        </Text>

                                        <Text
                                            fontWeight="semibold"
                                            textAlign="right"
                                            maxW="65%"
                                        >
                                            {vehicleName}
                                        </Text>
                                    </HStack>
                                )}

                                <HStack
                                    justify="space-between"
                                >
                                    <Text
                                        color="gray.500"
                                        fontSize="sm"
                                    >
                                        Invoice
                                    </Text>

                                    <Text
                                        fontWeight="semibold"
                                    >
                                        {saleLoading
                                            ? "Loading..."
                                            : sale?.invoice_number ??
                                            "N/A"}
                                    </Text>
                                </HStack>

                                <Box
                                    borderTopWidth="1px"
                                    borderColor="gray.200"
                                    pt={4}
                                    mt={1}
                                >
                                    <VStack
                                        spacing={3}
                                        align="stretch"
                                    >
                                        <HStack
                                            justify="space-between"
                                        >
                                            <Text color="gray.600">
                                                Selling Price
                                            </Text>

                                            <Text fontWeight="semibold">
                                                ₱
                                                {formatCurrency(
                                                    sellingPrice
                                                )}
                                            </Text>
                                        </HStack>

                                        <HStack
                                            justify="space-between"
                                        >
                                            <Text color="gray.600">
                                                Discount
                                            </Text>

                                            <Text
                                                fontWeight="semibold"
                                                color="red.500"
                                            >
                                                − ₱
                                                {formatCurrency(
                                                    discountAmount
                                                )}
                                            </Text>
                                        </HStack>

                                        <HStack
                                            justify="space-between"
                                            pt={3}
                                            borderTopWidth="1px"
                                            borderColor="gray.200"
                                        >
                                            <Text
                                                fontWeight="bold"
                                                color="gray.700"
                                            >
                                                Total Sale
                                            </Text>

                                            <Text
                                                fontSize="xl"
                                                fontWeight="bold"
                                                color="blue.600"
                                            >
                                                ₱
                                                {formatCurrency(
                                                    totalSaleAmount
                                                )}
                                            </Text>
                                        </HStack>

                                        <HStack
                                            justify="space-between"
                                        >
                                            <Text color="gray.600">
                                                Verified Payments
                                            </Text>

                                            <Text
                                                fontWeight="semibold"
                                                color="green.600"
                                            >
                                                ₱
                                                {formatCurrency(
                                                    verifiedTotal
                                                )}
                                            </Text>
                                        </HStack>

                                        <Box
                                            mt={1}
                                            p={4}
                                            borderRadius="lg"
                                            bg={
                                                isFullyPaid
                                                    ? "green.50"
                                                    : "orange.50"
                                            }
                                            borderWidth="1px"
                                            borderColor={
                                                isFullyPaid
                                                    ? "green.200"
                                                    : "orange.200"
                                            }
                                        >
                                            <HStack
                                                justify="space-between"
                                                align="center"
                                            >
                                                <Box>
                                                    <Text
                                                        fontSize="sm"
                                                        color="gray.600"
                                                    >
                                                        Remaining Balance
                                                    </Text>

                                                    <Text
                                                        fontSize="xs"
                                                        color="gray.500"
                                                        mt={1}
                                                    >
                                                        Total Sale −
                                                        Verified Payments
                                                    </Text>
                                                </Box>

                                                <Text
                                                    fontSize="2xl"
                                                    fontWeight="bold"
                                                    color={
                                                        isFullyPaid
                                                            ? "green.600"
                                                            : "orange.600"
                                                    }
                                                >
                                                    ₱
                                                    {formatCurrency(
                                                        calculatedRemainingBalance
                                                    )}
                                                </Text>
                                            </HStack>
                                        </Box>
                                    </VStack>
                                </Box>
                            </VStack>
                        </Box>

                        {/* PAYMENT DETAILS */}

                        <Box
                            borderWidth="1px"
                            borderRadius="xl"
                            p={5}
                        >
                            <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="green.600"
                                mb={1}
                            >
                                Payment Details
                            </Text>

                            <Text
                                fontSize="sm"
                                color="gray.500"
                                mb={4}
                            >
                                Submit the remaining balance
                                for verification.
                            </Text>

                            <VStack
                                spacing={4}
                                align="stretch"
                            >
                                {/* PAYMENT TYPE */}

                                <FormControl isRequired>
                                    <FormLabel>
                                        Payment Type
                                    </FormLabel>

                                    <Input
                                        value="Remaining Balance"
                                        isReadOnly
                                        bg="gray.100"
                                        fontWeight="semibold"
                                    />
                                </FormControl>

                                {/* AMOUNT */}

                                <FormControl isRequired>
                                    <FormLabel>
                                        Amount
                                    </FormLabel>

                                    <Input
                                        value={`₱${formatCurrency(
                                            calculatedRemainingBalance
                                        )}`}
                                        isReadOnly
                                        bg="green.50"
                                        borderColor="green.200"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        color="green.700"
                                    />

                                    <Text
                                        fontSize="xs"
                                        color="gray.500"
                                        mt={1}
                                    >
                                        This amount is the
                                        remaining balance after
                                        verified payments.
                                    </Text>
                                </FormControl>

                                {/* PAYMENT METHOD */}

                                <FormControl isRequired>
                                    <FormLabel>
                                        Payment Method
                                    </FormLabel>

                                    <Select
                                        placeholder="Select payment method"
                                        value={paymentMethod}
                                        onChange={(e) =>
                                            handlePaymentMethodChange(
                                                e.target.value as PaymentMethod
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select payment method
                                        </option>

                                        <option value="gcash">
                                            GCash
                                        </option>

                                        <option value="bank_transfer">
                                            Bank Transfer
                                        </option>
                                    </Select>
                                </FormControl>

                                {/* PAYMENT ACCOUNT */}

                                <FormControl isRequired>
                                    <FormLabel>
                                        Payment Account
                                    </FormLabel>

                                    <Select
                                        placeholder="Select Payment Account"
                                        value={
                                            paymentAccountId ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            handlePaymentAccountChange(
                                                e.target.value
                                            )
                                        }
                                    >
                                        {filteredAccounts.map(
                                            (account) => (
                                                <option
                                                    key={
                                                        account.id
                                                    }
                                                    value={
                                                        account.id
                                                    }
                                                >
                                                    {
                                                        account.account_provider
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        account.account_name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </Select>
                                </FormControl>

                                {/* PAYMENT ACCOUNT / QR CODE */}

                                {selectedAccount && selectedAccount.qr_code_path && (
                                    <Box
                                        mt={4}
                                        p={{ base: 3, sm: 4 }}
                                        border="2px solid"
                                        borderColor="blue.300"
                                        borderRadius="xl"
                                        bg="blue.50"
                                        textAlign="center"
                                        boxShadow="0 2px 8px rgba(66, 153, 225, 0.12)"
                                    >
                                        <Text
                                            fontSize="xs"
                                            fontWeight="800"
                                            letterSpacing="0.08em"
                                            color="blue.700"
                                            mb={1}
                                        >
                                            SCAN TO PAY
                                        </Text>

                                        <Text
                                            fontSize="sm"
                                            color="gray.600"
                                            mb={4}
                                        >
                                            Scan this QR code using your{" "}
                                            {selectedAccount.account_provider} app.
                                        </Text>

                                        <Box
                                            mx="auto"
                                            w={{ base: "240px", sm: "270px" }}
                                            h={{ base: "240px", sm: "270px" }}
                                            p={{ base: 3, sm: 4 }}
                                            bg="white"
                                            border="2px solid"
                                            borderColor="blue.400"
                                            borderRadius="lg"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            boxShadow="0 2px 10px rgba(0, 0, 0, 0.08)"
                                        >
                                            <Image
                                                src={`/storage/${selectedAccount.qr_code_path}`}
                                                alt={`${selectedAccount.account_provider} QR Code`}
                                                w="100%"
                                                h="100%"
                                                objectFit="contain"
                                                display="block"
                                            />
                                        </Box>

                                        <Box mt={4}>
                                            <Text
                                                fontSize="sm"
                                                fontWeight="700"
                                                color="gray.800"
                                            >
                                                {selectedAccount.account_provider}
                                            </Text>

                                            {selectedAccount.account_name && (
                                                <Text
                                                    fontSize="sm"
                                                    color="gray.600"
                                                    mt={1}
                                                >
                                                    {selectedAccount.account_name}
                                                </Text>
                                            )}

                                            <Text
                                                fontSize="sm"
                                                fontWeight="600"
                                                color="blue.700"
                                                mt={1}
                                            >
                                                {selectedAccount.account_number}
                                            </Text>
                                        </Box>
                                    </Box>
                                )}

                                {/* REFERENCE NUMBER */}

                                <FormControl isRequired>
                                    <FormLabel>
                                        Reference Number
                                    </FormLabel>

                                    <Input
                                        placeholder="Enter payment reference number"
                                        value={
                                            referenceNumber
                                        }
                                        onChange={(e) =>
                                            setReferenceNumber(
                                                e.target.value
                                            )
                                        }
                                    />
                                </FormControl>

                                {/* PAYMENT PROOF */}

                                <FormControl isRequired>
                                    <FormLabel>
                                        Payment Proof
                                    </FormLabel>

                                    <Input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        p={1}
                                        onChange={
                                            handleFileChange
                                        }
                                    />

                                    <Text
                                        fontSize="xs"
                                        color="gray.500"
                                        mt={1}
                                    >
                                        JPG, JPEG, PNG, or
                                        WEBP. Maximum size:
                                        2MB.
                                    </Text>

                                    {preview && (
                                        <Box
                                            mt={3}
                                            p={3}
                                            borderWidth="1px"
                                            borderColor="gray.200"
                                            borderRadius="lg"
                                            bg="gray.50"
                                        >
                                            <Image
                                                src={preview}
                                                maxH="220px"
                                                mx="auto"
                                                objectFit="contain"
                                                borderRadius="md"
                                                bg="white"
                                            />
                                        </Box>
                                    )}
                                </FormControl>

                                {/* PAYMENT DATE */}

                                <FormControl>
                                    <FormLabel>
                                        Payment Date
                                    </FormLabel>

                                    <Input
                                        type="date"
                                        value={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        isReadOnly
                                        bg="gray.100"
                                    />
                                </FormControl>

                                {/* REMARKS */}

                                <FormControl>
                                    <FormLabel>
                                        Remarks
                                    </FormLabel>

                                    <Textarea
                                        rows={3}
                                        placeholder="Optional remarks"
                                        value={remarks}
                                        onChange={(e) =>
                                            setRemarks(
                                                e.target.value
                                            )
                                        }
                                    />
                                </FormControl>
                            </VStack>
                        </Box>
                    </VStack>
                </ModalBody>

                {/* FOOTER */}

                <ModalFooter>
                    <Button
                        variant="ghost"
                        mr={3}
                        onClick={handleClose}
                        isDisabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        colorScheme="green"
                        onClick={handleSubmit}
                        isLoading={loading}
                        loadingText="Submitting..."
                        isDisabled={
                            calculatedRemainingBalance <=
                            0 ||
                            !sale?.id ||
                            saleLoading ||
                            balanceLoading
                        }
                    >
                        {isFullyPaid
                            ? "Fully Paid"
                            : "Submit Payment"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}