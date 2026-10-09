import { useEffect, useState } from "react";

import {
    Badge,
    Box,
    Flex,
    Heading,
    Spinner,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    useToast,
    Button,
} from "@chakra-ui/react";

import {
    getExpenseTypes,
    type ExpenseType,
} from "../../../../api/ExpenseManagement/expenseTypeApi";

export default function AdminViewExpenseType() {
    const toast = useToast();

    const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
    const [loading, setLoading] = useState(true);

    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    /**
     * Load Expense Types
     */
    const loadExpenseTypes = async () => {
        try {
            setLoading(true);

            const data = await getExpenseTypes();

            setExpenseTypes(data);
        } catch {
            toast({
                title: "Error",
                description: "Failed to load expense types.",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Initial Load
     */
    useEffect(() => {
        loadExpenseTypes();
    }, []);

    /**
     * Pagination
     */
    const totalPages = Math.ceil(
        expenseTypes.length / ITEMS_PER_PAGE
    );

    const paginatedExpenseTypes = expenseTypes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const startItem =
        expenseTypes.length === 0
            ? 0
            : (currentPage - 1) * ITEMS_PER_PAGE + 1;

    const endItem = Math.min(
        currentPage * ITEMS_PER_PAGE,
        expenseTypes.length
    );

    return (
        <Box>
            {/* PAGE HEADER */}
            <Box mb={5}>
                <Heading
                    size="lg"
                    fontWeight="700"
                    color="gray.800"
                >
                    Expense Type Master Data
                </Heading>

                <Text
                    mt={1}
                    fontSize="sm"
                    color="gray.500"
                >
                    Manage vehicle expense types.
                </Text>
            </Box>

            {/* EXPENSE TYPE TABLE CARD */}
            <Box
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="xl"
                boxShadow="sm"
                overflow="hidden"
            >
                {/* CARD HEADER */}
                <Flex
                    px={{ base: 4, md: 5 }}
                    py={4}
                    justify="space-between"
                    align="center"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                >
                    <Box>
                        <Text
                            fontSize="md"
                            fontWeight="700"
                            color="gray.800"
                        >
                            Expense Types
                        </Text>

                        <Text
                            mt={0.5}
                            fontSize="xs"
                            color="gray.500"
                        >
                            List of registered vehicle expense types
                        </Text>
                    </Box>

                    <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        colorScheme="blue"
                        fontSize="xs"
                        fontWeight="600"
                    >
                        {expenseTypes.length} Expense Types
                    </Badge>
                </Flex>

                {/* TABLE / LOADING */}
                {loading ? (
                    <Flex
                        justify="center"
                        align="center"
                        direction="column"
                        py={16}
                        gap={3}
                    >
                        <Spinner
                            size="md"
                            thickness="3px"
                        />

                        <Text
                            fontSize="sm"
                            color="gray.500"
                        >
                            Loading expense types...
                        </Text>
                    </Flex>
                ) : (
                    <Box overflowX="auto">
                        <Table
                            variant="simple"
                            minW="600px"
                        >
                            <Thead>
                                <Tr
                                    bg="gray.50"
                                    borderBottom="1px solid"
                                    borderColor="gray.200"
                                >
                                    <Th
                                        width="80px"
                                        textAlign="center"
                                        fontSize="xs"
                                        color="gray.500"
                                        fontWeight="700"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                        py={4}
                                    >
                                        No.
                                    </Th>

                                    <Th
                                        fontSize="xs"
                                        color="gray.500"
                                        fontWeight="700"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                    >
                                        Expense Type
                                    </Th>

                                    <Th
                                        width="140px"
                                        textAlign="center"
                                        fontSize="xs"
                                        color="gray.500"
                                        fontWeight="700"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                    >
                                        Status
                                    </Th>
                                </Tr>
                            </Thead>

                            <Tbody>
                                {paginatedExpenseTypes.length > 0 ? (
                                    paginatedExpenseTypes.map(
                                        (expense, index) => (
                                            <Tr
                                                key={expense.id}
                                                _hover={{
                                                    bg: "gray.50",
                                                }}
                                                transition="background 0.15s"
                                            >
                                                {/* Number */}
                                                <Td
                                                    textAlign="center"
                                                    color="gray.500"
                                                    fontSize="sm"
                                                    py={4}
                                                >
                                                    {(currentPage - 1) *
                                                        ITEMS_PER_PAGE +
                                                        index +
                                                        1}
                                                </Td>

                                                {/* Expense Type */}
                                                <Td
                                                    fontSize="sm"
                                                    fontWeight="600"
                                                    color="gray.800"
                                                >
                                                    {expense.expense_name}
                                                </Td>

                                                {/* Status */}
                                                <Td textAlign="center">
                                                    <Badge
                                                        px={3}
                                                        py={1}
                                                        borderRadius="full"
                                                        colorScheme={
                                                            expense.is_active
                                                                ? "green"
                                                                : "red"
                                                        }
                                                        fontSize="xs"
                                                        fontWeight="600"
                                                    >
                                                        {expense.is_active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </Badge>
                                                </Td>
                                            </Tr>
                                        )
                                    )
                                ) : (
                                    <Tr>
                                        <Td
                                            colSpan={3}
                                            textAlign="center"
                                            py={14}
                                        >
                                            <Box>
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="600"
                                                    color="gray.600"
                                                >
                                                    No expense types found
                                                </Text>

                                                <Text
                                                    mt={1}
                                                    fontSize="xs"
                                                    color="gray.400"
                                                >
                                                    There are currently no
                                                    expense types to display.
                                                </Text>
                                            </Box>
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                )}

                {/* PAGINATION FOOTER */}
                {!loading && (
                    <Flex
                        px={{ base: 4, md: 5 }}
                        py={4}
                        borderTop="1px solid"
                        borderColor="gray.200"
                        justify="space-between"
                        align="center"
                        flexWrap="wrap"
                        gap={3}
                    >
                        {/* Result Information */}
                        <Text
                            fontSize="xs"
                            color="gray.500"
                        >
                            Showing{" "}
                            <Text
                                as="span"
                                fontWeight="600"
                                color="gray.700"
                            >
                                {startItem}
                            </Text>
                            {" - "}
                            <Text
                                as="span"
                                fontWeight="600"
                                color="gray.700"
                            >
                                {endItem}
                            </Text>
                            {" of "}
                            <Text
                                as="span"
                                fontWeight="600"
                                color="gray.700"
                            >
                                {expenseTypes.length}
                            </Text>
                            {" expense types"}
                        </Text>

                        {/* Pagination Controls */}
                        <Flex
                            gap={2}
                            align="center"
                        >
                            <Button
                                size="sm"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.600"
                                fontWeight="500"
                                _hover={{
                                    bg: "gray.50",
                                }}
                                onClick={() =>
                                    setCurrentPage(
                                        (page) => page - 1
                                    )
                                }
                                isDisabled={
                                    currentPage === 1 ||
                                    totalPages === 0
                                }
                            >
                                Previous
                            </Button>

                            <Flex
                                minW="100px"
                                h="32px"
                                px={3}
                                align="center"
                                justify="center"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                bg="gray.50"
                            >
                                <Text
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.600"
                                >
                                    Page {currentPage} of{" "}
                                    {totalPages || 1}
                                </Text>
                            </Flex>

                            <Button
                                size="sm"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.600"
                                fontWeight="500"
                                _hover={{
                                    bg: "gray.50",
                                }}
                                onClick={() =>
                                    setCurrentPage(
                                        (page) => page + 1
                                    )
                                }
                                isDisabled={
                                    currentPage === totalPages ||
                                    totalPages === 0
                                }
                            >
                                Next
                            </Button>
                        </Flex>
                    </Flex>
                )}
            </Box>
        </Box>
    );
}