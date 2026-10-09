
import {
    Box,
    Divider,
    Flex,
    Heading,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    Text,
} from "@chakra-ui/react";

import type { Sale } from "../../../api/SaleManagement/saleApi";

interface CustomerSaleReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale | null;
}

export default function CustomerSaleReportModal({
    isOpen,
    onClose,
    sale,
}: CustomerSaleReportModalProps) {
    const formatCurrency = (amount: number) =>
        Number(amount).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    if (!sale) return null;

    const vehicle = sale.reservation?.vehicle;
    const customer = sale.reservation?.customer;

    const customerName = customer
        ? [
            customer.first_name,
            customer.middle_name,
            customer.last_name,
        ]
            .filter(Boolean)
            .join(" ")
        : "-";

    const sellingPrice = Number(vehicle?.selling_price ?? 0);
    const discount = Number(sale.discount_amount ?? 0);
    const totalSales = Math.max(sellingPrice - discount, 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="3xl"
            isCentered
            scrollBehavior="inside"
        >
            <ModalOverlay />

            <ModalContent>
                <ModalHeader>
                    <Heading size="md" color="gray.800">
                        Customer Sale Report
                    </Heading>

                    <Text mt={1} fontSize="xs" color="gray.500">
                        Individual customer and vehicle sales information.
                    </Text>
                </ModalHeader>

                <ModalCloseButton />

                <ModalBody>
                    {/* CUSTOMER */}
                    <Box
                        p={4}
                        mb={4}
                        rounded="lg"
                        border="1px solid"
                        borderColor="gray.200"
                        bg="gray.50"
                    >
                        <Text
                            mb={2}
                            fontSize="xs"
                            fontWeight="800"
                            color="gray.500"
                            textTransform="uppercase"
                        >
                            Customer
                        </Text>

                        <Text
                            fontSize="md"
                            fontWeight="700"
                            color="gray.800"
                        >
                            {customerName}
                        </Text>
                    </Box>

                    {/* VEHICLE */}
                    <Box
                        p={4}
                        mb={4}
                        rounded="lg"
                        border="1px solid"
                        borderColor="gray.200"
                    >
                        <Text
                            mb={3}
                            fontSize="xs"
                            fontWeight="800"
                            color="gray.500"
                            textTransform="uppercase"
                        >
                            Vehicle
                        </Text>

                        <SimpleGrid
                            columns={{ base: 1, md: 2 }}
                            spacing={4}
                        >
                            <Box>
                                <Text fontSize="xs" color="gray.500">
                                    Stock No.
                                </Text>
                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.800"
                                >
                                    {vehicle?.stock_no || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" color="gray.500">
                                    Brand
                                </Text>
                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.800"
                                >
                                    {vehicle?.brand?.brand || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" color="gray.500">
                                    Model
                                </Text>
                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.800"
                                >
                                    {vehicle?.model?.model || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" color="gray.500">
                                    Variant
                                </Text>
                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.800"
                                >
                                    {vehicle?.variant?.variant || "-"}
                                </Text>
                            </Box>
                        </SimpleGrid>
                    </Box>

                    <Divider mb={4} />

                    {/* SALES */}
                    <Box
                        p={4}
                        rounded="lg"
                        border="1px solid"
                        borderColor="gray.200"
                    >
                        <Text
                            mb={4}
                            fontSize="xs"
                            fontWeight="800"
                            color="gray.500"
                            textTransform="uppercase"
                        >
                            Sales Information
                        </Text>

                        <Flex
                            direction="column"
                            gap={3}
                        >
                            <Flex
                                justify="space-between"
                                align="center"
                            >
                                <Text
                                    fontSize="sm"
                                    color="gray.600"
                                >
                                    Selling Price
                                </Text>

                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.800"
                                >
                                    ₱{formatCurrency(sellingPrice)}
                                </Text>
                            </Flex>

                            <Flex
                                justify="space-between"
                                align="center"
                            >
                                <Text
                                    fontSize="sm"
                                    color="gray.600"
                                >
                                    Discount
                                </Text>

                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="red.500"
                                >
                                    ₱{formatCurrency(discount)}
                                </Text>
                            </Flex>

                            <Divider />

                            <Flex
                                justify="space-between"
                                align="center"
                                p={3}
                                rounded="md"
                                bg="green.50"
                            >
                                <Text
                                    fontSize="sm"
                                    fontWeight="700"
                                    color="gray.700"
                                >
                                    Total Sales
                                </Text>

                                <Text
                                    fontSize="lg"
                                    fontWeight="800"
                                    color="green.600"
                                >
                                    ₱{formatCurrency(totalSales)}
                                </Text>
                            </Flex>
                        </Flex>
                    </Box>
                </ModalBody>

                <ModalFooter>
                    <Box
                        w="full"
                        display="flex"
                        justifyContent="flex-end"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: "8px 16px",
                                border: "1px solid #CBD5E0",
                                borderRadius: "8px",
                                background: "white",
                                fontSize: "14px",
                                cursor: "pointer",
                            }}
                        >
                            Close
                        </button>
                    </Box>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}