import {
    Badge,
    Box,
    Flex,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    Text,
} from "@chakra-ui/react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import type { VehiclePart } from "../../../api/PartManagement/vehiclePartsApi";
import { getStockMovements, type StockMovement } from "../../../api/PartManagement/stockMovementApi";
import StockMovementTable from "../../Admin/Vehicleparts/StockMovementTable";

interface PartDetailsModalProps {
    part: VehiclePart | null;
    isOpen: boolean;
    onClose: () => void;
}

const peso = (value: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value || 0);

const stockStatus = (quantity: number) => {
    if (quantity <= 0) return { color: "red", label: "Out of Stock" };
    if (quantity <= 5) return { color: "orange", label: "Low Stock" };
    return { color: "green", label: "In Stock" };
};

export default function PartDetailsModal({ part, isOpen, onClose }: PartDetailsModalProps) {
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !part) return;

        let cancelled = false;
        setLoading(true);

        getStockMovements({ vehicle_part_id: part.id })
            .then((data) => !cancelled && setMovements(data))
            .catch(() => !cancelled && setMovements([]))
            .finally(() => !cancelled && setLoading(false));

        return () => {
            cancelled = true;
        };
    }, [isOpen, part]);

    if (!part) return null;

    const status = stockStatus(part.quantity);
    const unitPrice = Number(part.unit_price) || 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent borderRadius="xl">
                <ModalHeader>Part Details</ModalHeader>
                <ModalCloseButton />

                <ModalBody pb={6}>
                    <Flex gap={5} direction={{ base: "column", md: "row" }} mb={6}>
                        <Box
                            w={{ base: "100%", md: "160px" }}
                            h="160px"
                            flexShrink={0}
                            borderRadius="lg"
                            bg="gray.50"
                            border="1px"
                            borderColor="gray.100"
                            overflow="hidden"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            {part.image_url ? (
                                <Image src={part.image_url} alt={part.part_name} w="100%" h="100%" objectFit="cover" />
                            ) : (
                                <PhotoIcon width={40} height={40} color="#CBD5E0" />
                            )}
                        </Box>

                        <Box flex="1">
                            <Flex align="center" gap={3} wrap="wrap">
                                <Text fontSize="xl" fontWeight="700" color="dark.900">
                                    {part.part_name}
                                </Text>
                                <Badge colorScheme={status.color} borderRadius="full" px={2.5}>
                                    {status.label}
                                </Badge>
                                {part.archived && <Badge colorScheme="gray">Archived</Badge>}
                            </Flex>
                            <Text color="gray.500" fontSize="sm" mt={1}>
                                {part.category}
                            </Text>

                            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} mt={4}>
                                {[
                                    { label: "Qty on Hand", value: part.quantity.toLocaleString(), color: "blue" },
                                    { label: "Unit Price", value: peso(unitPrice), color: "teal" },
                                    { label: "Stock Value", value: peso(unitPrice * part.quantity), color: "green" },
                                ].map((card) => (
                                    <Box key={card.label} bg={`${card.color}.50`} border="1px" borderColor={`${card.color}.100`} borderRadius="lg" px={4} py={3}>
                                        <Text fontSize="2xs" fontWeight="700" color={`${card.color}.600`} textTransform="uppercase">
                                            {card.label}
                                        </Text>
                                        <Text fontSize="lg" fontWeight="800" color={`${card.color}.700`}>
                                            {card.value}
                                        </Text>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Box>
                    </Flex>

                    <Text fontWeight="700" mb={3}>
                        Stock Ledger
                    </Text>
                    <StockMovementTable movements={movements} loading={loading} showPart={false} />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
