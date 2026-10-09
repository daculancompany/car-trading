import {
    Badge,
    Box,
    Button,
    CloseButton,
    Flex,
    HStack,
    Image,
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
    Tr,
    useDisclosure,
} from "@chakra-ui/react";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

import type { Vehicle } from "../../../api/VehicleManagement/vehicleApi";
import { MAX_COMPARE } from "./compare";
import { inspectionColor, monthlyPayment, peso } from "./loan";

interface Props {
    vehicles: Vehicle[];
    ids: number[];
    onToggle: (id: number) => void;
    onClear: () => void;
}

const titleOf = (vehicle: Vehicle) => [vehicle.year_model, vehicle.brand?.brand, vehicle.model?.model].filter(Boolean).join(" ");

const words = (value?: string | null) => (value ? value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ") : "—");

export default function CompareTray({ vehicles, ids, onToggle, onClear }: Props) {
    const modal = useDisclosure();
    const selected = ids.map((id) => vehicles.find((vehicle) => vehicle.id === id)).filter(Boolean) as Vehicle[];

    if (selected.length === 0) return null;

    const prices = selected.map((vehicle) => Number(vehicle.selling_price) || 0);
    const mileages = selected.map((vehicle) => Number(vehicle.specs?.mileage ?? Infinity));
    const years = selected.map((vehicle) => Number(vehicle.year_model) || 0);
    const scores = selected.map((vehicle) => vehicle.inspection_badge?.score ?? -1);
    const best = (values: number[], mode: "min" | "max") => (mode === "min" ? Math.min(...values) : Math.max(...values));

    const rows: { label: string; render: (vehicle: Vehicle, index: number) => ReactNode }[] = [
        {
            label: "Cash price",
            render: (_vehicle, index) => (
                <Text fontWeight="800" color={prices[index] === best(prices, "min") && selected.length > 1 ? "green.600" : "brand.600"}>
                    {peso(prices[index])}
                </Text>
            ),
        },
        { label: "Reservation fee", render: (vehicle) => peso(Number(vehicle.reservation_price) || 0) },
        { label: "Est. monthly (20% down, 5 yrs)", render: (vehicle) => `${peso(monthlyPayment(Number(vehicle.selling_price) || 0))}/mo` },
        { label: "Year", render: (vehicle, index) => <Text fontWeight={years[index] === best(years, "max") && selected.length > 1 ? "800" : "500"}>{vehicle.year_model ?? "—"}</Text> },
        {
            label: "Mileage",
            render: (vehicle, index) => (
                <Text fontWeight={mileages[index] === best(mileages, "min") && selected.length > 1 ? "800" : "500"}>
                    {vehicle.specs?.mileage != null ? `${Number(vehicle.specs.mileage).toLocaleString("en-PH")} km` : "—"}
                </Text>
            ),
        },
        { label: "Transmission", render: (vehicle) => words(vehicle.specs?.transmission) },
        { label: "Fuel", render: (vehicle) => words(vehicle.specs?.fuel_type) },
        { label: "Variant", render: (vehicle) => vehicle.variant?.variant ?? "—" },
        { label: "Color", render: (vehicle) => vehicle.color ?? "—" },
        {
            label: "Inspection",
            render: (vehicle, index) =>
                vehicle.inspection_badge?.score != null ? (
                    <Badge colorScheme={inspectionColor(vehicle.inspection_badge.score)} fontSize="sm" variant={scores[index] === best(scores, "max") && selected.length > 1 ? "solid" : "subtle"}>
                        {vehicle.inspection_badge.score}%
                    </Badge>
                ) : (
                    <Text color="gray.400">Not yet</Text>
                ),
        },
    ];

    return (
        <>
            <Box position="fixed" bottom={{ base: 3, md: 5 }} left="50%" transform="translateX(-50%)" zIndex={1500} w={{ base: "calc(100% - 24px)", md: "auto" }}>
                <Flex bg="dark.800" color="white" borderRadius="xl" boxShadow="2xl" px={3} py={2.5} align="center" gap={3}>
                    <HStack spacing={2} flex="1" overflowX="auto">
                        {selected.map((vehicle) => (
                            <HStack key={vehicle.id} spacing={2} bg="whiteAlpha.200" borderRadius="lg" pl={1} pr={1} py={1} flexShrink={0}>
                                <Image src={vehicle.images?.[0]?.image_path ? `/storage/${vehicle.images[0].image_path}` : undefined} alt="" boxSize="32px" objectFit="cover" borderRadius="md" bg="gray.600" />
                                <Text fontSize="xs" fontWeight="700" color="white" maxW="120px" noOfLines={1}>
                                    {vehicle.brand?.brand} {vehicle.model?.model}
                                </Text>
                                <CloseButton size="sm" onClick={() => onToggle(vehicle.id)} />
                            </HStack>
                        ))}
                        {selected.length < MAX_COMPARE && (
                            <Text fontSize="xs" color="gray.300" flexShrink={0} display={{ base: "none", md: "block" }}>
                                Add up to {MAX_COMPARE - selected.length} more
                            </Text>
                        )}
                    </HStack>
                    <Button size="sm" variant="ghost" color="gray.200" _hover={{ bg: "whiteAlpha.200" }} onClick={onClear}>
                        Clear
                    </Button>
                    <Button size="sm" colorScheme="brand" leftIcon={<ArrowsRightLeftIcon width={16} />} onClick={modal.onOpen} isDisabled={selected.length < 2}>
                        Compare
                    </Button>
                </Flex>
            </Box>

            <Modal isOpen={modal.isOpen} onClose={modal.onClose} size="5xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent borderRadius="xl" mx={3}>
                    <ModalHeader>Compare vehicles</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6} overflowX="auto">
                        <Table size="sm" minW={`${180 + selected.length * 220}px`}>
                            <Thead>
                                <Tr>
                                    <Th w="180px" />
                                    {selected.map((vehicle) => (
                                        <Th key={vehicle.id} textTransform="none" letterSpacing="normal" verticalAlign="top">
                                            <Image src={vehicle.images?.[0]?.image_path ? `/storage/${vehicle.images[0].image_path}` : undefined} alt="" w="full" h="120px" objectFit="cover" borderRadius="lg" bg="gray.100" mb={2} />
                                            <Text fontSize="sm" fontWeight="800" color="gray.900">
                                                {titleOf(vehicle)}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500" fontWeight="500">
                                                {vehicle.stock_no}
                                            </Text>
                                        </Th>
                                    ))}
                                </Tr>
                            </Thead>
                            <Tbody>
                                {rows.map((row) => (
                                    <Tr key={row.label}>
                                        <Td color="gray.500" fontSize="sm" fontWeight="600">
                                            {row.label}
                                        </Td>
                                        {selected.map((vehicle, index) => (
                                            <Td key={vehicle.id} fontSize="sm">
                                                {row.render(vehicle, index)}
                                            </Td>
                                        ))}
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                        <Text fontSize="xs" color="gray.500" mt={3}>
                            Bold or green values are the best among the selected cars.
                        </Text>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}
