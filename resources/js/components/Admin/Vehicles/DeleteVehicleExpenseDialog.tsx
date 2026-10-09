import axios from "axios";
import { useRef, useState } from "react";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Divider,
    Flex,
    Text,
    useToast,
} from "@chakra-ui/react";
import { deleteVehicleExpense } from "../../../api/ExpenseManagement/expenseApi";
import type { VehicleExpense } from "../../../api/VehicleManagement/vehicleApi";

interface DeleteVehicleExpenseDialogProps {
    isOpen: boolean;
    onClose: () => void;
    expense: VehicleExpense | null;
    onDeleted: () => void;
}

export default function DeleteVehicleExpenseDialog({
    isOpen,
    onClose,
    expense,
    onDeleted,
}: DeleteVehicleExpenseDialogProps) {
    const cancelRef = useRef<HTMLButtonElement>(null);
    const toast = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!expense) return;

        try {
            setIsDeleting(true);

            await deleteVehicleExpense(expense.id);

            toast({
                title: "Success",
                description: "Expense deleted successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            onDeleted();
            onClose();
        } catch (error) {
            console.error("Failed to delete vehicle expense:", error);

            if (axios.isAxiosError(error)) {
                toast({
                    title: "Delete Failed",
                    description:
                        error.response?.data?.message ??
                        "Unable to delete expense.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right",
                });
            } else {
                toast({
                    title: "Unexpected Error",
                    description:
                        "An unexpected error occurred.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right",
                });
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            isCentered
        >
            <AlertDialogOverlay
                bg="blackAlpha.600"
            />

            <AlertDialogContent
                mx={4}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="2xl"
            >
                {/* HEADER */}
                <AlertDialogHeader
                    px={6}
                    py={5}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    fontSize="lg"
                    fontWeight="700"
                    color="gray.800"
                >
                    Delete Expense
                </AlertDialogHeader>

                {/* BODY */}
                <AlertDialogBody px={6} py={6}>
                    <Text
                        fontSize="sm"
                        color="gray.600"
                        lineHeight="1.6"
                    >
                        Are you sure you want to delete this
                        vehicle expense?
                    </Text>

                    {expense && (
                        <Box
                            mt={5}
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="lg"
                            overflow="hidden"
                            bg="gray.50"
                        >
                            {/* Expense Type */}
                            <Flex
                                px={4}
                                py={3}
                                justify="space-between"
                                align="center"
                                gap={4}
                            >
                                <Text
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.500"
                                    textTransform="uppercase"
                                    letterSpacing="0.04em"
                                >
                                    Expense Type
                                </Text>

                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.800"
                                    textAlign="right"
                                >
                                    {expense.expense_type
                                        ?.expense_name ??
                                        `Expense #${expense.expense_type_id}`}
                                </Text>
                            </Flex>

                            <Divider />

                            {/* Amount */}
                            <Flex
                                px={4}
                                py={3}
                                justify="space-between"
                                align="center"
                                gap={4}
                            >
                                <Text
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.500"
                                    textTransform="uppercase"
                                    letterSpacing="0.04em"
                                >
                                    Amount
                                </Text>

                                <Text
                                    fontSize="md"
                                    fontWeight="700"
                                    color="gray.800"
                                >
                                    {expense.amount?.toLocaleString(
                                        "en-PH",
                                        {
                                            style: "currency",
                                            currency: "PHP",
                                        }
                                    ) ?? "₱0.00"}
                                </Text>
                            </Flex>

                            <Divider />

                            {/* Remarks */}
                            <Box px={4} py={3}>
                                <Text
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.500"
                                    textTransform="uppercase"
                                    letterSpacing="0.04em"
                                    mb={1}
                                >
                                    Remarks
                                </Text>

                                <Text
                                    fontSize="sm"
                                    color={
                                        expense.remarks
                                            ? "gray.700"
                                            : "gray.400"
                                    }
                                >
                                    {expense.remarks || "-"}
                                </Text>
                            </Box>
                        </Box>
                    )}

                    {/* WARNING */}
                    <Box
                        mt={5}
                        px={4}
                        py={3}
                        borderRadius="lg"
                        bg="red.50"
                        border="1px solid"
                        borderColor="red.100"
                    >
                        <Text
                            fontSize="sm"
                            fontWeight="600"
                            color="red.700"
                        >
                            This action cannot be undone.
                        </Text>

                        <Text
                            mt={1}
                            fontSize="xs"
                            color="red.600"
                            lineHeight="1.5"
                        >
                            The expense record will be permanently
                            removed from this vehicle.
                        </Text>
                    </Box>
                </AlertDialogBody>

                {/* FOOTER */}
                <AlertDialogFooter
                    px={6}
                    py={4}
                    gap={3}
                    borderTop="1px solid"
                    borderColor="gray.100"
                    bg="gray.50"
                >
                    <Button
                        ref={cancelRef}
                        onClick={onClose}
                        isDisabled={isDeleting}
                        size="sm"
                        variant="outline"
                        borderColor="gray.300"
                        bg="white"
                        _hover={{
                            bg: "gray.100",
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        colorScheme="red"
                        onClick={handleDelete}
                        isLoading={isDeleting}
                        loadingText="Deleting..."
                        size="sm"
                        px={5}
                        boxShadow="sm"
                        _hover={{
                            boxShadow: "md",
                        }}
                    >
                        Delete Expense
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}