import {
    Badge,
    Flex,
    Image,
    Link,
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
    stockMovementType,
    type StockMovement,
} from "../../../api/PartManagement/stockMovementApi";
import DetailsLink from "../../Shared/Details/DetailsLink";

interface StockMovementTableProps {
    movements: StockMovement[];
    loading?: boolean;
    showPart?: boolean;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const formatDate = (value: string) =>
    new Date(value).toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

export default function StockMovementTable({
    movements,
    loading = false,
    showPart = true,
}: StockMovementTableProps) {
    if (loading) {
        return (
            <Flex justify="center" align="center" minH="200px">
                <Spinner size="md" color="blue.500" />
            </Flex>
        );
    }

    const columns = showPart ? 11 : 10;

    return (
        <TableContainer overflowX="auto" border="1px" borderColor="gray.100" borderRadius="md" bg="white">
            <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                    <Tr>
                        <Th py={3} fontSize="xs">Date</Th>
                        {showPart && <Th py={3} fontSize="xs">Part</Th>}
                        <Th py={3} fontSize="xs">Type</Th>
                        <Th py={3} fontSize="xs" isNumeric>Unit Cost</Th>
                        <Th py={3} fontSize="xs" isNumeric>Qty</Th>
                        <Th py={3} fontSize="xs" isNumeric>Amount</Th>
                        <Th py={3} fontSize="xs" textAlign="center">Prev → New Qty</Th>
                        <Th py={3} fontSize="xs">Ref No.</Th>
                        <Th py={3} fontSize="xs">By</Th>
                        <Th py={3} fontSize="xs">Remarks</Th>
                        <Th py={3} fontSize="xs">Photo</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {movements.length === 0 ? (
                        <Tr>
                            <Td colSpan={columns} textAlign="center" py={8}>
                                <Text fontSize="sm" color="gray.500">
                                    No stock movements found.
                                </Text>
                            </Td>
                        </Tr>
                    ) : (
                        movements.map((movement) => {
                            const type = stockMovementType(movement.type);

                            return (
                                <Tr key={movement.id}>
                                    <Td py={3} whiteSpace="nowrap" color="gray.600">
                                        {formatDate(movement.moved_at)}
                                    </Td>

                                    {showPart && (
                                        <Td py={3} fontWeight="medium" color="gray.700">
                                            <DetailsLink type="part" id={movement.vehicle_part_id}>
                                                {movement.vehicle_part?.part_name ?? "—"}
                                            </DetailsLink>
                                        </Td>
                                    )}

                                    <Td py={3}>
                                        <Badge colorScheme={type.color} borderRadius="full" px={2.5} py={1} fontSize="xs">
                                            {type.label}
                                        </Badge>
                                    </Td>

                                    <Td py={3} isNumeric whiteSpace="nowrap">
                                        {formatCurrency(Number(movement.unit_cost))}
                                    </Td>

                                    <Td
                                        py={3}
                                        isNumeric
                                        fontWeight="semibold"
                                        color={type.incoming ? "green.600" : "red.600"}
                                    >
                                        {type.incoming ? "+" : "−"}
                                        {movement.quantity}
                                    </Td>

                                    <Td py={3} isNumeric whiteSpace="nowrap">
                                        {formatCurrency(Number(movement.amount))}
                                    </Td>

                                    <Td py={3} textAlign="center" whiteSpace="nowrap">
                                        {movement.previous_quantity} → <b>{movement.new_quantity}</b>
                                    </Td>

                                    <Td py={3} whiteSpace="nowrap">
                                        {movement.reference_no && movement.job_order_id ? (
                                            <DetailsLink type="jobOrder" id={movement.job_order_id} fontSize="sm" fontWeight="600" color="purple.600">
                                                {movement.reference_no}
                                            </DetailsLink>
                                        ) : movement.reference_no ? (
                                            <Badge
                                                variant="subtle"
                                                colorScheme={movement.job_order_id ? "purple" : "gray"}
                                            >
                                                {movement.job_order_id ? "JO " : ""}
                                                {movement.reference_no}
                                            </Badge>
                                        ) : (
                                            <Text color="gray.400">—</Text>
                                        )}
                                    </Td>

                                    <Td py={3} color="gray.600">
                                        {movement.creator?.username ?? "—"}
                                    </Td>

                                    <Td py={3} color="gray.600" maxW="220px" whiteSpace="normal">
                                        {movement.remarks ?? "—"}
                                    </Td>

                                    <Td py={3}>
                                        {movement.image_url ? (
                                            <Link href={movement.image_url} isExternal>
                                                <Image
                                                    src={movement.image_url}
                                                    alt="Damage photo"
                                                    w="40px"
                                                    h="40px"
                                                    objectFit="cover"
                                                    borderRadius="md"
                                                    border="1px"
                                                    borderColor="gray.200"
                                                />
                                            </Link>
                                        ) : (
                                            <Text color="gray.400">—</Text>
                                        )}
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
