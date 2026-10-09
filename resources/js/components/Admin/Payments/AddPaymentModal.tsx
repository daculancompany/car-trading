import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    FormControl,
    FormLabel,
    Select,
    Input,
    Textarea,
    Image,
    useToast,
    Text,
    Box,
    Grid,
    HStack,
} from "@chakra-ui/react";

import {
    BanknotesIcon,
    CalendarDaysIcon,
    IdentificationIcon,
    QrCodeIcon,
    TruckIcon,
} from "@heroicons/react/24/solid";

import {
    createPayment,
    type CreatePaymentData,
    type PaymentType,
    type PaymentMethod,
} from "../../../api/PaymentManagement/paymentApi";

import {
    getReservations,
    type Reservation,
} from "../../../api/ReservationManagement/reservationApi";

import {
    getPaymentAccounts,
    type PaymentAccount,
} from "../../../api/PaymentManagement/accountApi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
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
        <HStack
            spacing={3}
            mb={4}
            align="flex-start"
        >
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxSize="34px"
                flexShrink={0}
                rounded="md"
                bg="brand.50"
                color="brand.500"
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
                        mt={0.5}
                        fontSize="xs"
                        color="gray.500"
                    >
                        {description}
                    </Text>
                )}
            </Box>
        </HStack>
    );
};

// Info Row

const InfoRow = ({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) => {
    return (
        <Box
            display="flex"
            gap={3}
            py={1.5}
            borderBottom="1px solid"
            borderColor="gray.100"
            _last={{
                borderBottom: "none",
            }}
        >
            <Text
                minW={{ base: "105px", sm: "125px" }}
                fontSize="xs"
                fontWeight="600"
                color="gray.500"
            >
                {label}
            </Text>

            <Text
                flex="1"
                fontSize="sm"
                fontWeight="500"
                color="gray.800"
            >
                {value || "-"}
            </Text>
        </Box>
    );
};

export default function AddPaymentModal({
    isOpen,
    onClose,
    onSuccess,
}: Props) {
    const toast = useToast();

    const [loading, setLoading] = useState(false);

    const [reservations, setReservations] =
        useState<Reservation[]>([]);

    const [accounts, setAccounts] =
        useState<PaymentAccount[]>([]);

    const [selectedAccount, setSelectedAccount] =
        useState<PaymentAccount | null>(null);

    const [preview, setPreview] =
        useState("");

    const [form, setForm] = useState<CreatePaymentData>({
        reservation_id: 0,
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

    // Load Reservations + Payment Accounts

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        loadData();
    }, [isOpen]);

    const loadData = async () => {
        try {
            setLoading(true);

            const [
                reservationData,
                accountData,
            ] = await Promise.all([
                getReservations(),
                getPaymentAccounts(),
            ]);

            setReservations(reservationData);

            setAccounts(
                accountData.filter(
                    (account) => account.is_active
                )
            );
        } catch (error) {
            console.error(
                "Failed to load payment data:",
                error
            );

            toast({
                title:
                    "Failed to load payment information.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Selected Reservation

    const selectedReservation =
        reservations.find(
            (reservation) =>
                reservation.id ===
                form.reservation_id
        );

    // Payment Amount

    const getPaymentAmount = (
        paymentType: PaymentType
    ) => {
        const vehicle =
            selectedReservation?.vehicle;

        if (!vehicle) {
            return 0;
        }

        if (
            paymentType ===
            "reservation_fee"
        ) {
            return Number(
                vehicle.reservation_price ?? 0
            );
        }

        if (
            paymentType ===
            "full_payment"
        ) {
            return Number(
                vehicle.selling_price ?? 0
            );
        }

        return 0;
    };

    // Reservation Change

    const handleReservationChange = (
        value: string
    ) => {
        const reservationId =
            Number(value);

        const reservation =
            reservations.find(
                (item) =>
                    item.id === reservationId
            );

        setForm((prev) => ({
            ...prev,

            reservation_id:
                reservationId,

            amount:
                prev.payment_type ===
                    "reservation_fee"
                    ? Number(
                        reservation?.vehicle
                            ?.reservation_price ?? 0
                    )
                    : prev.payment_type ===
                        "full_payment"
                        ? Number(
                            reservation?.vehicle
                                ?.selling_price ?? 0
                        )
                        : prev.amount,
        }));
    };

    // Payment Type Change

    const handlePaymentTypeChange = (
        paymentType: PaymentType
    ) => {
        setForm((prev) => ({
            ...prev,

            payment_type: paymentType,

            amount:
                getPaymentAmount(
                    paymentType
                ),
        }));
    };

    // Payment Method Change

    const handlePaymentMethodChange = (
        paymentMethod: PaymentMethod
    ) => {
        setForm((prev) => ({
            ...prev,

            payment_method:
                paymentMethod,

            payment_account_id:
                null,

            reference_number:
                paymentMethod === "cash"
                    ? ""
                    : prev.reference_number,

            payment_proof:
                paymentMethod === "cash"
                    ? null
                    : prev.payment_proof,
        }));

        setSelectedAccount(null);

        setPreview("");
    };

    // Payment Account Change

    const handleAccountChange = (
        value: string
    ) => {
        const accountId =
            Number(value);

        const account =
            accounts.find(
                (item) =>
                    item.id === accountId
            ) ?? null;

        setForm((prev) => ({
            ...prev,

            payment_account_id:
                accountId,
        }));

        setSelectedAccount(account);
    };

    // Payment Proof

    const handlePaymentProof = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            e.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {
            toast({
                title:
                    "Invalid payment proof.",
                description:
                    "Please upload a JPG, JPEG, PNG, or WEBP image.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        if (
            file.size >
            2 * 1024 * 1024
        ) {
            toast({
                title:
                    "Payment proof is too large.",
                description:
                    "Maximum file size is 2MB.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        setForm((prev) => ({
            ...prev,

            payment_proof: file,
        }));

        setPreview(
            URL.createObjectURL(file)
        );
    };

    // Submit

    const handleSubmit = async () => {
        if (
            !form.reservation_id
        ) {
            toast({
                title:
                    "Please select a reservation.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        if (
            !form.amount ||
            form.amount <= 0
        ) {
            toast({
                title:
                    "Please enter a valid payment amount.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        if (
            (
                form.payment_method ===
                "gcash" ||
                form.payment_method ===
                "bank_transfer"
            ) &&
            !form.payment_account_id
        ) {
            toast({
                title:
                    "Please select a payment account.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        if (
            (
                form.payment_method ===
                "gcash" ||
                form.payment_method ===
                "bank_transfer"
            ) &&
            !form.reference_number
        ) {
            toast({
                title:
                    "Reference number is required.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        if (
            (
                form.payment_method ===
                "gcash" ||
                form.payment_method ===
                "bank_transfer"
            ) &&
            !form.payment_proof
        ) {
            toast({
                title:
                    "Payment proof is required.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        try {
            setLoading(true);

            await createPayment(form);

            toast({
                title:
                    "Payment created successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            resetForm();

            onSuccess();

            onClose();
        } catch (error) {
            console.error(
                "Failed to create payment:",
                error
            );

            toast({
                title:
                    "Failed to save payment.",
                description:
                    "Please check the payment information and try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Reset

    const resetForm = () => {
        const emptyPayment: CreatePaymentData = {
            reservation_id: 0,
            financing_info_id: null,
            payer_type: "customer",
            payment_account_id: null,
            payment_type: "reservation_fee",
            payment_method: "cash",
            amount: 0,
            reference_number: "",
            payment_proof: null,
            remarks: "",
        };

        setForm(emptyPayment);

        setSelectedAccount(null);
        setPreview("");
    };

    // Close

    const handleClose = () => {
        if (loading) {
            return;
        }

        resetForm();

        onClose();
    };

    // Payment Account Filtering

    const filteredAccounts =
        accounts.filter((account) => {
            if (
                form.payment_method ===
                "gcash"
            ) {
                return account.account_provider
                    .toLowerCase()
                    .includes("gcash");
            }

            if (
                form.payment_method ===
                "bank_transfer"
            ) {
                return !account.account_provider
                    .toLowerCase()
                    .includes("gcash");
            }

            return false;
        });

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="xl"
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
                    <Text
                        fontSize="md"
                        fontWeight="700"
                        color="gray.800"
                    >
                        Add Payment
                    </Text>

                    <Text
                        mt={0.5}
                        fontSize="xs"
                        fontWeight="400"
                        color="gray.500"
                    >
                        Record a new customer payment
                        against a reservation.
                    </Text>
                </ModalHeader>

                <ModalCloseButton
                    top={4}
                    right={4}
                    size="sm"
                    rounded="md"
                    color="gray.500"
                    _hover={{
                        bg: "gray.100",
                        color: "gray.700",
                    }}
                />

                {/* BODY */}

                <ModalBody
                    px={6}
                    py={5}
                    bg="gray.50"
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap={4}
                    >
                        {/* RESERVATION SECTION */}

                        <Box
                            bg="white"
                            border="1px solid"
                            borderColor="gray.200"
                            rounded="lg"
                            shadow="sm"
                            p={5}
                        >
                            <SectionHeader
                                icon={
                                    <CalendarDaysIcon
                                        width={18}
                                        height={18}
                                    />
                                }
                                title="Reservation"
                                description="Select the reservation associated with this payment."
                            />

                            <FormControl isRequired>
                                <FormLabel
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.700"
                                    mb={1.5}
                                >
                                    Reservation
                                </FormLabel>

                                <Select
                                    size="sm"
                                    placeholder="Select Reservation"
                                    value={
                                        form.reservation_id ||
                                        ""
                                    }
                                    onChange={(e) =>
                                        handleReservationChange(
                                            e.target.value
                                        )
                                    }
                                    bg="white"
                                    borderColor="gray.300"
                                    rounded="md"
                                    _hover={{
                                        borderColor:
                                            "gray.400",
                                    }}
                                    _focus={{
                                        borderColor:
                                            "brand.500",
                                        boxShadow:
                                            "0 0 0 1px var(--chakra-colors-brand-500)",
                                    }}
                                >
                                    {reservations.map(
                                        (reservation) => (
                                            <option
                                                key={
                                                    reservation.id
                                                }
                                                value={
                                                    reservation.id
                                                }
                                            >
                                                Reservation #
                                                {
                                                    reservation.id
                                                }
                                            </option>
                                        )
                                    )}
                                </Select>
                            </FormControl>

                            {selectedReservation && (
                                <Box
                                    mt={4}
                                    p={4}
                                    bg="gray.50"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    rounded="md"
                                >
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.600"
                                        mb={2}
                                        textTransform="uppercase"
                                        letterSpacing="0.02em"
                                    >
                                        Reservation Details
                                    </Text>

                                    <InfoRow
                                        label="Customer"
                                        value={
                                            selectedReservation
                                                .customer
                                                ? [
                                                    selectedReservation
                                                        .customer
                                                        .first_name,
                                                    selectedReservation
                                                        .customer
                                                        .last_name,
                                                ].join(" ")
                                                : "-"
                                        }
                                    />

                                    <InfoRow
                                        label="Vehicle"
                                        value={
                                            [
                                                selectedReservation
                                                    .vehicle
                                                    ?.brand?.brand,
                                                selectedReservation
                                                    .vehicle
                                                    ?.model?.model,
                                                selectedReservation
                                                    .vehicle
                                                    ?.variant
                                                    ?.variant,
                                            ]
                                                .filter(Boolean)
                                                .join(" ") ||
                                            "-"
                                        }
                                    />

                                    <InfoRow
                                        label="Stock No."
                                        value={
                                            selectedReservation
                                                .vehicle
                                                ?.stock_no ??
                                            "-"
                                        }
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* PAYMENT INFORMATION */}

                        <Box
                            bg="white"
                            border="1px solid"
                            borderColor="gray.200"
                            rounded="lg"
                            shadow="sm"
                            p={5}
                        >
                            <SectionHeader
                                icon={
                                    <BanknotesIcon
                                        width={18}
                                        height={18}
                                    />
                                }
                                title="Payment Information"
                                description="Enter the payment type, method, and amount."
                            />

                            <Grid
                                templateColumns={{
                                    base: "1fr",
                                    md: "repeat(2, 1fr)",
                                }}
                                gap={4}
                            >
                                {/* Payment Type */}

                                <FormControl isRequired>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="600"
                                        color="gray.700"
                                        mb={1.5}
                                    >
                                        Payment Type
                                    </FormLabel>

                                    <Select
                                        size="sm"
                                        value={
                                            form.payment_type
                                        }
                                        onChange={(e) =>
                                            handlePaymentTypeChange(
                                                e.target
                                                    .value as PaymentType
                                            )
                                        }
                                        bg="white"
                                        borderColor="gray.300"
                                        rounded="md"
                                        _hover={{
                                            borderColor:
                                                "gray.400",
                                        }}
                                        _focus={{
                                            borderColor:
                                                "brand.500",
                                            boxShadow:
                                                "0 0 0 1px var(--chakra-colors-brand-500)",
                                        }}
                                    >
                                        <option value="reservation_fee">
                                            Reservation Fee
                                        </option>

                                        <option value="partial_payment">
                                            Partial Payment
                                        </option>

                                        <option value="full_payment">
                                            Full Payment
                                        </option>
                                    </Select>
                                </FormControl>

                                {/* Payment Method */}

                                <FormControl isRequired>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="600"
                                        color="gray.700"
                                        mb={1.5}
                                    >
                                        Payment Method
                                    </FormLabel>

                                    <Select
                                        size="sm"
                                        value={
                                            form.payment_method
                                        }
                                        onChange={(e) =>
                                            handlePaymentMethodChange(
                                                e.target
                                                    .value as PaymentMethod
                                            )
                                        }
                                        bg="white"
                                        borderColor="gray.300"
                                        rounded="md"
                                        _hover={{
                                            borderColor:
                                                "gray.400",
                                        }}
                                        _focus={{
                                            borderColor:
                                                "brand.500",
                                            boxShadow:
                                                "0 0 0 1px var(--chakra-colors-brand-500)",
                                        }}
                                    >
                                        <option value="cash">
                                            Cash
                                        </option>

                                        <option value="gcash">
                                            GCash
                                        </option>

                                        <option value="bank_transfer">
                                            Bank Transfer
                                        </option>
                                    </Select>
                                </FormControl>

                                {/* Amount */}

                                <FormControl isRequired>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="600"
                                        color="gray.700"
                                        mb={1.5}
                                    >
                                        Amount
                                    </FormLabel>

                                    <Input
                                        size="sm"
                                        type="number"
                                        min={0}
                                        value={
                                            form.amount
                                        }
                                        isReadOnly={
                                            form.payment_type !==
                                            "partial_payment"
                                        }
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                amount:
                                                    Number(
                                                        e.target
                                                            .value
                                                    ),
                                            }))
                                        }
                                        bg={
                                            form.payment_type !==
                                                "partial_payment"
                                                ? "gray.50"
                                                : "white"
                                        }
                                        borderColor="gray.300"
                                        rounded="md"
                                        _hover={{
                                            borderColor:
                                                "gray.400",
                                        }}
                                        _focus={{
                                            borderColor:
                                                "brand.500",
                                            boxShadow:
                                                "0 0 0 1px var(--chakra-colors-brand-500)",
                                        }}
                                    />

                                    {form.payment_type !==
                                        "partial_payment" && (
                                            <Text
                                                mt={1}
                                                fontSize="xs"
                                                color="gray.500"
                                            >
                                                Amount is automatically
                                                calculated based on the
                                                selected payment type.
                                            </Text>
                                        )}
                                </FormControl>

                            </Grid>
                        </Box>

                        {/* ONLINE PAYMENT DETAILS */}

                        {(
                            form.payment_method ===
                            "gcash" ||
                            form.payment_method ===
                            "bank_transfer"
                        ) && (
                                <Box
                                    bg="white"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    rounded="lg"
                                    shadow="sm"
                                    p={5}
                                >
                                    <SectionHeader
                                        icon={
                                            <QrCodeIcon
                                                width={18}
                                                height={18}
                                            />
                                        }
                                        title="Payment Account"
                                        description="Select the account used for the electronic payment."
                                    />

                                    <FormControl isRequired>
                                        <FormLabel
                                            fontSize="sm"
                                            fontWeight="600"
                                            color="gray.700"
                                            mb={1.5}
                                        >
                                            Payment Account
                                        </FormLabel>

                                        <Select
                                            size="sm"
                                            placeholder="Select Account"
                                            value={
                                                form.payment_account_id ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleAccountChange(
                                                    e.target.value
                                                )
                                            }
                                            bg="white"
                                            borderColor="gray.300"
                                            rounded="md"
                                            _hover={{
                                                borderColor:
                                                    "gray.400",
                                            }}
                                            _focus={{
                                                borderColor:
                                                    "brand.500",
                                                boxShadow:
                                                    "0 0 0 1px var(--chakra-colors-brand-500)",
                                            }}
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

                                    {selectedAccount && (
                                        <Box mt={4}>
                                            <Grid
                                                templateColumns={{
                                                    base: "1fr",
                                                    md: "180px 1fr",
                                                }}
                                                gap={4}
                                            >
                                                {/* QR */}

                                                {selectedAccount
                                                    .qr_code_path && (
                                                        <Box>
                                                            <Text
                                                                fontSize="xs"
                                                                fontWeight="700"
                                                                color="gray.600"
                                                                mb={2}
                                                            >
                                                                Scan QR Code
                                                            </Text>

                                                            <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                                minH="180px"
                                                                p={3}
                                                                bg="gray.50"
                                                                border="1px solid"
                                                                borderColor="gray.200"
                                                                rounded="md"
                                                            >
                                                                <Image
                                                                    src={`/storage/${selectedAccount.qr_code_path}`}
                                                                    alt="QR Code"
                                                                    maxW="160px"
                                                                    maxH="160px"
                                                                    objectFit="contain"
                                                                />
                                                            </Box>
                                                        </Box>
                                                    )}

                                                {/* Account Details */}

                                                <Box>
                                                    <Text
                                                        fontSize="xs"
                                                        fontWeight="700"
                                                        color="gray.600"
                                                        mb={2}
                                                    >
                                                        Account Details
                                                    </Text>

                                                    <Box
                                                        p={3}
                                                        bg="gray.50"
                                                        border="1px solid"
                                                        borderColor="gray.200"
                                                        rounded="md"
                                                    >
                                                        <InfoRow
                                                            label="Provider"
                                                            value={
                                                                selectedAccount
                                                                    .account_provider
                                                            }
                                                        />

                                                        <InfoRow
                                                            label="Account Name"
                                                            value={
                                                                selectedAccount
                                                                    .account_name
                                                            }
                                                        />

                                                        <InfoRow
                                                            label="Account Number"
                                                            value={
                                                                selectedAccount
                                                                    .account_number
                                                            }
                                                        />
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Box>
                                    )}
                                </Box>
                            )}

                        {/* REFERENCE + PROOF */}

                        {
                            (
                                form.payment_method ===
                                "gcash" ||
                                form.payment_method ===
                                "bank_transfer"
                            ) && (
                                <Box
                                    bg="white"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    rounded="lg"
                                    shadow="sm"
                                    p={5}
                                >
                                    <SectionHeader
                                        icon={
                                            <IdentificationIcon
                                                width={18}
                                                height={18}
                                            />
                                        }
                                        title="Payment Verification"
                                        description="Provide the transaction reference and payment proof."
                                    />

                                    <Grid
                                        templateColumns={{
                                            base: "1fr",
                                            md: "repeat(2, 1fr)",
                                        }}
                                        gap={4}
                                    >
                                        {/* Reference Number */}

                                        <FormControl isRequired>
                                            <FormLabel
                                                fontSize="sm"
                                                fontWeight="600"
                                                color="gray.700"
                                                mb={1.5}
                                            >
                                                Reference Number
                                            </FormLabel>

                                            <Input
                                                size="sm"
                                                placeholder="Enter reference number"
                                                value={
                                                    form.reference_number ??
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setForm(
                                                        (prev) => ({
                                                            ...prev,
                                                            reference_number:
                                                                e
                                                                    .target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                                bg="white"
                                                borderColor="gray.300"
                                                rounded="md"
                                                _hover={{
                                                    borderColor:
                                                        "gray.400",
                                                }}
                                                _focus={{
                                                    borderColor:
                                                        "brand.500",
                                                    boxShadow:
                                                        "0 0 0 1px var(--chakra-colors-brand-500)",
                                                }}
                                            />
                                        </FormControl>

                                        {/* Payment Proof */}

                                        <FormControl isRequired>
                                            <FormLabel
                                                fontSize="sm"
                                                fontWeight="600"
                                                color="gray.700"
                                                mb={1.5}
                                            >
                                                Payment Proof
                                            </FormLabel>

                                            <Input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.webp"
                                                size="sm"
                                                p={1}
                                                onChange={
                                                    handlePaymentProof
                                                }
                                                bg="white"
                                                borderColor="gray.300"
                                                rounded="md"
                                                _hover={{
                                                    borderColor:
                                                        "gray.400",
                                                }}
                                                _focus={{
                                                    borderColor:
                                                        "brand.500",
                                                    boxShadow:
                                                        "0 0 0 1px var(--chakra-colors-brand-500)",
                                                }}
                                            />

                                            <Text
                                                mt={1}
                                                fontSize="xs"
                                                color="gray.500"
                                            >
                                                JPG, JPEG, PNG, or
                                                WEBP. Maximum size:
                                                2MB.
                                            </Text>

                                            {preview && (
                                                <Box
                                                    mt={3}
                                                    p={3}
                                                    bg="gray.50"
                                                    border="1px solid"
                                                    borderColor="gray.200"
                                                    rounded="md"
                                                >
                                                    <Text
                                                        fontSize="xs"
                                                        fontWeight="600"
                                                        color="gray.600"
                                                        mb={2}
                                                    >
                                                        Payment Proof
                                                        Preview
                                                    </Text>

                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        minH="160px"
                                                        bg="white"
                                                        border="1px solid"
                                                        borderColor="gray.200"
                                                        rounded="md"
                                                        overflow="hidden"
                                                    >
                                                        <Image
                                                            src={
                                                                preview
                                                            }
                                                            maxH="180px"
                                                            maxW="100%"
                                                            objectFit="contain"
                                                            alt="Payment Proof Preview"
                                                        />
                                                    </Box>
                                                </Box>
                                            )}
                                        </FormControl>
                                    </Grid>
                                </Box>
                            )
                        }

                        {/* REMARKS */}

                        <Box
                            bg="white"
                            border="1px solid"
                            borderColor="gray.200"
                            rounded="lg"
                            shadow="sm"
                            p={5}
                        >
                            <SectionHeader
                                icon={
                                    <TruckIcon
                                        width={18}
                                        height={18}
                                    />
                                }
                                title="Additional Information"
                                description="Add optional notes about this payment."
                            />

                            <FormControl>
                                <FormLabel
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.700"
                                    mb={1.5}
                                >
                                    Remarks
                                </FormLabel>

                                <Textarea
                                    size="sm"
                                    rows={3}
                                    placeholder="Optional remarks"
                                    value={
                                        form.remarks ?? ""
                                    }
                                    onChange={(e) =>
                                        setForm(
                                            (prev) => ({
                                                ...prev,
                                                remarks:
                                                    e.target
                                                        .value,
                                            })
                                        )
                                    }
                                    bg="white"
                                    borderColor="gray.300"
                                    rounded="md"
                                    resize="vertical"
                                    _hover={{
                                        borderColor:
                                            "gray.400",
                                    }}
                                    _focus={{
                                        borderColor:
                                            "brand.500",
                                        boxShadow:
                                            "0 0 0 1px var(--chakra-colors-brand-500)",
                                    }}
                                />
                            </FormControl>
                        </Box>
                    </Box>
                </ModalBody>

                {/* FOOTER */}

                < ModalFooter
                    px={6}
                    py={4}
                    bg="white"
                    borderTop="1px solid"
                    borderColor="gray.200"
                >
                    <Button
                        size="sm"
                        variant="ghost"
                        mr={3}
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

                    <Button
                        size="sm"
                        colorScheme="brand"
                        onClick={handleSubmit}
                        isLoading={loading}
                        loadingText="Saving"
                        leftIcon={
                            <BanknotesIcon
                                width={16}
                                height={16}
                            />
                        }
                    >
                        Save Payment
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

