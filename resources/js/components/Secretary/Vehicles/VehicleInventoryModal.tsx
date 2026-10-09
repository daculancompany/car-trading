import {
    Box,
    Button,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    SimpleGrid,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

import {
    ArchiveBoxIcon,
    CheckCircleIcon,
    ClockIcon,
    FunnelIcon,
    WrenchScrewdriverIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline";

import type { Vehicle } from "../../../api/VehicleManagement/vehicleApi";

interface VehicleInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicles: Vehicle[];
}

export default function VehicleInventoryModal({
    isOpen,
    onClose,
    vehicles,
}: VehicleInventoryModalProps) {
    const [brandFilter, setBrandFilter] = useState("");
    const [modelFilter, setModelFilter] = useState("");
    const [variantFilter, setVariantFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // FILTER OPTIONS

    const brands = useMemo(
        () =>
            vehicles
                .filter((vehicle) => vehicle.brand)
                .map((vehicle) => vehicle.brand!)
                .filter(
                    (brand, index, items) =>
                        items.findIndex(
                            (item) => item.id === brand.id
                        ) === index
                ),
        [vehicles]
    );

    const models = useMemo(
        () =>
            vehicles
                .filter(
                    (vehicle) =>
                        vehicle.model &&
                        (!brandFilter ||
                            String(vehicle.brand?.id) === brandFilter)
                )
                .map((vehicle) => vehicle.model!)
                .filter(
                    (model, index, items) =>
                        items.findIndex(
                            (item) => item.id === model.id
                        ) === index
                ),
        [vehicles, brandFilter]
    );

    const variants = useMemo(
        () =>
            vehicles
                .filter(
                    (vehicle) =>
                        vehicle.variant &&
                        (!brandFilter ||
                            String(vehicle.brand?.id) === brandFilter) &&
                        (!modelFilter ||
                            String(vehicle.model?.id) === modelFilter)
                )
                .map((vehicle) => vehicle.variant!)
                .filter(
                    (variant, index, items) =>
                        items.findIndex(
                            (item) => item.id === variant.id
                        ) === index
                ),
        [vehicles, brandFilter, modelFilter]
    );

    // FILTERED VEHICLES

    const filteredVehicles = useMemo(
        () =>
            vehicles.filter(
                (vehicle) =>
                    (!brandFilter ||
                        String(vehicle.brand?.id) === brandFilter) &&
                    (!modelFilter ||
                        String(vehicle.model?.id) === modelFilter) &&
                    (!variantFilter ||
                        String(vehicle.variant?.id) === variantFilter) &&
                    (!statusFilter || vehicle.status === statusFilter)
            ),
        [
            vehicles,
            brandFilter,
            modelFilter,
            variantFilter,
            statusFilter,
        ]
    );

    // CURRENT INVENTORY
    // Sold vehicles are no longer part of current inventory.

    const currentInventoryVehicles = useMemo(
        () =>
            filteredVehicles.filter(
                (vehicle) => vehicle.status !== "sold"
            ),
        [filteredVehicles]
    );

    // STOCK COUNTS

    const totals = useMemo(
        () => ({
            total: currentInventoryVehicles.length,

            available: currentInventoryVehicles.filter(
                (vehicle) => vehicle.status === "available"
            ).length,

            reserved: currentInventoryVehicles.filter(
                (vehicle) => vehicle.status === "reserved"
            ).length,

            maintenance: currentInventoryVehicles.filter(
                (vehicle) => vehicle.status === "maintenance"
            ).length,

            unavailable: currentInventoryVehicles.filter(
                (vehicle) => vehicle.status === "unavailable"
            ).length,

            sold: filteredVehicles.filter(
                (vehicle) => vehicle.status === "sold"
            ).length,
        }),
        [filteredVehicles, currentInventoryVehicles]
    );

    // INVENTORY VALUE
    // Inventory Cost:
    // Sum of purchase prices for current unsold vehicles.
    // Potential Sales Value:
    // Sum of selling prices for current unsold vehicles.

    const inventoryValue = useMemo(() => {
        const potentialSalesValue = currentInventoryVehicles.reduce(
            (total, vehicle) =>
                total + Number(vehicle.selling_price ?? 0),
            0
        );

        return {
            potentialSalesValue,
        };
    }, [currentInventoryVehicles]);

    // CURRENCY FORMAT

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2,
        }).format(value);

    // CLEAR FILTERS

    const clearFilters = () => {
        setBrandFilter("");
        setModelFilter("");
        setVariantFilter("");
        setStatusFilter("");
    };

    const hasFilters = Boolean(
        brandFilter ||
        modelFilter ||
        variantFilter ||
        statusFilter
    );

    // STOCK CARD DATA

    const stockStats = [
        {
            label: "Current Stock",
            value: totals.total,
            description: "Unsold vehicles",
            color: "blue",
            icon: (
                <ArchiveBoxIcon
                    width={20}
                    height={20}
                />
            ),
        },
        {
            label: "Available",
            value: totals.available,
            description: "Ready for sale",
            color: "green",
            icon: (
                <CheckCircleIcon
                    width={20}
                    height={20}
                />
            ),
        },
        {
            label: "Reserved",
            value: totals.reserved,
            description: "Currently reserved",
            color: "yellow",
            icon: (
                <ClockIcon
                    width={20}
                    height={20}
                />
            ),
        },
        {
            label: "Maintenance",
            value: totals.maintenance,
            description: "Under maintenance",
            color: "orange",
            icon: (
                <WrenchScrewdriverIcon
                    width={20}
                    height={20}
                />
            ),
        },
        {
            label: "Sold",
            value: totals.sold,
            description: "Excluded from stock",
            color: "red",
            icon: (
                <XCircleIcon
                    width={20}
                    height={20}
                />
            ),
        },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="5xl"
            isCentered
            scrollBehavior="inside"
        >
            <ModalOverlay bg="blackAlpha.600" />

            <ModalContent
                mx={4}
                rounded="xl"
                overflow="hidden"
                shadow="2xl"
                border="1px solid"
                borderColor="gray.200"
            >
                {/* HEADER */}

                <ModalHeader
                    px={{ base: 5, md: 6 }}
                    py={4}
                    bg="gray.50"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                >
                    <VStack
                        align="start"
                        spacing={1}
                        pr={8}
                    >
                        <Text
                            fontSize="lg"
                            fontWeight="700"
                            color="gray.800"
                        >
                            Vehicle Inventory Overview
                        </Text>

                        <Text
                            fontSize="sm"
                            color="gray.500"
                        >
                            Review current vehicle stock, inventory cost,
                            and potential sales value.
                        </Text>
                    </VStack>
                </ModalHeader>

                <ModalCloseButton
                    top={4}
                    right={4}
                    rounded="md"
                    color="gray.500"
                    _hover={{
                        bg: "gray.200",
                        color: "gray.800",
                    }}
                />

                {/* BODY */}

                <ModalBody
                    px={{ base: 4, md: 6 }}
                    py={5}
                    bg="white"
                >
                    {/* FILTERS */}

                    <Box
                        mb={5}
                        p={{ base: 4, md: 5 }}
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="xl"
                        bg="white"
                    >
                        <Flex
                            align={{ base: "start", md: "center" }}
                            justify="space-between"
                            gap={3}
                            mb={4}
                        >
                            <Flex align="center" gap={2}>
                                <Box
                                    p={2}
                                    bg="gray.100"
                                    color="gray.600"
                                    borderRadius="lg"
                                >
                                    <FunnelIcon
                                        width={18}
                                        height={18}
                                    />
                                </Box>

                                <Box>
                                    <Text
                                        fontSize="sm"
                                        fontWeight="700"
                                        color="gray.800"
                                    >
                                        Inventory Filters
                                    </Text>

                                    <Text
                                        mt={0.5}
                                        fontSize="xs"
                                        color="gray.500"
                                    >
                                        Filter stock and inventory values
                                        by vehicle details.
                                    </Text>
                                </Box>
                            </Flex>

                            {hasFilters && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    color="gray.600"
                                    onClick={clearFilters}
                                    _hover={{
                                        bg: "gray.100",
                                        color: "gray.800",
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </Flex>

                        <SimpleGrid
                            columns={{
                                base: 1,
                                sm: 2,
                                md: 4,
                            }}
                            spacing={3}
                        >
                            {/* BRAND */}

                            <Box>
                                <Text
                                    mb={1.5}
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.600"
                                >
                                    Brand
                                </Text>

                                <Select
                                    size="sm"
                                    placeholder="All Brands"
                                    value={brandFilter}
                                    onChange={(event) => {
                                        setBrandFilter(
                                            event.target.value
                                        );
                                        setModelFilter("");
                                        setVariantFilter("");
                                    }}
                                >
                                    {brands.map((brand) => (
                                        <option
                                            key={brand.id}
                                            value={brand.id}
                                        >
                                            {brand.brand}
                                        </option>
                                    ))}
                                </Select>
                            </Box>

                            {/* MODEL */}

                            <Box>
                                <Text
                                    mb={1.5}
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.600"
                                >
                                    Model
                                </Text>

                                <Select
                                    size="sm"
                                    placeholder="All Models"
                                    value={modelFilter}
                                    onChange={(event) => {
                                        setModelFilter(
                                            event.target.value
                                        );
                                        setVariantFilter("");
                                    }}
                                    isDisabled={!brandFilter}
                                >
                                    {models.map((model) => (
                                        <option
                                            key={model.id}
                                            value={model.id}
                                        >
                                            {model.model}
                                        </option>
                                    ))}
                                </Select>
                            </Box>

                            {/* VARIANT */}

                            <Box>
                                <Text
                                    mb={1.5}
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.600"
                                >
                                    Variant
                                </Text>

                                <Select
                                    size="sm"
                                    placeholder="All Variants"
                                    value={variantFilter}
                                    onChange={(event) =>
                                        setVariantFilter(
                                            event.target.value
                                        )
                                    }
                                    isDisabled={!modelFilter}
                                >
                                    {variants.map((variant) => (
                                        <option
                                            key={variant.id}
                                            value={variant.id}
                                        >
                                            {variant.variant}
                                        </option>
                                    ))}
                                </Select>
                            </Box>

                            {/* STATUS */}

                            <Box>
                                <Text
                                    mb={1.5}
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.600"
                                >
                                    Status
                                </Text>

                                <Select
                                    size="sm"
                                    placeholder="All Statuses"
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="available">
                                        Available
                                    </option>

                                    <option value="reserved">
                                        Reserved
                                    </option>

                                    <option value="maintenance">
                                        Maintenance
                                    </option>

                                    <option value="unavailable">
                                        Unavailable
                                    </option>

                                    <option value="sold">
                                        Sold
                                    </option>
                                </Select>
                            </Box>
                        </SimpleGrid>
                    </Box>

                    {/* STOCK COUNTS */}

                    <Flex
                        align={{ base: "start", md: "center" }}
                        justify="space-between"
                        direction={{
                            base: "column",
                            md: "row",
                        }}
                        gap={2}
                        mb={3}
                    >
                        <Box>
                            <Text
                                fontSize="sm"
                                fontWeight="700"
                                color="gray.800"
                            >
                                Stock Counts
                            </Text>

                            <Text
                                mt={0.5}
                                fontSize="xs"
                                color="gray.500"
                            >
                                Current vehicle inventory status.
                            </Text>
                        </Box>

                        <Text
                            fontSize="xs"
                            fontWeight="600"
                            color="gray.500"
                        >
                            {currentInventoryVehicles.length}{" "}
                            {currentInventoryVehicles.length === 1
                                ? "vehicle"
                                : "vehicles"}{" "}
                            in stock
                        </Text>
                    </Flex>

                    <SimpleGrid
                        columns={{
                            base: 1,
                            sm: 2,
                            md: 5,
                        }}
                        spacing={3}
                        mb={6}
                    >
                        {stockStats.map((stat) => (
                            <Box
                                key={stat.label}
                                p={4}
                                bg="white"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="xl"
                                transition="all 0.15s ease"
                                _hover={{
                                    borderColor: `${stat.color}.200`,
                                    shadow: "sm",
                                }}
                            >
                                <Flex
                                    align="center"
                                    justify="space-between"
                                    mb={3}
                                >
                                    <Box
                                        p={2}
                                        bg={`${stat.color}.50`}
                                        color={`${stat.color}.600`}
                                        borderRadius="lg"
                                    >
                                        {stat.icon}
                                    </Box>

                                    <Text
                                        fontSize="2xl"
                                        lineHeight="1"
                                        fontWeight="800"
                                        color={`${stat.color}.700`}
                                    >
                                        {stat.value}
                                    </Text>
                                </Flex>

                                <Text
                                    fontSize="sm"
                                    fontWeight="700"
                                    color="gray.800"
                                >
                                    {stat.label}
                                </Text>

                                <Text
                                    mt={1}
                                    fontSize="xs"
                                    color="gray.500"
                                >
                                    {stat.description}
                                </Text>
                            </Box>
                        ))}
                    </SimpleGrid>

                    {/* INVENTORY VALUE */}

                    <Flex
                        align={{ base: "start", md: "center" }}
                        justify="space-between"
                        direction={{
                            base: "column",
                            md: "row",
                        }}
                        gap={2}
                        mb={3}
                    >
                        <Box>
                            <Text
                                fontSize="sm"
                                fontWeight="700"
                                color="gray.800"
                            >
                                Inventory Value
                            </Text>

                            <Text
                                mt={0.5}
                                fontSize="xs"
                                color="gray.500"
                            >
                                Financial value of current unsold
                                vehicle stock.
                            </Text>
                        </Box>
                    </Flex>

                    <SimpleGrid
                        columns={{
                            base: 1,
                            md: 1,
                        }}
                        spacing={3}
                    >
                        <Box
                            p={5}
                            bg="green.50"
                            border="1px solid"
                            borderColor="green.100"
                            borderRadius="xl"
                        >
                            <Flex
                                align="center"
                                gap={2}
                                color="green.600"
                                mb={3}
                            >
                                <CheckCircleIcon
                                    width={20}
                                    height={20}
                                />

                                <Text
                                    fontSize="xs"
                                    fontWeight="700"
                                    textTransform="uppercase"
                                    letterSpacing="0.04em"
                                >
                                    Potential Sales Value
                                </Text>
                            </Flex>

                            <Text
                                fontSize={{ base: "xl", md: "2xl" }}
                                fontWeight="800"
                                color="green.800"
                            >
                                {formatCurrency(
                                    inventoryValue.potentialSalesValue
                                )}
                            </Text>

                            <Text
                                mt={1}
                                fontSize="xs"
                                color="green.700"
                            >
                                Total selling price of current inventory.
                            </Text>
                        </Box>
                    </SimpleGrid>

                    {/* EMPTY RESULT */}

                    {filteredVehicles.length === 0 && (
                        <Box
                            mt={4}
                            p={8}
                            textAlign="center"
                            border="1px dashed"
                            borderColor="gray.300"
                            borderRadius="xl"
                            bg="gray.50"
                        >
                            <ArchiveBoxIcon
                                width={28}
                                height={28}
                                style={{
                                    margin: "0 auto",
                                }}
                            />

                            <Text
                                mt={3}
                                fontSize="sm"
                                fontWeight="700"
                                color="gray.700"
                            >
                                No vehicles found
                            </Text>

                            <Text
                                mt={1}
                                fontSize="xs"
                                color="gray.500"
                            >
                                Try adjusting your inventory filters.
                            </Text>

                            {hasFilters && (
                                <Button
                                    mt={4}
                                    size="sm"
                                    variant="outline"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </Box>
                    )}
                </ModalBody>

                {/* FOOTER */}

                <ModalFooter
                    px={{ base: 4, md: 6 }}
                    py={4}
                    bg="gray.50"
                    borderTop="1px solid"
                    borderColor="gray.200"
                >
                    <Button
                        size="sm"
                        variant="outline"
                        rounded="lg"
                        borderColor="gray.300"
                        color="gray.700"
                        onClick={onClose}
                        _hover={{
                            bg: "gray.100",
                            borderColor: "gray.400",
                        }}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}