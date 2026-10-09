import {
    Badge,
    Box,
    Divider,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Table,
    Tbody,
    Td,
    Text,
    Tr,
    Button,
} from "@chakra-ui/react";

import type { Vehicle } from "../../../api/VehicleManagement/vehicleApi";

interface VehicleNetIncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehicle | null;
}

export default function VehicleNetIncomeModal({
    isOpen,
    onClose,
    vehicle,
}: VehicleNetIncomeModalProps) {
    if (!vehicle) return null;

    const expenses = vehicle.expenses ?? [];

    const totalExpenses = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount ?? 0),
        0
    );

    const sellingPrice = Number(
        vehicle.selling_price ?? 0
    );

    const netIncome = sellingPrice - totalExpenses;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);

    const vehicleName = [
        vehicle.brand?.brand,
        vehicle.model?.model,
        vehicle.variant?.variant,
    ]
        .filter(Boolean)
        .join(" / ");

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            isCentered
            scrollBehavior="inside"
        >
            <ModalOverlay bg="blackAlpha.600" />

            <ModalContent
                borderRadius="xl"
                overflow="hidden"
                shadow="2xl"
            >
                {/* HEADER */}

                <ModalHeader
                    px={{ base: 5, md: 6 }}
                    py={5}
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    bg="white"
                >
                    <Box pr={8}>
                        <Text
                            fontSize="xl"
                            fontWeight="700"
                            color="gray.800"
                        >
                            Vehicle Net Income
                        </Text>

                        <Text
                            mt={1}
                            fontSize="sm"
                            fontWeight="400"
                            color="gray.500"
                        >
                            Review the estimated net income based on the selling price and total vehicle expenses.
                        </Text>
                    </Box>
                </ModalHeader>

                <ModalCloseButton
                    top={4}
                    right={4}
                    borderRadius="md"
                    _hover={{
                        bg: "gray.100",
                    }}
                />

                {/* BODY */}

                <ModalBody
                    px={{ base: 4, md: 6 }}
                    py={6}
                    maxH="70vh"
                    overflowY="auto"
                    bg="gray.50"
                >
                    {/* VEHICLE INFORMATION */}

                    <Box
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        overflow="hidden"
                        mb={5}
                    >
                        <Box
                            px={5}
                            py={4}
                            borderBottom="1px solid"
                            borderColor="gray.200"
                        >
                            <Text
                                fontSize="md"
                                fontWeight="700"
                                color="gray.800"
                            >
                               Vehicle Details
                            </Text>

                            <Text
                                mt={1}
                                fontSize="sm"
                                color="gray.500"
                            >
                                Basic information for this inventory
                                vehicle.
                            </Text>
                        </Box>

                        <Table
                            variant="simple"
                            size="sm"
                        >
                            <Tbody>
                                <Tr>
                                    <Td
                                        w="170px"
                                        px={5}
                                        py={3}
                                        fontWeight="600"
                                        color="gray.500"
                                        borderColor="gray.100"
                                    >
                                        Stock No.
                                    </Td>

                                    <Td
                                        px={5}
                                        py={3}
                                        fontWeight="600"
                                        color="gray.800"
                                        borderColor="gray.100"
                                    >
                                        {vehicle.stock_no}
                                    </Td>
                                </Tr>

                                <Tr>
                                    <Td
                                        px={5}
                                        py={3}
                                        fontWeight="600"
                                        color="gray.500"
                                        borderColor="gray.100"
                                    >
                                        Vehicle
                                    </Td>

                                    <Td
                                        px={5}
                                        py={3}
                                        fontWeight="600"
                                        color="gray.800"
                                        borderColor="gray.100"
                                    >
                                        {vehicleName || "-"}
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </Box>

                    {/* VEHICLE EXPENSES */}

                    <Box
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        overflow="hidden"
                    >
                        {expenses.length > 0 ? (
                            <>
                                {/* Expense Table */}

                                <Divider />

                                {/* FINANCIAL SUMMARY */}

                                <Box px={5} py={5}>
                                    <Text
                                        mb={4}
                                        fontSize="sm"
                                        fontWeight="700"
                                        color="gray.700"
                                        textTransform="uppercase"
                                        letterSpacing="wide"
                                    >
                                        Financial Summary
                                    </Text>

                                    <Flex
                                        justify="space-between"
                                        align="center"
                                        mb={3}
                                    >
                                        <Text color="gray.600">
                                            Selling Price
                                        </Text>

                                        <Text fontWeight="600">
                                            {formatCurrency(
                                                sellingPrice
                                            )}
                                        </Text>
                                    </Flex>

                                    <Divider my={4} />

                                    <Flex
                                        justify="space-between"
                                        align="center"
                                    >
                                        <Text
                                            color="gray.600"
                                        >
                                           Total Vehicle Expenses
                                        </Text>

                                        <Text
                                            fontWeight="600"
                                            color="red.500"
                                        >
                                            -{" "}
                                            {formatCurrency(
                                                totalExpenses
                                            )}
                                        </Text>
                                    </Flex>
                                </Box>

                                {/* NET INCOME RESULT */}

                                <Box
                                    mx={5}
                                    mb={5}
                                    p={5}
                                    bg={
                                        netIncome >= 0
                                            ? "green.50"
                                            : "red.50"
                                    }
                                    border="1px solid"
                                    borderColor={
                                        netIncome >= 0
                                            ? "green.200"
                                            : "red.200"
                                    }
                                    borderRadius="lg"
                                >
                                    <Flex
                                        justify="space-between"
                                        align={{
                                            base: "start",
                                            sm: "center",
                                        }}
                                        direction={{
                                            base: "column",
                                            sm: "row",
                                        }}
                                        gap={3}
                                    >
                                        <Box>
                                            <Text
                                                fontSize="sm"
                                                fontWeight="600"
                                                color={
                                                    netIncome >= 0
                                                        ? "green.700"
                                                        : "red.700"
                                                }
                                            >
                                                Estimated Net Income
                                            </Text>
                                        </Box>

                                        <Badge
                                            colorScheme={
                                                netIncome >= 0
                                                    ? "green"
                                                    : "red"
                                            }
                                            fontSize="md"
                                            px={4}
                                            py={2}
                                            borderRadius="md"
                                        >
                                            {formatCurrency(
                                                netIncome
                                            )}
                                        </Badge>
                                    </Flex>
                                </Box>
                            </>
                        ) : (
                            <>
                                {/* NO EXPENSES */}

                                <Box
                                    px={5}
                                    py={8}
                                    textAlign="center"
                                >
                                    <Text
                                        fontWeight="600"
                                        color="gray.700"
                                    >
                                        No expenses recorded
                                    </Text>

                                    <Text
                                        mt={1}
                                        fontSize="sm"
                                        color="gray.500"
                                    >
                                        This vehicle currently has
                                        no recorded expenses.
                                    </Text>
                                </Box>

                                <Divider />

                                <Box px={5} py={5}>
                                    <Flex
                                        justify="space-between"
                                        align="center"
                                        mb={4}
                                    >
                                        <Text
                                            color="gray.600"
                                        >
                                            Selling Price
                                        </Text>

                                        <Text
                                            fontWeight="700"
                                            color="blue.600"
                                        >
                                            {formatCurrency(
                                                sellingPrice
                                            )}
                                        </Text>
                                    </Flex>

                                    <Box
                                        p={4}
                                        bg="green.50"
                                        border="1px solid"
                                        borderColor="green.200"
                                        borderRadius="lg"
                                    >
                                        <Flex
                                            justify="space-between"
                                            align="center"
                                        >
                                            <Box>
                                                <Text
                                                    fontWeight="600"
                                                    color="green.700"
                                                >
                                                    Net Income
                                                </Text>

                                                <Text
                                                    mt={1}
                                                    fontSize="xs"
                                                    color="gray.500"
                                                >
                                                    No expenses
                                                    deducted
                                                </Text>
                                            </Box>

                                            <Badge
                                                colorScheme="green"
                                                fontSize="md"
                                                px={4}
                                                py={2}
                                                borderRadius="md"
                                            >
                                                {formatCurrency(
                                                    sellingPrice
                                                )}
                                            </Badge>
                                        </Flex>
                                    </Box>
                                </Box>
                            </>
                        )}
                    </Box>
                </ModalBody>

                {/* FOOTER */}

                <ModalFooter
                    px={{ base: 4, md: 6 }}
                    py={4}
                    borderTop="1px solid"
                    borderColor="gray.200"
                    bg="white"
                >
                    <Button
                        onClick={onClose}
                        size="sm"
                        px={6}
                        colorScheme="gray"
                    >
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}