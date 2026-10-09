import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    SimpleGrid,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";

import type { Sale } from "../../../api/SaleManagement/saleApi";
import { getVehicleExpenses, type VehicleExpense } from "../../../api/ExpenseManagement/expenseApi";
import { getVehicleParts, type VehiclePart } from "../../../api/PartManagement/vehiclePartsApi";
import Pagination from "../../../Reusable/Paginations";

interface SalesReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    sales: Sale[];
}
export default function SalesReportModal({
    isOpen,
    onClose,
    sales,
}: SalesReportModalProps) {
    const ITEMS_PER_PAGE = 10;

    const [currentPage, setCurrentPage] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [brandFilter, setBrandFilter] = useState("all");

    const [expenses, setExpenses] = useState<VehicleExpense[]>([]);
    const [vehicleParts, setVehicleParts] = useState<VehiclePart[]>([]);
    const [expenseLoading, setExpenseLoading] = useState(false);

    const formatCurrency = (amount: number) =>
        Number(amount).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const brands = useMemo(
        () =>
            Array.from(
                new Set(
                    sales
                        .map(
                            (sale) =>
                                sale.reservation?.vehicle?.brand?.brand
                        )
                        .filter(Boolean)
                )
            ).sort(),
        [sales]
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [startDate, endDate, statusFilter, brandFilter]);

    useEffect(() => {
        if (!isOpen) return;
        const loadExpenseData = async () => {
            try {
                setExpenseLoading(true);
                const [expenseData, partsData] = await Promise.all([
                    getVehicleExpenses(),
                    getVehicleParts(),
                ]);
                setExpenses(expenseData);
                setVehicleParts(partsData);
            } catch (error) {
                console.error(
                    "Failed to load vehicle expense data:",
                    error
                );
            } finally {
                setExpenseLoading(false);
            }
        };

        void loadExpenseData();
    }, [isOpen]);

    const filteredSales = useMemo(() => {
        return sales.filter((sale) => {
            const vehicle = sale.reservation?.vehicle;
            const saleDate = sale.sale_date
                ? new Date(sale.sale_date)
                : null;
            if (!saleDate) return false;
            const saleDateOnly = new Date(
                saleDate.getFullYear(),
                saleDate.getMonth(),
                saleDate.getDate()
            );
            if (startDate) {
                const start = new Date(`${startDate}T00:00:00`);
                if (saleDateOnly < start) {
                    return false;
                }
            } if (endDate) {
                const end = new Date(`${endDate}T23:59:59`);
                if (saleDateOnly > end) {
                    return false;
                }
            } if (statusFilter !== "all" && sale.status !== statusFilter
            ) {
                return false;
            } if (brandFilter !== "all" && vehicle?.brand?.brand !== brandFilter
            ) {
                return false;
            }
            return true;
        });
    }, [
        sales,
        startDate,
        endDate,
        statusFilter,
        brandFilter,
    ]);

    const completedSales = filteredSales.filter(
        (sale) => sale.status === "completed"
    );
    const vehiclesSold = completedSales.length;
    const grossSales = completedSales.reduce(
        (total, sale) =>
            total + Number(sale.reservation?.vehicle?.selling_price ?? 0),
        0
    );
    const totalDiscounts = completedSales.reduce(
        (total, sale) =>
            total + Number(sale.discount_amount ?? 0),
        0
    );
    const netSales = Math.max(
        grossSales - totalDiscounts,
        0
    );
    const averageSale =
        vehiclesSold > 0
            ? netSales / vehiclesSold
            : 0;

    /* VEHICLE EXPENSES */

    const totalVehicleExpenses = expenses.reduce(
        (total, expense) =>
            total + Number(expense.amount ?? 0),
        0
    );

    /* VEHICLE PARTS COST */

    const totalPartsCost = vehicleParts.reduce(
        (total, part) =>
            total +
            Number(part.quantity ?? 0) *
            Number(part.unit_price ?? 0),
        0
    );

    /* NET INCOME */

    const netIncome =
        netSales -
        totalVehicleExpenses -
        totalPartsCost;

    const paginatedSales = filteredSales.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const resetFilters = () => {
        setStartDate("");
        setEndDate("");
        setStatusFilter("all");
        setBrandFilter("all");
        setCurrentPage(1);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="6xl"
            isCentered
            scrollBehavior="inside"
        >
            <ModalOverlay />

            <ModalContent>
                <ModalHeader>
                    <Heading size="md" color="gray.800">
                        Sales Report
                    </Heading>

                    <Text
                        mt={1}
                        fontSize="xs"
                        color="gray.500"
                    >
                        Business sales performance and financial summary.
                    </Text>
                </ModalHeader>

                <ModalCloseButton />

                <ModalBody>
                    {/* FILTERS */}

                    <Box
                        mb={5}
                        p={4}
                        rounded="lg"
                        border="1px solid"
                        borderColor="gray.200"
                        bg="gray.50"
                    >
                        <Text
                            mb={3}
                            fontSize="xs"
                            fontWeight="800"
                            color="gray.600"
                            textTransform="uppercase"
                        >
                            Report Filters
                        </Text>

                        <SimpleGrid
                            columns={{
                                base: 1,
                                md: 2,
                                lg: 5,
                            }}
                            spacing={3}
                        >
                            <Box>
                                <Text
                                    mb={1}
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.600"
                                >
                                    Start Date
                                </Text>

                                <Input
                                    type="date"
                                    size="sm"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(
                                            e.target.value
                                        )
                                    }
                                    bg="white"
                                />
                            </Box>

                            <Box>
                                <Text
                                    mb={1}
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.600"
                                >
                                    End Date
                                </Text>

                                <Input
                                    type="date"
                                    size="sm"
                                    value={endDate}
                                    min={
                                        startDate || undefined
                                    }
                                    onChange={(e) =>
                                        setEndDate(
                                            e.target.value
                                        )
                                    }
                                    bg="white"
                                />
                            </Box>

                            <Box>
                                <Text
                                    mb={1}
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.600"
                                >
                                    Status
                                </Text>

                                <Select
                                    size="sm"
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value
                                        )
                                    }
                                    bg="white"
                                >
                                    <option value="all">
                                        All Status
                                    </option>

                                    <option value="completed">
                                        Completed
                                    </option>

                                    <option value="pending">
                                        Pending
                                    </option>

                                    <option value="cancelled">
                                        Cancelled
                                    </option>
                                </Select>
                            </Box>

                            <Box>
                                <Text
                                    mb={1}
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.600"
                                >
                                    Brand
                                </Text>

                                <Select
                                    size="sm"
                                    value={brandFilter}
                                    onChange={(e) =>
                                        setBrandFilter(
                                            e.target.value
                                        )
                                    }
                                    bg="white"
                                >
                                    <option value="all">
                                        All Brands
                                    </option>

                                    {brands.map((brand) => (
                                        <option
                                            key={brand}
                                            value={brand}
                                        >
                                            {brand}
                                        </option>
                                    ))}
                                </Select>
                            </Box>

                            <Button
                                size="sm"
                                variant="outline"
                                alignSelf="flex-end"
                                onClick={resetFilters}
                            >
                                Reset
                            </Button>
                        </SimpleGrid>
                    </Box>

                    {/* SALES SUMMARY */}

                    <Text
                        mb={3}
                        fontSize="xs"
                        fontWeight="800"
                        color="gray.600"
                        textTransform="uppercase"
                    >
                        Sales Summary
                    </Text>

                    <SimpleGrid
                        columns={{
                            base: 1,
                            sm: 2,
                            lg: 5,
                        }}
                        spacing={3}
                        mb={5}
                    >
                        <Box
                            p={4}
                            rounded="lg"
                            border="1px solid"
                            borderColor="gray.200"
                            bg="gray.50"
                        >
                            <Text
                                fontSize="xs"
                                color="gray.500"
                            >
                                Vehicles Sold
                            </Text>

                            <Text
                                mt={1}
                                fontSize="xl"
                                fontWeight="700"
                                color="gray.800"
                            >
                                {vehiclesSold}
                            </Text>
                        </Box>

                        <Box
                            p={4}
                            rounded="lg"
                            border="1px solid"
                            borderColor="gray.200"
                        >
                            <Text
                                fontSize="xs"
                                color="gray.500"
                            >
                                Gross Sales
                            </Text>

                            <Text
                                mt={1}
                                fontSize="lg"
                                fontWeight="700"
                                color="gray.800"
                            >
                                ₱
                                {formatCurrency(
                                    grossSales
                                )}
                            </Text>
                        </Box>

                        <Box
                            p={4}
                            rounded="lg"
                            border="1px solid"
                            borderColor="gray.200"
                        >
                            <Text
                                fontSize="xs"
                                color="gray.500"
                            >
                                Discounts
                            </Text>

                            <Text
                                mt={1}
                                fontSize="lg"
                                fontWeight="700"
                                color="red.500"
                            >
                                ₱
                                {formatCurrency(
                                    totalDiscounts
                                )}
                            </Text>
                        </Box>

                        <Box
                            p={4}
                            rounded="lg"
                            border="1px solid"
                            borderColor="green.200"
                            bg="green.50"
                        >
                            <Text
                                fontSize="xs"
                                color="gray.600"
                            >
                                Net Sales
                            </Text>

                            <Text
                                mt={1}
                                fontSize="lg"
                                fontWeight="800"
                                color="green.600"
                            >
                                ₱
                                {formatCurrency(
                                    netSales
                                )}
                            </Text>
                        </Box>

                        <Box
                            p={4}
                            rounded="lg"
                            border="1px solid"
                            borderColor="gray.200"
                            bg="gray.50"
                        >
                            <Text
                                fontSize="xs"
                                color="gray.500"
                            >
                                Average Sale
                            </Text>

                            <Text
                                mt={1}
                                fontSize="lg"
                                fontWeight="700"
                                color="gray.800"
                            >
                                ₱
                                {formatCurrency(
                                    averageSale
                                )}
                            </Text>
                        </Box>
                    </SimpleGrid>

                    <Divider mb={5} />

                    {/* EXPENSES & NET INCOME */}

                    <Text
                        mb={3}
                        fontSize="xs"
                        fontWeight="800"
                        color="gray.600"
                        textTransform="uppercase"
                    >
                        Expenses & Net Income
                    </Text>

                    {expenseLoading ? (
                        <Flex
                            justify="center"
                            align="center"
                            py={8}
                        >
                            <Spinner size="md" />
                        </Flex>
                    ) : (
                        <SimpleGrid
                            columns={{
                                base: 1,
                                md: 3,
                            }}
                            spacing={3}
                            mb={5}
                        >
                            <Box
                                p={4}
                                rounded="lg"
                                border="1px solid"
                                borderColor="red.200"
                                bg="red.50"
                            >
                                <Text
                                    fontSize="xs"
                                    color="gray.600"
                                >
                                    Vehicle Expenses
                                </Text>

                                <Text
                                    mt={1}
                                    fontSize="lg"
                                    fontWeight="700"
                                    color="red.600"
                                >
                                    − ₱
                                    {formatCurrency(
                                        totalVehicleExpenses
                                    )}
                                </Text>

                                <Text
                                    mt={1}
                                    fontSize="xs"
                                    color="gray.500"
                                >
                                    {expenses.length} expense
                                    {expenses.length !== 1
                                        ? " records"
                                        : " record"}
                                </Text>
                            </Box>

                            <Box
                                p={4}
                                rounded="lg"
                                border="1px solid"
                                borderColor="orange.200"
                                bg="orange.50"
                            >
                                <Text
                                    fontSize="xs"
                                    color="gray.600"
                                >
                                    Vehicle Parts Cost
                                </Text>

                                <Text
                                    mt={1}
                                    fontSize="lg"
                                    fontWeight="700"
                                    color="orange.600"
                                >
                                    − ₱
                                    {formatCurrency(
                                        totalPartsCost
                                    )}
                                </Text>

                                <Text
                                    mt={1}
                                    fontSize="xs"
                                    color="gray.500"
                                >
                                    {vehicleParts.length} part
                                    {vehicleParts.length !== 1
                                        ? " records"
                                        : " record"}
                                </Text>
                            </Box>

                            <Box
                                p={4}
                                rounded="lg"
                                border="1px solid"
                                borderColor="blue.200"
                                bg="blue.50"
                            >
                                <Text
                                    fontSize="xs"
                                    color="gray.600"
                                >
                                    Net Income
                                </Text>

                                <Text
                                    mt={1}
                                    fontSize="xl"
                                    fontWeight="800"
                                    color={
                                        netIncome >= 0
                                            ? "blue.600"
                                            : "red.600"
                                    }
                                >
                                    ₱
                                    {formatCurrency(
                                        netIncome
                                    )}
                                </Text>

                                <Text
                                    mt={1}
                                    fontSize="xs"
                                    color="gray.500"
                                >
                                    Net Sales − Vehicle
                                    Expenses − Parts Cost
                                </Text>
                            </Box>
                        </SimpleGrid>
                    )}

                    <Divider mb={5} />

                    {/* SALES BREAKDOWN */}

                    <Flex
                        justify="space-between"
                        align="center"
                        mb={3}
                    >
                        <Box>
                            <Heading
                                size="sm"
                                color="gray.800"
                            >
                                Sales Breakdown
                            </Heading>

                            <Text
                                mt={1}
                                fontSize="xs"
                                color="gray.500"
                            >
                                {filteredSales.length}{" "}
                                transaction
                                {filteredSales.length !== 1
                                    ? "s"
                                    : ""}
                            </Text>
                        </Box>
                    </Flex>

                    <Box
                        overflowX="auto"
                        border="1px solid"
                        borderColor="gray.200"
                        rounded="lg"
                    >
                        <Table
                            variant="simple"
                            minW="850px"
                        >
                            <Thead bg="gray.50">
                                <Tr>
                                    {[
                                        "Invoice",
                                        "Stock No.",
                                        "Customer Name",
                                        "Date",
                                        "Net Sales",
                                    ].map((header) => (
                                        <Th
                                            key={header}
                                            isNumeric={
                                                header ===
                                                "Net Sales"
                                            }
                                            fontSize="xs"
                                            fontWeight="800"
                                            color="gray.700"
                                            py={2}
                                        >
                                            {header}
                                        </Th>
                                    ))}
                                </Tr>
                            </Thead>

                            <Tbody>
                                {paginatedSales.length ===
                                    0 ? (
                                    <Tr>
                                        <Td
                                            colSpan={5}
                                            textAlign="center"
                                            py={10}
                                        >
                                            <Text
                                                fontSize="sm"
                                                color="gray.500"
                                            >
                                                No sales records
                                                found.
                                            </Text>
                                        </Td>
                                    </Tr>
                                ) : (
                                    paginatedSales.map(
                                        (sale) => {
                                            const vehicle =
                                                sale
                                                    .reservation
                                                    ?.vehicle;

                                            const customer =
                                                sale
                                                    .reservation
                                                    ?.customer;

                                            const customerName =
                                                customer
                                                    ? [
                                                        customer.first_name,
                                                        customer.middle_name,
                                                        customer.last_name,
                                                    ]
                                                        .filter(
                                                            Boolean
                                                        )
                                                        .join(
                                                            " "
                                                        )
                                                    : "-";

                                            const sellingPrice =
                                                Number(
                                                    vehicle?.selling_price ??
                                                    0
                                                );

                                            const discount =
                                                Number(
                                                    sale.discount_amount ??
                                                    0
                                                );

                                            const netSale =
                                                Math.max(
                                                    sellingPrice -
                                                    discount,
                                                    0
                                                );

                                            return (
                                                <Tr
                                                    key={
                                                        sale.id
                                                    }
                                                    _hover={{
                                                        bg: "gray.50",
                                                    }}
                                                >
                                                    <Td py={2}>
                                                        <Text
                                                            fontSize="sm"
                                                            fontWeight="600"
                                                            whiteSpace="nowrap"
                                                        >
                                                            {sale.invoice_number ||
                                                                "-"}
                                                        </Text>
                                                    </Td>

                                                    <Td py={2}>
                                                        <Text
                                                            fontSize="sm"
                                                            fontWeight="600"
                                                            whiteSpace="nowrap"
                                                        >
                                                            {vehicle?.stock_no ||
                                                                "-"}
                                                        </Text>
                                                    </Td>

                                                    <Td py={2}>
                                                        <Text
                                                            fontSize="sm"
                                                            fontWeight="600"
                                                            whiteSpace="nowrap"
                                                        >
                                                            {
                                                                customerName
                                                            }
                                                        </Text>
                                                    </Td>

                                                    <Td py={2}>
                                                        <Text
                                                            fontSize="sm"
                                                            color="gray.700"
                                                            whiteSpace="nowrap"
                                                        >
                                                            {sale.sale_date
                                                                ? new Date(
                                                                    sale.sale_date
                                                                ).toLocaleDateString(
                                                                    "en-PH",
                                                                    {
                                                                        year: "numeric",
                                                                        month: "short",
                                                                        day: "numeric",
                                                                    }
                                                                )
                                                                : "-"}
                                                        </Text>
                                                    </Td>

                                                    <Td
                                                        py={2}
                                                        isNumeric
                                                    >
                                                        <Text
                                                            fontSize="sm"
                                                            fontWeight="700"
                                                            color="green.600"
                                                            whiteSpace="nowrap"
                                                        >
                                                            ₱
                                                            {formatCurrency(
                                                                netSale
                                                            )}
                                                        </Text>
                                                    </Td>
                                                </Tr>
                                            );
                                        }
                                    )
                                )}
                            </Tbody>
                        </Table>
                    </Box>

                    <Pagination
                        currentPage={currentPage}
                        totalItems={
                            filteredSales.length
                        }
                        itemsPerPage={
                            ITEMS_PER_PAGE
                        }
                        onPageChange={
                            setCurrentPage
                        }
                        itemLabel="sale"
                    />
                </ModalBody>

                <ModalFooter>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}