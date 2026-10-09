import {
    Badge,
    Box,
    Button,
    Flex,
    Image,
    Spinner,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
import {
    ArchiveBoxIcon,
    ArrowsRightLeftIcon,
    ClockIcon,
    PencilSquareIcon,
    PhotoIcon,
} from "@heroicons/react/24/outline";
import type { VehiclePart } from "../../../api/PartManagement/vehiclePartsApi";
import DetailsLink from "../../Shared/Details/DetailsLink";

export const LOW_STOCK = 5;

interface VehiclePartsTableProps {
    parts: VehiclePart[];
    loading?: boolean;
    onEdit: (part: VehiclePart) => void;
    onStock: (part: VehiclePart) => void;
    onLedger: (part: VehiclePart) => void;
    onArchive: (part: VehiclePart) => void;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const stockBadge = (quantity: number) => {
    if (quantity <= 0) return { color: "red", label: "Out of Stock" };
    if (quantity <= LOW_STOCK) return { color: "orange", label: "Low Stock" };
    return { color: "green", label: "In Stock" };
};

export default function VehiclePartsTable({
    parts,
    loading = false,
    onEdit,
    onStock,
    onLedger,
    onArchive,
}: VehiclePartsTableProps) {
    if (loading) {
        return (
            <Flex justify="center" align="center" minH="200px">
                <Spinner size="md" color="blue.500" />
            </Flex>
        );
    }

    return (
        <TableContainer overflowX="auto" border="1px" borderColor="gray.100" borderRadius="md" bg="white">
            <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                    <Tr>
                        <Th py={3} fontSize="xs">Part</Th>
                        <Th py={3} fontSize="xs">Category</Th>
                        <Th py={3} fontSize="xs" textAlign="center">Qty on Hand</Th>
                        <Th py={3} fontSize="xs" isNumeric>Unit Price</Th>
                        <Th py={3} fontSize="xs" isNumeric>Stock Value</Th>
                        <Th py={3} fontSize="xs" textAlign="center">Status</Th>
                        <Th py={3} fontSize="xs" textAlign="center">Actions</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {parts.length === 0 ? (
                        <Tr>
                            <Td colSpan={7} textAlign="center" py={8}>
                                <Text fontSize="sm" color="gray.500">
                                    No vehicle parts found.
                                </Text>
                            </Td>
                        </Tr>
                    ) : (
                        parts.map((part) => {
                            const badge = stockBadge(part.quantity);

                            return (
                                <Tr key={part.id}>
                                    <Td py={3}>
                                        <Flex align="center" gap={3}>
                                            <Box
                                                w="44px"
                                                h="44px"
                                                flexShrink={0}
                                                borderRadius="md"
                                                bg="gray.50"
                                                border="1px"
                                                borderColor="gray.100"
                                                overflow="hidden"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                {part.image_url ? (
                                                    <Image
                                                        src={part.image_url}
                                                        alt={part.part_name}
                                                        w="100%"
                                                        h="100%"
                                                        objectFit="cover"
                                                    />
                                                ) : (
                                                    <PhotoIcon width={20} height={20} color="#CBD5E0" />
                                                )}
                                            </Box>

                                            <DetailsLink type="part" id={part.id} fontWeight="medium" color="gray.700">
                                                {part.part_name}
                                            </DetailsLink>
                                        </Flex>
                                    </Td>

                                    <Td py={3} color="gray.600">{part.category}</Td>

                                    <Td py={3} textAlign="center" fontWeight="semibold">
                                        {part.quantity}
                                    </Td>

                                    <Td py={3} isNumeric whiteSpace="nowrap">
                                        {formatCurrency(Number(part.unit_price) || 0)}
                                    </Td>

                                    <Td py={3} isNumeric whiteSpace="nowrap">
                                        {formatCurrency(part.quantity * (Number(part.unit_price) || 0))}
                                    </Td>

                                    <Td py={3} textAlign="center">
                                        <Badge colorScheme={badge.color} borderRadius="full" px={2.5} py={1} fontSize="xs">
                                            {badge.label}
                                        </Badge>
                                    </Td>

                                    <Td py={3}>
                                        <Flex justify="center" gap={2}>
                                            <Button
                                                size="xs"
                                                colorScheme="green"
                                                variant="outline"
                                                leftIcon={<ArrowsRightLeftIcon width={14} height={14} />}
                                                onClick={() => onStock(part)}
                                            >
                                                Stock
                                            </Button>

                                            <Button
                                                size="xs"
                                                variant="outline"
                                                leftIcon={<ClockIcon width={14} height={14} />}
                                                onClick={() => onLedger(part)}
                                            >
                                                Ledger
                                            </Button>

                                            <Button
                                                size="xs"
                                                variant="outline"
                                                colorScheme="blue"
                                                leftIcon={<PencilSquareIcon width={14} height={14} />}
                                                onClick={() => onEdit(part)}
                                            >
                                                Edit
                                            </Button>

                                            <Button
                                                size="xs"
                                                variant="outline"
                                                colorScheme="red"
                                                leftIcon={<ArchiveBoxIcon width={14} height={14} />}
                                                onClick={() => onArchive(part)}
                                            >
                                                Archive
                                            </Button>
                                        </Flex>
                                    </Td>
                                </Tr>
                            );
                        })
                    )}
                </Tbody>
            </Table>
        </TableContainer>
    );
}
