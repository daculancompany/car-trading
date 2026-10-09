import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    IconButton,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tooltip,
    Tr,
    useDisclosure,
} from "@chakra-ui/react";

import {
    BanknotesIcon,
    PencilSquareIcon,
    TrashIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";

import {
    formatPeso,
    formatNumber,
} from "../../../utils/numberFormatter";

import { type Vehicle } from "../../../api/VehicleManagement/vehicleApi";

import type {
    VehicleExpense as ExpenseVehicleExpense,
} from "../../../api/ExpenseManagement/expenseApi";

import {
    getExpenseTypes,
    type ExpenseType,
} from "../../../api/ExpenseManagement/expenseTypeApi";

import DeleteVehicleExpenseDialog from "./DeleteVehicleExpenseDialog";
import VehicleExpenseForm from "./VehicleExpenseForm";

interface VehicleExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehicle | null;
    onReload: () => void;
}

export default function VehicleExpenseModal({
    isOpen,
    onClose,
    vehicle,
    onReload,
}: VehicleExpenseModalProps) {
    const [selectedExpense, setSelectedExpense] =
        useState<ExpenseVehicleExpense | null>(null);

    const [expenseTypes, setExpenseTypes] =
        useState<ExpenseType[]>([]);

    const [editingExpense, setEditingExpense] =
        useState<ExpenseVehicleExpense | null>(null);

    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onClose: onDeleteClose,
    } = useDisclosure();

    const {
        isOpen: isFormOpen,
        onOpen: onFormOpen,
        onClose: onFormClose,
    } = useDisclosure();

    // Load Expense Types
    useEffect(() => {
        const fetchExpenseTypes = async () => {
            try {
                const data = await getExpenseTypes();
                setExpenseTypes(data);
            } catch (error) {
                console.error(
                    "Failed to load expense types:",
                    error
                );
            }
        };

        fetchExpenseTypes();
    }, []);

    // Calculate Total Expenses
    const totalExpenses =
        vehicle?.expenses?.reduce(
            (total, expense) =>
                total + Number(expense.amount ?? 0),
            0
        ) ?? 0;

    // Reload Vehicle Expenses
    const reloadExpenses = async () => {
        if (!vehicle) return;

        try {
            onReload();
        } catch (error) {
            console.error(
                "Failed to reload vehicle expenses:",
                error
            );
        }
    };

    // Add Expense
    const handleAddExpense = () => {
        setEditingExpense(null);
        onFormOpen();
    };

    // Get actual expense item type from Vehicle
    type VehicleExpenseItem =
        NonNullable<Vehicle["expenses"]>[number];

    // Convert vehicle expense to expense API type
    const toExpenseVehicleExpense = (
        expense: VehicleExpenseItem
    ): ExpenseVehicleExpense => {
        if (!vehicle) {
            throw new Error("Vehicle is required.");
        }

        return {
            ...expense,
            vehicle,
        } as ExpenseVehicleExpense;
    };

    // Edit Expense
    const handleEditExpense = (
        expense: VehicleExpenseItem
    ) => {
        setEditingExpense(
            toExpenseVehicleExpense(expense)
        );
        onFormOpen();
    };

    // Delete Expense
    const handleDeleteExpense = (
        expense: VehicleExpenseItem
    ) => {
        setSelectedExpense(
            toExpenseVehicleExpense(expense)
        );
        onDeleteOpen();
    };

    if (!vehicle) {
        return null;
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size="6xl"
                scrollBehavior="inside"
                isCentered
            >
                <ModalOverlay bg="blackAlpha.600" />

                <ModalContent
                    borderRadius="md"
                    overflow="hidden"
                    boxShadow="2xl"
                >
                    {/* HEADER */}
                    <ModalHeader
                        px={6}
                        py={5}
                        borderBottom="1px solid"
                        borderColor="gray.200"
                        bg="white"
                    >
                        <HStack spacing={3}>
                            <Flex
                                w="35px"
                                h="35px"
                                align="center"
                                justify="center"
                                borderRadius="lg"
                                color="brand.600"
                            >
                                <BanknotesIcon
                                    width={20}
                                    height={20}
                                />
                            </Flex>

                            <Box>
                                <Text
                                    fontSize="md"
                                    fontWeight="800"
                                    color="gray.800"
                                    lineHeight="1.2"
                                >
                                    Vehicle Expenses
                                </Text>

                                <Text
                                    fontSize="xs"
                                    color="gray.700"
                                    fontWeight="400"
                                    mt={1}
                                >
                                    Manage and review vehicle
                                    expense records
                                </Text>
                            </Box>
                        </HStack>
                    </ModalHeader>

                    <ModalCloseButton
                        top={4}
                        right={4}
                        borderRadius="md"
                    />

                    <ModalBody
                        px={{ base: 4, md: 6 }}
                        py={6}
                        bg="gray.50"
                    >
                        {/* VEHICLE INFO / SUMMARY */}
                        <Flex
                            direction={{
                                base: "column",
                                md: "row",
                            }}
                            justify="space-between"
                            align={{
                                base: "stretch",
                                md: "center",
                            }}
                            gap={4}
                            mb={5}
                        >
                            <HStack
                                spacing={6}
                                align="center"
                                flex="1"
                            >
                                {/* VEHICLE NAME */}
                                <Box>
                                    <Text
                                        fontSize="sm"
                                        color="gray.500"
                                        mb={1}
                                    >
                                        Vehicle
                                    </Text>

                                    <Text
                                        fontSize="md"
                                        fontWeight="600"
                                        color="gray.800"
                                        whiteSpace="nowrap"
                                    >
                                        {vehicle.brand?.brand ??
                                            "Unknown"}{" "}
                                        {vehicle.model?.model ??
                                            "Unknown"}{" "}
                                        {vehicle.variant?.variant ??
                                            ""}
                                    </Text>
                                </Box>

                                {/* TOTAL EXPENSES */}
                                <Box
                                    minW="220px"
                                    bg="white"
                                    border="1px solid"
                                    borderColor="gray.100"
                                    borderRadius="lg"
                                    px={5}
                                    py={2}
                                    boxShadow="xs"
                                >
                                    <Text
                                        fontSize="xs"
                                        color="gray.700"
                                        textTransform="uppercase"
                                        letterSpacing="0.05em"
                                    >
                                        Total Expenses
                                    </Text>

                                    <Text
                                        fontSize="md"
                                        fontWeight="700"
                                        color="dark.700"
                                        mt={1}
                                    >
                                        {formatPeso(totalExpenses)}
                                    </Text>
                                </Box>
                            </HStack>

                            {/* ADD EXPENSE */}
                            <Button
                                leftIcon={
                                    <PlusIcon
                                        width={18}
                                        height={18}
                                    />
                                }
                                color="white"
                                bg="brand.500"
                                _hover={{
                                    bg: "brand.600",
                                }}
                                size="sm"
                                borderRadius="md"
                                px={5}
                                onClick={handleAddExpense}
                                alignSelf={{
                                    base: "stretch",
                                    md: "center",
                                }}
                            >
                                Add Expense
                            </Button>
                        </Flex>

                        {/* TABLE CONTAINER */}
                        <Box
                            bg="white"
                            border="1px solid"
                            borderColor="gray.100"
                            borderRadius="lg"
                            overflow="hidden"
                            boxShadow="sm"
                        >
                            <Box
                                px={5}
                                py={4}
                                borderBottom="1px solid"
                                borderColor="gray.100"
                            >
                                <Flex
                                    justify="space-between"
                                    align="center"
                                >
                                    <Box>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="600"
                                            color="gray.800"
                                        >
                                            Expense Records
                                        </Text>

                                        <Text
                                            fontSize="xs"
                                            color="gray.700"
                                            mt={1}
                                        >
                                            {vehicle.expenses?.length ??
                                                0}{" "}
                                            record
                                            {(vehicle.expenses?.length ??
                                                0) !== 1
                                                ? "s"
                                                : ""}
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>

                            <Box overflowX="auto">
                                <Table
                                    variant="simple"
                                    size="sm"
                                >
                                    <Thead bg="gray.50">
                                        <Tr>
                                            {[
                                                "Expense Type",
                                                "Amount",
                                                "Remarks",
                                                "Date",
                                                "Action",
                                            ].map(
                                                (
                                                    header,
                                                    index
                                                ) => (
                                                    <Th
                                                        key={header}
                                                        py={2}
                                                        fontSize="xs"
                                                        color="gray.700"
                                                        textTransform="uppercase"
                                                        letterSpacing="0.05em"
                                                        isNumeric={
                                                            index === 1
                                                        }
                                                        textAlign={
                                                            index === 4
                                                                ? "center"
                                                                : undefined
                                                        }
                                                    >
                                                        {header}
                                                    </Th>
                                                )
                                            )}
                                        </Tr>
                                    </Thead>

                                    <Tbody>
                                        {vehicle.expenses &&
                                            vehicle.expenses.length >
                                            0 ? (
                                            vehicle.expenses.map(
                                                (
                                                    expense
                                                ) => (
                                                    <Tr
                                                        key={
                                                            expense.id
                                                        }
                                                        _hover={{
                                                            bg: "gray.50",
                                                        }}
                                                        transition="background 0.15s"
                                                    >
                                                        {/* EXPENSE TYPE */}
                                                        <Td py={2}>
                                                            <Text
                                                                fontWeight="500"
                                                                color="gray.700"
                                                            >
                                                                {expense
                                                                    .expense_type
                                                                    ?.expense_name ??
                                                                    "-"}
                                                            </Text>
                                                        </Td>

                                                        {/* AMOUNT */}
                                                        <Td
                                                            py={2}
                                                            isNumeric
                                                        >
                                                            <Text
                                                                fontWeight="600"
                                                                color="gray.800"
                                                            >
                                                                ₱{" "}
                                                                {formatNumber(
                                                                    Number(
                                                                        expense.amount ??
                                                                        0
                                                                    )
                                                                )}
                                                            </Text>
                                                        </Td>

                                                        {/* REMARKS */}
                                                        <Td
                                                            py={2}
                                                            maxW="260px"
                                                        >
                                                            <Text
                                                                fontSize="sm"
                                                                color={
                                                                    expense.remarks
                                                                        ? "gray.600"
                                                                        : "gray.400"
                                                                }
                                                                noOfLines={
                                                                    2
                                                                }
                                                            >
                                                                {expense.remarks ||
                                                                    "No remarks"}
                                                            </Text>
                                                        </Td>

                                                        {/* DATE */}
                                                        <Td py={2}>
                                                            <Text
                                                                fontSize="sm"
                                                                color="gray.600"
                                                            >
                                                                {expense.created_at
                                                                    ? new Date(
                                                                        expense.created_at
                                                                    ).toLocaleDateString()
                                                                    : "-"}
                                                            </Text>
                                                        </Td>

                                                        {/* ACTIONS */}
                                                        <Td py={2}>
                                                            <HStack
                                                                justify="center"
                                                                spacing={1}
                                                            >
                                                                <Tooltip label="Update Expense">
                                                                    <IconButton
                                                                        aria-label="Update Expense"
                                                                        icon={
                                                                            <PencilSquareIcon
                                                                                width={
                                                                                    18
                                                                                }
                                                                                height={
                                                                                    18
                                                                                }
                                                                            />
                                                                        }
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        colorScheme="blue"
                                                                        borderRadius="md"
                                                                        onClick={() =>
                                                                            handleEditExpense(
                                                                                expense
                                                                            )
                                                                        }
                                                                    />
                                                                </Tooltip>

                                                                <Tooltip label="Delete Expense">
                                                                    <IconButton
                                                                        aria-label="Delete Expense"
                                                                        icon={
                                                                            <TrashIcon
                                                                                width={
                                                                                    18
                                                                                }
                                                                                height={
                                                                                    18
                                                                                }
                                                                            />
                                                                        }
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        colorScheme="red"
                                                                        borderRadius="md"
                                                                        onClick={() =>
                                                                            handleDeleteExpense(
                                                                                expense
                                                                            )
                                                                        }
                                                                    />
                                                                </Tooltip>
                                                            </HStack>
                                                        </Td>
                                                    </Tr>
                                                )
                                            )
                                        ) : (
                                            <Tr>
                                                <Td
                                                    colSpan={5}
                                                    py={12}
                                                    textAlign="center"
                                                >
                                                    <Flex
                                                        direction="column"
                                                        align="center"
                                                        justify="center"
                                                    >
                                                        <Flex
                                                            w="48px"
                                                            h="48px"
                                                            align="center"
                                                            justify="center"
                                                            borderRadius="full"
                                                            bg="gray.100"
                                                            color="gray.500"
                                                            mb={3}
                                                        >
                                                            <BanknotesIcon
                                                                width={22}
                                                                height={22}
                                                            />
                                                        </Flex>

                                                        <Text
                                                            fontWeight="600"
                                                            color="gray.700"
                                                        >
                                                            No expense
                                                            records
                                                        </Text>

                                                        <Text
                                                            fontSize="sm"
                                                            color="gray.500"
                                                            mt={1}
                                                        >
                                                            Add an
                                                            expense
                                                            record to
                                                            get
                                                            started.
                                                        </Text>
                                                    </Flex>
                                                </Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>

                        {/* FOOTER */}
                        <Divider mt={6} />

                        <Flex
                            justify="flex-end"
                            mt={5}
                        >
                            <Button
                                onClick={onClose}
                                variant="outline"
                                size="sm"
                                borderRadius="md"
                            >
                                Close
                            </Button>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* DELETE EXPENSE */}
            <DeleteVehicleExpenseDialog
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                expense={selectedExpense}
                onDeleted={reloadExpenses}
            />

            {/* ADD / UPDATE EXPENSE */}
            <VehicleExpenseForm
                isOpen={isFormOpen}
                onClose={onFormClose}
                vehicleId={vehicle.id}
                expenseTypes={expenseTypes}
                expense={editingExpense}
                onSaved={reloadExpenses}
            />
        </>
    );
}