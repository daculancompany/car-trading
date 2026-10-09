import {
    Button,
    FormControl,
    IconButton,
    Input,
    Select,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Tfoot,
    Th,
    Thead,
    Tr,
    VStack,
    HStack,
    Box,
    Divider,
    InputGroup,
    InputLeftAddon,
    Flex,
} from "@chakra-ui/react";

import {
    PlusIcon,
    TrashIcon,
    BanknotesIcon,
} from "@heroicons/react/24/outline";

import type { ExpenseType } from "../../../../api/ExpenseManagement/expenseTypeApi";

import type {
    CreateVehicleExpenseData,
} from "../../../../api/ExpenseManagement/expenseApi";

import {
    formatNumber,
    formatPeso,
    parseNumber,
} from "../../../../utils/numberFormatter";

interface AddVehicleExpenseProps {
    expenses: Omit<
        CreateVehicleExpenseData,
        "vehicle_id"
    >[];

    setExpenses: React.Dispatch<
        React.SetStateAction<
            Omit<
                CreateVehicleExpenseData,
                "vehicle_id"
            >[]
        >
    >;

    expenseTypes: ExpenseType[];
}

export default function AdminAddVehicleExpense({
    expenses,
    setExpenses,
    expenseTypes,
}: AddVehicleExpenseProps) {

    // UPDATE EXPENSE

    const updateExpense = <
        K extends keyof Omit<
            CreateVehicleExpenseData,
            "vehicle_id"
        >
    >(
        index: number,
        field: K,
        value: Omit<
            CreateVehicleExpenseData,
            "vehicle_id"
        >[K]
    ) => {
        setExpenses((prev) =>
            prev.map((expense, i) =>
                i === index
                    ? {
                        ...expense,
                        [field]: value,
                    }
                    : expense
            )
        );
    };

    // ADD EXPENSE

    const addExpense = () => {
        setExpenses((prev) => [
            ...prev,
            {
                expense_type_id: 0,
                amount: 0,
                remarks: "",
            },
        ]);
    };

    // REMOVE EXPENSE

    const removeExpense = (index: number) => {
        setExpenses((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    // TOTAL EXPENSE

    const totalExpense = expenses.reduce(
        (total, expense) =>
            total + Number(expense.amount ?? 0),
        0
    );

    // RENDER

    return (
        <VStack
            align="stretch"
            spacing={5}
        >

            {/* SECTION HEADER */}

            <Box>

                <HStack
                    spacing={2}
                    mb={3}
                >
                    <BanknotesIcon
                        width={19}
                        height={19}
                    />

                    <Text
                        fontSize="sm"
                        fontWeight="700"
                        color="dark.900"
                    >
                        Vehicle Expenses
                    </Text>
                </HStack>

                <Divider />

                <Text
                    mt={3}
                    fontSize="sm"
                    color="gray.500"
                >
                    Add any expenses associated with this
                    vehicle, such as registration,
                    repairs, transportation, or other costs.
                </Text>

            </Box>

            {/* EXPENSE TABLE CARD */}

            <Box
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                overflow="hidden"
            >

                <TableContainer
                    overflowX="auto"
                >
                    <Table
                        size="sm"
                        variant="simple"
                    >

                        {/* HEADER */}

                        <Thead bg="gray.50">

                            <Tr>

                                <Th
                                    width="28%"
                                    fontSize="xs"
                                >
                                    Expense Type
                                </Th>

                                <Th
                                    width="22%"
                                    fontSize="xs"
                                >
                                    Amount
                                </Th>

                                <Th
                                    fontSize="xs"
                                >
                                    Remarks
                                </Th>

                                <Th
                                    width="60px"
                                    textAlign="center"
                                    fontSize="xs"
                                >
                                    Action
                                </Th>

                            </Tr>

                        </Thead>

                        {/* BODY */}

                        <Tbody>

                            {expenses.map(
                                (expense, index) => (

                                    <Tr
                                        key={index}
                                        _hover={{
                                            bg: "gray.50",
                                        }}
                                    >

                                        {/* EXPENSE TYPE */}

                                        <Td>

                                            <FormControl
                                                isRequired
                                            >

                                                <Select
                                                    size="sm"
                                                    placeholder="Select type"
                                                    value={
                                                        expense.expense_type_id ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        updateExpense(
                                                            index,
                                                            "expense_type_id",
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                >

                                                    {expenseTypes
                                                        .filter(
                                                            (type) =>
                                                                type.is_active
                                                        )
                                                        .map(
                                                            (type) => (
                                                                <option
                                                                    key={
                                                                        type.id
                                                                    }
                                                                    value={
                                                                        type.id
                                                                    }
                                                                >
                                                                    {
                                                                        type.expense_name
                                                                    }
                                                                </option>
                                                            )
                                                        )}

                                                </Select>

                                            </FormControl>

                                        </Td>

                                        {/* AMOUNT */}

                                        <Td>

                                            <FormControl
                                                isRequired
                                            >

                                                <InputGroup
                                                    size="sm"
                                                >

                                                    <InputLeftAddon
                                                        fontSize="sm"
                                                        bg="gray.50"
                                                        borderColor="gray.200"
                                                    >
                                                        ₱
                                                    </InputLeftAddon>

                                                    <Input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="0.00"
                                                        value={formatNumber(
                                                            expense.amount
                                                        )}
                                                        onChange={(e) =>
                                                            updateExpense(
                                                                index,
                                                                "amount",
                                                                parseNumber(
                                                                    e.target.value
                                                                ) ?? 0
                                                            )
                                                        }
                                                    />

                                                </InputGroup>

                                            </FormControl>

                                        </Td>

                                        {/* REMARKS */}

                                        <Td>

                                            <Input
                                                size="sm"
                                                placeholder="Optional remarks"
                                                value={
                                                    expense.remarks ??
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    updateExpense(
                                                        index,
                                                        "remarks",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </Td>

                                        {/* DELETE */}

                                        <Td
                                            textAlign="center"
                                        >

                                            <IconButton
                                                aria-label="Delete Expense"
                                                icon={
                                                    <TrashIcon
                                                        width={17}
                                                        height={17}
                                                    />
                                                }
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() =>
                                                    removeExpense(
                                                        index
                                                    )
                                                }
                                                isDisabled={
                                                    expenses.length ===
                                                    1
                                                }
                                            />

                                        </Td>

                                    </Tr>

                                )
                            )}

                        </Tbody>

                        {/* TOTAL */}

                        <Tfoot>

                            <Tr>

                                <Td
                                    colSpan={4}
                                    bg="gray.50"
                                >

                                    <Flex
                                        justify="flex-end"
                                        align="center"
                                    >

                                        <Text
                                            fontSize="sm"
                                            color="gray.500"
                                            mr={3}
                                        >
                                            Total Expenses
                                        </Text>

                                        <Text
                                            fontSize="md"
                                            fontWeight="700"
                                            color="dark.900"
                                        >
                                            {formatPeso(
                                                totalExpense
                                            )}
                                        </Text>

                                    </Flex>

                                </Td>

                            </Tr>

                        </Tfoot>

                    </Table>

                </TableContainer>

            </Box>

            {/* ADD EXPENSE BUTTON */}

            <Button
                size="sm"
                alignSelf="flex-start"
                variant="outline"
                leftIcon={
                    <PlusIcon
                        width={17}
                        height={17}
                    />
                }
                color="brand.500"
                borderColor="brand.500"
                _hover={{
                    bg: "brand.50",
                }}
                onClick={addExpense}
            >
                Add Expense
            </Button>

        </VStack>
    );
}