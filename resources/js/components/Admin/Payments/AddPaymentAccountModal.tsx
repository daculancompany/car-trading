import { useState, type ChangeEvent } from "react";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Input,
    Select,
    Button,
    useToast,
    Image,
    Text,
    Box,
    Grid,
} from "@chakra-ui/react";

import {
    BanknotesIcon,
    QrCodeIcon,
} from "@heroicons/react/24/solid";

import {
    createPaymentAccount,
    type CreatePaymentAccountData,
} from "../../../api/PaymentManagement/accountApi";

interface AddPaymentAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddPaymentAccountModal({
    isOpen,
    onClose,
    onSuccess,
}: AddPaymentAccountModalProps) {
    const toast = useToast();

    const [loading, setLoading] = useState(false);

    const [form, setForm] =
        useState<CreatePaymentAccountData>({
            account_provider: "GCash",
            account_name: "",
            account_number: "",
            qr_code: new File([], ""),
            is_active: true,
        });

    const [preview, setPreview] = useState("");

    // Handle Text / Select Changes

    const handleChange = (
        field:
            | "account_provider"
            | "account_name"
            | "account_number",
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle QR Code

    const handleFile = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        setForm((prev) => ({
            ...prev,
            qr_code: file,
        }));

        setPreview(URL.createObjectURL(file));
    };

    // Reset Form

    const resetForm = () => {
        setForm({
            account_provider: "GCash",
            account_name: "",
            account_number: "",
            qr_code: new File([], ""),
            is_active: true,
        });

        setPreview("");
    };

    // Submit

    const handleSubmit = async () => {
        if (
            !form.account_provider.trim() ||
            !form.account_name.trim() ||
            !form.account_number.trim()
        ) {
            toast({
                title: "Please complete all required fields.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        if (
            !form.qr_code ||
            form.qr_code.size === 0
        ) {
            toast({
                title: "Please upload a QR code.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        try {
            setLoading(true);

            await createPaymentAccount(form);

            toast({
                title:
                    "Payment account created successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            resetForm();

            onSuccess();

            onClose();
        } catch (error) {
            console.error(
                "Failed to create payment account:",
                error
            );

            toast({
                title:
                    "Failed to create payment account.",
                description:
                    "Please check the information and try again.",
                status: "error",
                duration: 3000,
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

        resetForm();

        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="lg"
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
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    bg="white"
                >
                    <Box>
                        <Text
                            fontSize="md"
                            fontWeight="700"
                            color="gray.800"
                        >
                            Add Payment Account
                        </Text>

                        <Text
                            mt={0.5}
                            fontSize="xs"
                            fontWeight="400"
                            color="gray.500"
                        >
                            Add a new payment account and QR
                            code to the system.
                        </Text>
                    </Box>
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
                    <Grid
                        templateColumns={{
                            base: "1fr",
                            md: "repeat(2, 1fr)",
                        }}
                        gap={4}
                    >
                        {/* ACCOUNT PROVIDER */}

                        <FormControl isRequired>
                            <FormLabel
                                fontSize="sm"
                                fontWeight="600"
                                color="gray.700"
                                mb={1.5}
                            >
                                Account Provider
                            </FormLabel>

                            <Select
                                size="sm"
                                value={form.account_provider}
                                onChange={(e) =>
                                    handleChange(
                                        "account_provider",
                                        e.target.value
                                    )
                                }
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
                            >
                                <option value="GCash">
                                    GCash
                                </option>
                                <option value="BDO">
                                    BDO
                                </option>
                                <option value="BPI">
                                    BPI
                                </option>

                            </Select>
                        </FormControl>

                        {/* ACCOUNT NAME */}

                        <FormControl isRequired>
                            <FormLabel
                                fontSize="sm"
                                fontWeight="600"
                                color="gray.700"
                                mb={1.5}
                            >
                                Account Name
                            </FormLabel>

                            <Input
                                size="sm"
                                placeholder="Enter account name"
                                value={form.account_name}
                                onChange={(e) =>
                                    handleChange(
                                        "account_name",
                                        e.target.value
                                    )
                                }
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
                        </FormControl>

                        {/* ACCOUNT NUMBER */}

                        <FormControl isRequired>
                            <FormLabel
                                fontSize="sm"
                                fontWeight="600"
                                color="gray.700"
                                mb={1.5}
                            >
                                Account Number
                            </FormLabel>

                            <Input
                                size="sm"
                                placeholder="Enter account number"
                                value={form.account_number}
                                onChange={(e) =>
                                    handleChange(
                                        "account_number",
                                        e.target.value
                                    )
                                }
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
                        </FormControl>

                        {/* STATUS */}

                        <FormControl>
                            <FormLabel
                                fontSize="sm"
                                fontWeight="600"
                                color="gray.700"
                                mb={1.5}
                            >
                                Status
                            </FormLabel>

                            <Select
                                size="sm"
                                value={
                                    form.is_active
                                        ? "active"
                                        : "inactive"
                                }
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        is_active:
                                            e.target.value ===
                                            "active",
                                    }))
                                }
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
                            >
                                <option value="active">
                                    Active
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>
                            </Select>
                        </FormControl>

                        {/* QR CODE */}

                        <FormControl
                            isRequired
                            gridColumn={{
                                base: "auto",
                                md: "1 / -1",
                            }}
                        >
                            <FormLabel
                                fontSize="sm"
                                fontWeight="600"
                                color="gray.700"
                                mb={1.5}
                            >
                                QR Code
                            </FormLabel>

                            <Box
                                bg="white"
                                border="1px solid"
                                borderColor="gray.300"
                                rounded="md"
                                p={3}
                                transition="all 0.2s"
                                _hover={{
                                    borderColor: "gray.400",
                                }}
                            >
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={3}
                                    mb={3}
                                >
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        boxSize="32px"
                                        rounded="md"
                                        bg="brand.50"
                                        color="brand.500"
                                    >
                                        <QrCodeIcon
                                            width={18}
                                            height={18}
                                        />
                                    </Box>

                                    <Box>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="600"
                                            color="gray.700"
                                        >
                                            Upload QR Code
                                        </Text>

                                        <Text
                                            fontSize="xs"
                                            color="gray.500"
                                        >
                                            JPG, JPEG, PNG, or
                                            WEBP • Maximum 2MB
                                        </Text>
                                    </Box>
                                </Box>

                                <Input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    size="sm"
                                    p={1}
                                    bg="gray.50"
                                    borderColor="gray.300"
                                    rounded="md"
                                    onChange={handleFile}
                                    _focus={{
                                        borderColor:
                                            "brand.500",
                                        boxShadow:
                                            "0 0 0 1px var(--chakra-colors-brand-500)",
                                    }}
                                />

                                {preview && (
                                    <Box
                                        mt={4}
                                        display="flex"
                                        flexDirection={{
                                            base: "column",
                                            sm: "row",
                                        }}
                                        alignItems={{
                                            base: "center",
                                            sm: "flex-start",
                                        }}
                                        gap={4}
                                        p={3}
                                        bg="gray.50"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        rounded="md"
                                    >
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            boxSize="36px"
                                            flexShrink={0}
                                            rounded="md"
                                            bg="brand.50"
                                            color="brand.500"
                                        >
                                            <BanknotesIcon
                                                width={18}
                                                height={18}
                                            />
                                        </Box>

                                        <Box>
                                            <Text
                                                fontSize="xs"
                                                fontWeight="600"
                                                color="gray.600"
                                                mb={2}
                                            >
                                                QR Code Preview
                                            </Text>

                                            <Box
                                                border="1px solid"
                                                borderColor="gray.200"
                                                rounded="md"
                                                p={2}
                                                bg="white"
                                                width="fit-content"
                                            >
                                                <Image
                                                    src={preview}
                                                    borderRadius="md"
                                                    boxSize="180px"
                                                    objectFit="contain"
                                                    alt="QR Code Preview"
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </FormControl>
                    </Grid>
                </ModalBody>

                {/* FOOTER */}

                <ModalFooter
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
                        Save Payment Account
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

