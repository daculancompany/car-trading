import { useEffect, useState } from "react";

import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputLeftAddon,
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
    useToast,
} from "@chakra-ui/react";

import {
    createVehicleExpense,
    updateVehicleExpense,
    type VehicleExpense,
} from "../../../api/ExpenseManagement/expenseApi.ts";

import type {
    ExpenseType,
} from "../../../api/ExpenseManagement/expenseTypeApi.ts";

import {
    formatNumber,
    parseNumber,
} from "../../../utils/numberFormatter.ts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    vehicleId: number;
    expenseTypes: ExpenseType[];
    expense?: VehicleExpense | null;
    onSaved: () => void;
}

export default function VehicleExpenseForm({
    isOpen,
    onClose,
    vehicleId,
    expenseTypes,
    expense,
    onSaved,
}: Props) {
    const toast = useToast();

    const [loading, setLoading] = useState(false);

    const [expenseTypeId, setExpenseTypeId] =
        useState<number | "">("");

    const [amount, setAmount] =
        useState<number | undefined>();

    const [remarks, setRemarks] = useState("");

    /**
     * Load Expense Data
     */
    useEffect(() => {
        if (expense) {
            setExpenseTypeId(expense.expense_type_id);
            setAmount(expense.amount);
            setRemarks(expense.remarks ?? "");
        } else {
            setExpenseTypeId("");
            setAmount(undefined);
            setRemarks("");
        }
    }, [expense, isOpen]);

    /**
     * Submit
     */
    const handleSubmit = async () => {
        if (expenseTypeId === "") {
            toast({
                status: "warning",
                title: "Please select expense type.",
                position: "top-right",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        if (amount === undefined || amount <= 0) {
            toast({
                status: "warning",
                title: "Please enter a valid amount.",
                position: "top-right",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        try {
            setLoading(true);

            const payload = {
                vehicle_id: vehicleId,
                expense_type_id: Number(expenseTypeId),
                amount,
                remarks: remarks.trim() || null,
            };

            if (expense) {
                await updateVehicleExpense(
                    expense.id,
                    payload
                );

                toast({
                    title: "Expense updated.",
                    status: "success",
                    position: "top-right",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                await createVehicleExpense(payload);

                toast({
                    title: "Expense added.",
                    status: "success",
                    position: "top-right",
                    duration: 3000,
                    isClosable: true,
                });
            }

            onSaved();
            onClose();
        } catch (error) {
            console.error(
                "Failed to save vehicle expense:",
                error
            );

            toast({
                title: "Unable to save expense.",
                description:
                    "Please check the information and try again.",
                status: "error",
                position: "top-right",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            isCentered
            motionPreset="scale"
        >
            <ModalOverlay
                bg="blackAlpha.500"
            />

            <ModalContent
                rounded="2xl"
                overflow="hidden"
                shadow="2xl"
                border="1px solid"
                borderColor="gray.200"
            >
                {/* Header */}

                <ModalHeader
                    px={6}
                    py={5}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    bg="white"
                >
                    <Box pr={8}>
                        <Text
                            fontSize="xl"
                            fontWeight="700"
                            color="gray.800"
                            lineHeight="1.3"
                        >
                            {expense
                                ? "Update Vehicle Expense"
                                : "Add Vehicle Expense"}
                        </Text>

                        <Text
                            mt={1}
                            fontSize="sm"
                            fontWeight="400"
                            color="gray.500"
                        >
                            {expense
                                ? "Update the selected expense information."
                                : "Record a new expense for this vehicle."}
                        </Text>
                    </Box>
                </ModalHeader>

                <ModalCloseButton
                    top={4}
                    right={4}
                    rounded="lg"
                    color="gray.500"
                    _hover={{
                        bg: "gray.100",
                        color: "gray.700",
                    }}
                    isDisabled={loading}
                />

                {/* Body */}

                <ModalBody
                    px={6}
                    py={6}
                    bg="gray.50"
                >
                    <Box
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        rounded="xl"
                        p={5}
                    >
                        <VStack
                            spacing={5}
                            align="stretch"
                        >
                            {/* Expense Type */}

                            <FormControl isRequired>
                                <FormLabel
                                    mb={2}
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.700"
                                >
                                    Expense Type
                                </FormLabel>

                                <Select
                                    h="44px"
                                    rounded="lg"
                                    borderColor="gray.300"
                                    bg="white"
                                    placeholder="Select expense type"
                                    value={expenseTypeId}
                                    onChange={(e) => {
                                        const value =
                                            e.target.value;

                                        setExpenseTypeId(
                                            value === ""
                                                ? ""
                                                : Number(value)
                                        );
                                    }}
                                    _hover={{
                                        borderColor:
                                            "gray.400",
                                    }}
                                    _focus={{
                                        borderColor:
                                            "blue.400",
                                        boxShadow:
                                            "0 0 0 1px var(--chakra-colors-blue-400)",
                                    }}
                                >
                                    {expenseTypes.map(
                                        (item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {
                                                    item.expense_name
                                                }
                                            </option>
                                        )
                                    )}
                                </Select>
                            </FormControl>

                            {/* Amount */}

                            <FormControl isRequired>
                                <FormLabel
                                    mb={2}
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.700"
                                >
                                    Amount
                                </FormLabel>

                                <InputGroup>
                                    <InputLeftAddon
                                        h="44px"
                                        px={4}
                                        roundedLeft="lg"
                                        bg="gray.50"
                                        borderColor="gray.300"
                                        color="gray.600"
                                        fontWeight="600"
                                    >
                                        ₱
                                    </InputLeftAddon>

                                    <Input
                                        h="44px"
                                        roundedRight="lg"
                                        borderColor="gray.300"
                                        bg="white"
                                        value={formatNumber(
                                            amount
                                        )}
                                        placeholder="Enter amount"
                                        inputMode="numeric"
                                        onChange={(e) => {
                                            setAmount(
                                                parseNumber(
                                                    e.target.value
                                                )
                                            );
                                        }}
                                        _hover={{
                                            borderColor:
                                                "gray.400",
                                        }}
                                        _focus={{
                                            borderColor:
                                                "blue.400",
                                            boxShadow:
                                                "0 0 0 1px var(--chakra-colors-blue-400)",
                                        }}
                                    />
                                </InputGroup>
                            </FormControl>

                            {/* Remarks */}

                            <FormControl>
                                <FormLabel
                                    mb={2}
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.700"
                                >
                                    Remarks
                                </FormLabel>

                                <Textarea
                                    minH="110px"
                                    resize="vertical"
                                    rounded="lg"
                                    borderColor="gray.300"
                                    bg="white"
                                    value={remarks}
                                    placeholder="Enter remarks or additional details..."
                                    onChange={(e) => {
                                        setRemarks(
                                            e.target.value
                                        );
                                    }}
                                    _hover={{
                                        borderColor:
                                            "gray.400",
                                    }}
                                    _focus={{
                                        borderColor:
                                            "blue.400",
                                        boxShadow:
                                            "0 0 0 1px var(--chakra-colors-blue-400)",
                                    }}
                                />

                                <Text
                                    mt={1.5}
                                    fontSize="xs"
                                    color="gray.400"
                                >
                                    Optional additional information
                                    about this expense.
                                </Text>
                            </FormControl>
                        </VStack>
                    </Box>
                </ModalBody>

                {/* Footer */}

                <ModalFooter
                    px={6}
                    py={4}
                    gap={3}
                    borderTop="1px solid"
                    borderColor="gray.100"
                    bg="white"
                >
                    <Button
                        variant="outline"
                        rounded="lg"
                        borderColor="gray.300"
                        color="gray.700"
                        px={5}
                        onClick={onClose}
                        isDisabled={loading}
                        _hover={{
                            bg: "gray.50",
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        colorScheme="blue"
                        rounded="lg"
                        px={6}
                        onClick={handleSubmit}
                        isLoading={loading}
                        loadingText={
                            expense
                                ? "Updating..."
                                : "Saving..."
                        }
                        shadow="sm"
                    >
                        {expense ? "Update Expense" : "Save Expense"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}