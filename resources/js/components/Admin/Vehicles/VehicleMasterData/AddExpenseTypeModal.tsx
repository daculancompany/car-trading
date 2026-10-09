import {
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
    Text,
    useToast,
} from "@chakra-ui/react";

import { useState } from "react";

import { createExpenseType } from "../../../../api/ExpenseManagement/expenseTypeApi";

interface AddExpenseTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AdminAddExpenseTypeModal({
    isOpen,
    onClose,
    onSuccess,
}: AddExpenseTypeModalProps) {
    const toast = useToast();

    const [expenseName, setExpenseName] = useState("");
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setExpenseName("");
    };

    const handleSubmit = async () => {
        if (!expenseName.trim()) {
            toast({
                title: "Validation Error",
                description: "Expense type is required.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        try {
            setLoading(true);

            await createExpenseType({
                expense_name: expenseName.trim(),
                is_active: true,
            });

            toast({
                title: "Success",
                description: "Expense type created successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            resetForm();
            onClose();
            onSuccess?.();
        } catch (error: any) {
            toast({
                title: "Error",
                description:
                    error.response?.data?.message ??
                    "Unable to create expense type.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            isCentered
            size="md"
        >
            <ModalOverlay bg="blackAlpha.600" />

            <ModalContent
                mx={4}
                rounded="xl"
                overflow="hidden"
                shadow="2xl"
                border="1px solid"
                borderColor="gray.200"
            >
                {/* HEADER */}
                <ModalHeader
                    px={6}
                    py={5}
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    bg="gray.50"
                >
                    <Text
                        fontSize="lg"
                        fontWeight="700"
                        color="dark.900"
                    >
                        Add Expense Type
                    </Text>

                    <Text
                        mt={1}
                        fontSize="sm"
                        fontWeight="400"
                        color="gray.500"
                    >
                        Create a new expense type for vehicle expenses.
                    </Text>
                </ModalHeader>

                <ModalCloseButton
                    top={4}
                    right={4}
                    rounded="md"
                    color="gray.500"
                    _hover={{
                        bg: "gray.200",
                        color: "dark.900",
                    }}
                />

                {/* BODY */}
                <ModalBody px={6} py={6}>
                    <FormControl isRequired>
                        <FormLabel
                            mb={2}
                            fontSize="sm"
                            fontWeight="600"
                            color="dark.800"
                        >
                            Expense Type
                        </FormLabel>

                        <Input
                            placeholder="e.g. Registration Fee"
                            value={expenseName}
                            onChange={(e) =>
                                setExpenseName(e.target.value)
                            }
                            size="md"
                            h="44px"
                            rounded="lg"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{
                                borderColor: "gray.400",
                            }}
                            _focus={{
                                borderColor: "brand.500",
                                boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                            }}
                        />

                        <Text
                            mt={2}
                            fontSize="xs"
                            color="gray.500"
                        >
                            Enter a descriptive name for this expense category.
                        </Text>
                    </FormControl>
                </ModalBody>

                {/* FOOTER */}
                <ModalFooter
                    px={6}
                    py={4}
                    gap={3}
                    borderTop="1px solid"
                    borderColor="gray.200"
                    bg="gray.50"
                >
                    <Button
                        variant="outline"
                        size="md"
                        rounded="lg"
                        borderColor="gray.300"
                        color="gray.700"
                        onClick={handleClose}
                        isDisabled={loading}
                        _hover={{
                            bg: "gray.100",
                            borderColor: "gray.400",
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        colorScheme="blue"
                        size="md"
                        rounded="lg"
                        px={6}
                        onClick={handleSubmit}
                        isLoading={loading}
                        loadingText="Saving..."
                        _hover={{
                            transform: "translateY(-1px)",
                            shadow: "md",
                        }}
                        transition="all 0.2s ease"
                    >
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}