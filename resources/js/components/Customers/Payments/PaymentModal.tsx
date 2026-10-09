import { useEffect, useState, type ChangeEvent } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Input,
    Text,
    Box,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    Select,
    Textarea,
    Image,
    Divider,
    useToast,
} from "@chakra-ui/react";
import { createPayment } from "../../../api/PaymentManagement/paymentApi";
import type {
    CreatePaymentData,
    PaymentMethod,
    PaymentType,
} from "../../../api/PaymentManagement/paymentApi";
import {
    getPaymentAccounts,
    type PaymentAccount,
} from "../../../api/PaymentManagement/accountApi";
import type { Reservation } from "../../../api/ReservationManagement/reservationApi";
import api from "../../../api/api";

interface PaymentSale {
    id: number;
    reservation_id: number;
    invoice_number?: string | null;
    discount_amount?: number | string | null;
    sale_date?: string | null;
    status?: string | null;
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: Reservation | null;
    sale?: PaymentSale | null;
    onPaid: () => void;
    financingPayment?: boolean;
    financingId?: number | null;
}

export default function ModalCustomerPayment({
    isOpen,
    onClose,
    reservation,
    sale,
    onPaid,
    financingPayment = false,
    financingId: financingIdOverride = null,
}: PaymentModalProps) {
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>(
        []
    );
    const [selectedAccount, setSelectedAccount] =
        useState<PaymentAccount | null>(null);

    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [preview, setPreview] = useState("");

    const isFinancingReservation =
        financingPayment ||
        reservation?.purchase_option === "financing";

    const financingId =
        financingIdOverride ??
        (reservation?.financing as { id?: number } | null)?.id ??
        null;

    const [loadedSale, setLoadedSale] = useState<PaymentSale | null>(
        sale ?? null
    );
    const [saleLoading, setSaleLoading] = useState(false);

    const effectiveSale = sale ?? loadedSale;

    // SALE TOTAL

    const sellingPrice = Number(
        reservation?.vehicle?.selling_price ?? 0
    );

    const discountAmount = Number(
        effectiveSale?.discount_amount ?? 0
    );

    const totalAmount = Math.max(
        sellingPrice - discountAmount,
        0
    );

    // FORM

    const [form, setForm] = useState<CreatePaymentData>({
        reservation_id: 0,
        sale_id: 0,
        financing_info_id: null,
        payer_type: "customer",
        payment_account_id: null,
        payment_type: "reservation_fee",
        payment_method: "" as PaymentMethod,
        amount: 0,
        reference_number: "",
        payment_proof: null,
        remarks: "",
    });

    // PAYMENT CONDITIONS

    const requiresPaymentAccount =
        form.payment_method === "gcash" ||
        form.payment_method === "bank_transfer";

    const isPhysicalPayment =
        form.payment_method === "cash" ||
        form.payment_method === "check";

    const requiresPaymentDetails = !isPhysicalPayment;

    // LOAD PAYMENT ACCOUNTS

    const loadPaymentAccounts = async () => {
        try {
            const accounts = await getPaymentAccounts();

            setPaymentAccounts(
                accounts.filter((account) => account.is_active)
            );
        } catch (error) {
            console.error(
                "Unable to load payment accounts:",
                error
            );

            toast({
                title: "Unable to load payment accounts.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // PAYMENT AMOUNT

    const getPaymentAmount = (
        paymentType: PaymentType
    ): number => {
        if (!reservation) {
            return 0;
        }

        switch (paymentType) {
            case "reservation_fee":
                return Number(
                    reservation.vehicle?.reservation_price ?? 0
                );

            case "full_payment":
            case "financing_release":
                return totalAmount;

            case "partial_payment":
                return 0;

            default:
                return 0;
        }
    };

    // INITIALIZE

    useEffect(() => {
        if (!isOpen || !reservation) return;

        let cancelled = false;

        const initialize = async () => {
            try {
                setSaleLoading(true);

                let saleData: PaymentSale | null = sale ?? null;

                if (!saleData) {
                    const response = await api.get<{
                        message?: string;
                        data?: PaymentSale[];
                    }>("/sales");

                    const sales = Array.isArray(response.data?.data)
                        ? response.data.data
                        : [];

                    saleData =
                        sales.find(
                            (item) =>
                                Number(item.reservation_id) ===
                                Number(reservation.id)
                        ) ?? null;
                }

                if (cancelled) return;

                setLoadedSale(saleData);

                await loadPaymentAccounts();

                if (cancelled) return;

                setPaymentProof(null);
                setPreview("");
                setSelectedAccount(null);

                const sellingPrice = Number(
                    reservation.vehicle?.selling_price ?? 0
                );

                const discount = Number(
                    saleData?.discount_amount ?? 0
                );

                const total = Math.max(
                    sellingPrice - discount,
                    0
                );

                const paymentType: PaymentType =
                    isFinancingReservation
                        ? "full_payment"
                        : "reservation_fee";

                setForm({
                    reservation_id: reservation.id,
                    sale_id: saleData?.id ?? 0,
                    financing_info_id:
                        isFinancingReservation
                            ? financingId
                            : null,
                    payer_type:
                        isFinancingReservation
                            ? "financing_company"
                            : "customer",
                    payment_account_id: null,
                    payment_type: paymentType,
                    payment_method: "" as PaymentMethod,
                    amount:
                        paymentType === "reservation_fee"
                            ? Number(
                                reservation.vehicle?.reservation_price ?? 0
                            )
                            : total,
                    reference_number: "",
                    payment_proof: null,
                    remarks: "",
                });
            } catch (error) {
                if (cancelled) return;

                console.error(
                    "Unable to initialize payment modal:",
                    error
                );

                setLoadedSale(null);

                toast({
                    title: "Unable to load payment information.",
                    description:
                        "Please check the sale and payment account data.",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                });
            } finally {
                if (!cancelled) {
                    setSaleLoading(false);
                }
            }
        };

        initialize();

        return () => {
            cancelled = true;
        };
    }, [
        isOpen,
        reservation,
        sale,
        financingId,
        isFinancingReservation,
    ]);

    // PAYMENT TYPE

    const handlePaymentTypeChange = (
        paymentType: PaymentType
    ) => {
        setForm((prev) => ({
            ...prev,
            payment_type: paymentType,
            amount: getPaymentAmount(paymentType),
        }));
    };

    // PAYMENT METHOD

    const handlePaymentMethodChange = (
        paymentMethod: PaymentMethod
    ) => {
        setSelectedAccount(null);
        setPaymentProof(null);
        setPreview("");

        setForm((prev) => ({
            ...prev,
            payment_method: paymentMethod,
            payment_account_id: null,
            reference_number: "",
            payment_proof: null,
        }));
    };

    // PAYMENT ACCOUNT

    const handlePaymentAccountChange = (
        value: string
    ) => {
        if (!value) {
            setSelectedAccount(null);

            setForm((prev) => ({
                ...prev,
                payment_account_id: null,
            }));

            return;
        }

        const accountId = Number(value);

        const account =
            paymentAccounts.find(
                (item) => item.id === accountId
            ) ?? null;

        setSelectedAccount(account);

        setForm((prev) => ({
            ...prev,
            payment_account_id: accountId,
        }));
    };

    // INPUT CHANGE

    const handleChange = (
        e: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // PAYMENT PROOF

    const handleFileChange = (
        e: ChangeEvent<HTMLInputElement>
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
                    "Please upload JPG, JPEG, PNG, or WEBP.",
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

        setPaymentProof(file);

        setPreview(
            URL.createObjectURL(file)
        );

        setForm((prev) => ({
            ...prev,
            payment_proof: file,
        }));
    };

    // SUBMIT

    const handleSubmit = async () => {
        if (!reservation) return;

        if (!effectiveSale?.id) {
            toast({
                title: "Sale Required",
                description:
                    "This reservation does not have a sale yet.",
                status: "warning",
                duration: 4000,
                isClosable: true,
            });

            return;
        }

        const amount = Number(form.amount);

        if (!amount || amount <= 0) {
            toast({
                title: "Invalid Amount",
                description:
                    form.payment_type === "partial_payment"
                        ? "Please enter a valid partial payment amount."
                        : "The selected payment amount is invalid.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        if (
            form.payment_type === "partial_payment" &&
            amount > totalAmount
        ) {
            toast({
                title: "Invalid Amount",
                description:
                    "Partial payment cannot be greater than the total sale amount.",
                status: "warning",
                duration: 4000,
                isClosable: true,
            });

            return;
        }

        if (
            requiresPaymentAccount &&
            !form.payment_account_id
        ) {
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

        if (
            requiresPaymentDetails &&
            !form.reference_number?.trim()
        ) {
            toast({
                title: "Reference Number Required",
                description:
                    "Please enter the online payment reference number.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        if (
            requiresPaymentDetails &&
            !paymentProof
        ) {
            toast({
                title: "Payment Proof Required",
                description:
                    "Please upload payment proof.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        if (
            isFinancingReservation &&
            !financingId
        ) {
            toast({
                title: "Financing Record Required",
                description:
                    "Unable to link this payment to a financing record.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });

            return;
        }

        try {
            setLoading(true);

            await createPayment({
                reservation_id: reservation.id,
                sale_id: effectiveSale.id,
                financing_info_id:
                    isFinancingReservation
                        ? financingId
                        : null,
                payer_type:
                    isFinancingReservation
                        ? "financing_company"
                        : "customer",
                payment_account_id:
                    requiresPaymentAccount
                        ? form.payment_account_id
                        : null,
                payment_type:
                    isFinancingReservation
                        ? "full_payment"
                        : form.payment_type,
                payment_method:
                    form.payment_method,
                amount,
                reference_number:
                    requiresPaymentDetails
                        ? form.reference_number?.trim() || null
                        : null,
                payment_proof:
                    requiresPaymentDetails
                        ? paymentProof
                        : null,
                remarks:
                    form.remarks?.trim() || null,
            });

            toast({
                title: "Payment Recorded",
                description:
                    "The payment has been recorded successfully.",
                status: "success",
                duration: 4000,
                isClosable: true,
            });

            onPaid();
            handleClose();
        } catch (error: any) {
            console.error(
                "Payment submission failed:",
                error
            );

            const message =
                error?.response?.data?.message ??
                (
                    error?.response?.data?.errors
                        ? Object.values(
                            error.response.data.errors
                        )
                            .flat()
                            .join(" ")
                        : "Unable to submit payment."
                );

            toast({
                title: "Payment Failed",
                description: message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // CLOSE

    const handleClose = () => {
        if (loading) return;

        setPaymentProof(null);
        setPreview("");
        setSelectedAccount(null);
        setLoadedSale(null);

        setForm({
            reservation_id: 0,
            sale_id: 0,
            financing_info_id: null,
            payer_type: "customer",
            payment_account_id: null,
            payment_type: "reservation_fee",
            payment_method: "cash",
            amount: 0,
            reference_number: "",
            payment_proof: null,
            remarks: "",
        });

        onClose();
    };

    // PAYMENT ACCOUNTS

    const filteredAccounts =
        paymentAccounts.filter((account) => {
            const provider =
                account.account_provider?.toLowerCase() ??
                "";

            if (form.payment_method === "gcash") {
                return provider.includes("gcash");
            }

            if (
                form.payment_method ===
                "bank_transfer"
            ) {
                return !provider.includes("gcash");
            }

            return false;
        });

    // CURRENCY

    const money = (value: number) =>
        `₱${value.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    // RENDER

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
                    Payment
                </ModalHeader>

                <ModalCloseButton />

                <ModalBody>
                    <VStack
                        spacing={6}
                        align="stretch"
                    >
                        <Box>
                            <Text
                                fontSize="md"
                                fontWeight="700"
                                color="blue.600"
                                mb={4}
                            >
                                SALE INFORMATION
                            </Text>

                            <Box mb={5}>
                                <Text
                                    fontSize="sm"
                                    color="gray.500"
                                    mb={1}
                                >
                                    Invoice Number
                                </Text>

                                <Text
                                    fontWeight="600"
                                    fontSize="md"
                                >
                                    {saleLoading
                                        ? "Loading..."
                                        : effectiveSale?.invoice_number ??
                                        "N/A"}
                                </Text>
                            </Box>

                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={3}
                            >
                                <Text color="gray.600">
                                    Selling Price
                                </Text>

                                <Text fontWeight="600">
                                    {money(sellingPrice)}
                                </Text>
                            </Box>

                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={3}
                            >
                                <Text color="gray.600">
                                    Discount Amount
                                </Text>

                                <Text
                                    fontWeight="600"
                                    color="red.500"
                                >
                                    - {money(discountAmount)}
                                </Text>
                            </Box>

                            <Divider />

                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                pt={4}
                            >
                                <Text
                                    fontWeight="700"
                                    fontSize="lg"
                                >
                                    Total Amount
                                </Text>

                                <Text
                                    fontWeight="700"
                                    fontSize="xl"
                                    color="green.600"
                                >
                                    {money(totalAmount)}
                                </Text>
                            </Box>
                        </Box>

                        <Divider />

                        <Box>
                            <Text
                                fontSize="md"
                                fontWeight="700"
                                color="blue.600"
                                mb={5}
                            >
                                PAYMENT INFORMATION
                            </Text>

                            <VStack
                                spacing={5}
                                align="stretch"
                            >
                                <FormControl isRequired>
                                    <FormLabel>
                                        Payment Type
                                    </FormLabel>

                                    <Select
                                        value={form.payment_type}
                                        onChange={(e) =>
                                            handlePaymentTypeChange(
                                                e.target.value as PaymentType
                                            )
                                        }
                                        isDisabled={
                                            isFinancingReservation
                                        }
                                    >
                                        {!isFinancingReservation && (
                                            <option value="reservation_fee">
                                                Reservation Fee
                                            </option>
                                        )}

                                        {!isFinancingReservation && (
                                            <option value="partial_payment">
                                                Partial Payment
                                            </option>
                                        )}

                                        <option value="full_payment">
                                            Full Payment
                                        </option>

                                        {isFinancingReservation && (
                                            <option value="financing_release">
                                                Financing Release
                                            </option>
                                        )}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>
                                        Amount
                                    </FormLabel>

                                    <Input
                                        name="amount"
                                        type="number"
                                        value={form.amount}
                                        onChange={handleChange}
                                        isReadOnly={
                                            form.payment_type !==
                                            "partial_payment"
                                        }
                                        placeholder="Enter amount"
                                    />

                                    {form.payment_type ===
                                        "partial_payment" && (
                                            <Text
                                                fontSize="xs"
                                                color="gray.500"
                                                mt={1}
                                            >
                                                Maximum:{" "}
                                                {money(totalAmount)}
                                            </Text>
                                        )}
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>
                                        Payment Method
                                    </FormLabel>

                                    <Select
                                        placeholder="Select payment method"
                                        value={form.payment_method}
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

                                {requiresPaymentAccount && (
                                    <FormControl isRequired>
                                        <FormLabel>
                                            Payment Account
                                        </FormLabel>

                                        <Select
                                            placeholder="Select payment account"
                                            value={
                                                form.payment_account_id ??
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
                                                        key={account.id}
                                                        value={account.id}
                                                    >
                                                        {
                                                            account.account_provider
                                                        }
                                                        {account.account_name
                                                            ? ` - ${account.account_name}`
                                                            : ""}
                                                    </option>
                                                )
                                            )}
                                        </Select>

                                        {selectedAccount && (
                                            <Box mt={3}>
                                                <Text
                                                    fontSize="xs"
                                                    color="gray.500"
                                                    mb={2}
                                                >
                                                    Account Number:{" "}
                                                    {
                                                        selectedAccount.account_number
                                                    }
                                                </Text>

                                                {selectedAccount.qr_code_path && (
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
                                                        {/* QR HEADER */}

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
                                                            Scan this QR code using your
                                                            {selectedAccount.account_provider} app.
                                                        </Text>

                                                        {/* QR CODE HIGHLIGHT */}

                                                        <Box
                                                            mx="auto"
                                                            w={{
                                                                base: "240px",
                                                                sm: "270px",
                                                            }}
                                                            h={{
                                                                base: "240px",
                                                                sm: "270px",
                                                            }}
                                                            p={{
                                                                base: 3,
                                                                sm: 4,
                                                            }}
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

                                                        {/* ACCOUNT INFORMATION */}

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
                                            </Box>
                                        )}
                                    </FormControl>
                                )}

                                {requiresPaymentDetails && (
                                    <FormControl isRequired>
                                        <FormLabel>
                                            Reference Number
                                        </FormLabel>

                                        <Input
                                            name="reference_number"
                                            value={
                                                form.reference_number ?? ""
                                            }
                                            onChange={handleChange}
                                            placeholder="Enter reference number"
                                        />
                                    </FormControl>
                                )}

                                {requiresPaymentDetails && (
                                    <FormControl isRequired>
                                        <FormLabel>
                                            Payment Proof
                                        </FormLabel>

                                        <Input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleFileChange}
                                            p={1}
                                        />

                                        {preview && (
                                            <Box
                                                mt={3}
                                                borderWidth="1px"
                                                borderRadius="md"
                                                overflow="hidden"
                                                maxW="300px"
                                            >
                                                <Image
                                                    src={preview}
                                                    alt="Payment proof preview"
                                                    maxH="180px"
                                                    objectFit="contain"
                                                    w="100%"
                                                />
                                            </Box>
                                        )}
                                    </FormControl>
                                )}

                                <FormControl>
                                    <FormLabel>
                                        Remarks
                                    </FormLabel>

                                    <Textarea
                                        name="remarks"
                                        value={form.remarks ?? ""}
                                        onChange={handleChange}
                                        placeholder="Enter remarks"
                                        rows={3}
                                        resize="vertical"
                                    />
                                </FormControl>
                            </VStack>
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <HStack spacing={3}>
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            isDisabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button
                            colorScheme="blue"
                            onClick={handleSubmit}
                            isLoading={loading}
                            loadingText="Submitting..."
                        >
                            Submit Payment
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}