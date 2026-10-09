import React, { useEffect, useState } from "react";
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, Input, Text, Box, SimpleGrid, VStack, HStack,
} from "@chakra-ui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createSale } from "../../../api/SaleManagement/saleApi";
import type { Reservation } from "../../../api/SaleManagement/saleApi";

interface CreateSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: Reservation | null;
    onCreated?: () => void;
}

const CreateSaleModal: React.FC<CreateSaleModalProps> = ({
    isOpen,
    onClose,
    reservation,
    onCreated,
}) => {
    const [discountAmount, setDiscountAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setDiscountAmount("");
            setError("");
        }
    }, [isOpen, reservation]);

    if (!reservation) return null;

    const vehicle = reservation.vehicle;
    const sellingPrice = Number(vehicle?.selling_price ?? 0);
    const discount = Number(discountAmount) || 0;
    const totalPayment = Math.max(sellingPrice - discount, 0);

    const handleCreateSale = async () => {
        if (sellingPrice <= 0) {
            setError("Vehicle selling price is invalid.");
            return;
        }

        if (discount < 0) {
            setError("Discount amount cannot be negative.");
            return;
        }

        if (discount > sellingPrice) {
            setError("Discount cannot be greater than the selling price.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await createSale({
                reservation_id: reservation.id,
                discount_amount: discount,
            });

            onCreated?.();
            onClose();
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "Failed to create sale."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
            <ModalOverlay bg="blackAlpha.600" />

            <ModalContent borderRadius="xl" overflow="hidden">
                <ModalHeader borderBottomWidth="1px">
                    <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                            <Text fontSize="lg" fontWeight="700">
                                Create Sale
                            </Text>

                            <Text fontSize="sm" color="gray.500" fontWeight="400">
                                Review the vehicle price and enter the discount.
                            </Text>
                        </VStack>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            minW="auto"
                            p={1}
                        >
                            <XMarkIcon width={20} />
                        </Button>
                    </HStack>
                </ModalHeader>

                <ModalBody py={6}>
                    <VStack spacing={5} align="stretch">

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>
                                    Brand
                                </Text>
                                <Text fontWeight="600">
                                    {vehicle?.brand?.brand || "N/A"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>
                                    Model
                                </Text>
                                <Text fontWeight="600">
                                    {vehicle?.model?.model || "N/A"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>
                                    Variant
                                </Text>
                                <Text fontWeight="600">
                                    {vehicle?.variant?.variant || "N/A"}
                                </Text>
                            </Box>
                        </SimpleGrid>

                        <Box
                            p={4}
                            bg="gray.50"
                            borderRadius="lg"
                            borderWidth="1px"
                        >
                            <Text fontSize="xs" color="gray.500" mb={1}>
                                Vehicle Selling Price
                            </Text>

                            <Text fontSize="xl" fontWeight="700">
                                ₱{sellingPrice.toLocaleString("en-PH", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </Text>
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="600" mb={2}>
                                Discount Amount
                            </Text>

                            <Input
                                type="number"
                                value={discountAmount}
                                onChange={(e) => setDiscountAmount(e.target.value)}
                                placeholder="Enter discount amount"
                                min={0}
                            />
                        </Box>

                        <Box
                            p={4}
                            bg="red.50"
                            borderRadius="lg"
                            borderWidth="1px"
                            borderColor="red.100"
                        >
                            <HStack justify="space-between">
                                <Text fontWeight="600">
                                    Total Payment
                                </Text>

                                <Text
                                    fontSize="xl"
                                    fontWeight="800"
                                    color="red.600"
                                >
                                    ₱{totalPayment.toLocaleString("en-PH", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </Text>
                            </HStack>
                        </Box>

                        {error && (
                            <Box
                                p={3}
                                bg="red.50"
                                borderRadius="md"
                                borderWidth="1px"
                                borderColor="red.200"
                            >
                                <Text fontSize="sm" color="red.600">
                                    {error}
                                </Text>
                            </Box>
                        )}

                    </VStack>
                </ModalBody>

                <ModalFooter borderTopWidth="1px">
                    <HStack spacing={3}>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            isDisabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button
                            colorScheme="red"
                            onClick={handleCreateSale}
                            isLoading={loading}
                        >
                            Create Sale
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateSaleModal;