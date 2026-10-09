import {
    Box,
    Button,
    Flex,
    Heading,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Select,
    SimpleGrid,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import {
    ArrowsRightLeftIcon,
    MagnifyingGlassIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";

import PageHeader from "../../components/Admin/Dashboard/DashboardPageHeader";
import VehiclePartsTable, { LOW_STOCK } from "../../components/Admin/Vehicleparts/VehiclePartsTable";
import VehiclePartFormModal from "../../components/Admin/Vehicleparts/VehiclePartFormModal";
import StockMovementModal from "../../components/Admin/Vehicleparts/StockMovementModal";
import StockMovementTable from "../../components/Admin/Vehicleparts/StockMovementTable";

import {
    archiveVehiclePart,
    getVehicleParts,
    type VehiclePart,
} from "../../api/PartManagement/vehiclePartsApi";
import {
    getStockMovements,
    STOCK_MOVEMENT_TYPES,
    type StockMovement,
    type StockMovementType,
} from "../../api/PartManagement/stockMovementApi";

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const inputStyle = {
    size: "sm",
    bg: "white",
    borderColor: "gray.300",
    rounded: "md",
} as const;

export default function VehiclePartsPage() {
    const toast = useToast();

    const [parts, setParts] = useState<VehiclePart[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [loadingParts, setLoadingParts] = useState(false);
    const [loadingMovements, setLoadingMovements] = useState(false);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [stockFilter, setStockFilter] = useState("");

    const [ledgerPart, setLedgerPart] = useState("");
    const [ledgerType, setLedgerType] = useState<StockMovementType | "">("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [selectedPart, setSelectedPart] = useState<VehiclePart | null>(null);
    const [partLedger, setPartLedger] = useState<StockMovement[]>([]);
    const [loadingPartLedger, setLoadingPartLedger] = useState(false);

    const formModal = useDisclosure();
    const stockModal = useDisclosure();
    const ledgerModal = useDisclosure();

    const loadParts = useCallback(async () => {
        try {
            setLoadingParts(true);
            setParts(await getVehicleParts());
        } catch (error) {
            console.error("Failed to load vehicle parts:", error);
            toast({ title: "Failed to load vehicle parts.", status: "error", duration: 3000 });
        } finally {
            setLoadingParts(false);
        }
    }, [toast]);

    const loadMovements = useCallback(async () => {
        try {
            setLoadingMovements(true);
            setMovements(
                await getStockMovements({
                    vehicle_part_id: ledgerPart ? Number(ledgerPart) : undefined,
                    type: ledgerType,
                    from: fromDate,
                    to: toDate,
                })
            );
        } catch (error) {
            console.error("Failed to load stock movements:", error);
            toast({ title: "Failed to load stock movements.", status: "error", duration: 3000 });
        } finally {
            setLoadingMovements(false);
        }
    }, [ledgerPart, ledgerType, fromDate, toDate, toast]);

    useEffect(() => {
        loadParts();
    }, [loadParts]);

    useEffect(() => {
        loadMovements();
    }, [loadMovements]);

    const reloadAll = () => {
        loadParts();
        loadMovements();
    };

    const categories = useMemo(
        () => Array.from(new Set(parts.map((part) => part.category).filter(Boolean))).sort(),
        [parts]
    );

    const filteredParts = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return parts.filter((part) => {
            const matchesSearch =
                !keyword ||
                part.part_name.toLowerCase().includes(keyword) ||
                part.category.toLowerCase().includes(keyword);

            const matchesCategory = !category || part.category === category;

            const matchesStock =
                !stockFilter ||
                (stockFilter === "out" && part.quantity <= 0) ||
                (stockFilter === "low" && part.quantity > 0 && part.quantity <= LOW_STOCK) ||
                (stockFilter === "in" && part.quantity > LOW_STOCK);

            return matchesSearch && matchesCategory && matchesStock;
        });
    }, [parts, search, category, stockFilter]);

    const summary = useMemo(() => {
        const totalQuantity = parts.reduce((total, part) => total + Number(part.quantity || 0), 0);
        const stockValue = parts.reduce(
            (total, part) => total + Number(part.quantity || 0) * Number(part.unit_price || 0),
            0
        );
        const lowStock = parts.filter((part) => part.quantity <= LOW_STOCK).length;

        return { totalQuantity, stockValue, lowStock };
    }, [parts]);

    const openAdd = () => {
        setSelectedPart(null);
        formModal.onOpen();
    };

    const openEdit = (part: VehiclePart) => {
        setSelectedPart(part);
        formModal.onOpen();
    };

    const openStock = (part: VehiclePart | null) => {
        setSelectedPart(part);
        stockModal.onOpen();
    };

    const openLedger = async (part: VehiclePart) => {
        setSelectedPart(part);
        setPartLedger([]);
        ledgerModal.onOpen();

        try {
            setLoadingPartLedger(true);
            setPartLedger(await getStockMovements({ vehicle_part_id: part.id }));
        } catch {
            setPartLedger([]);
        } finally {
            setLoadingPartLedger(false);
        }
    };

    const handleArchive = async (part: VehiclePart) => {
        if (!window.confirm(`Are you sure you want to archive "${part.part_name}"?`)) {
            return;
        }

        try {
            await archiveVehiclePart(part.id);
            toast({ title: `${part.part_name} archived.`, status: "success", duration: 3000 });
            loadParts();
        } catch (error: any) {
            toast({
                title: "Failed to archive vehicle part.",
                description: error?.response?.data?.message || "Something went wrong. Please try again.",
                status: "error",
                duration: 4000,
            });
        }
    };

    return (
        <>
            <PageHeader
                title="Vehicle Parts"
                subtitle="Parts inventory: receiving, stock in and out, damage and the stock ledger."
                onRefresh={reloadAll}
                refreshing={loadingParts || loadingMovements}
            />

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4}>
                <Box layerStyle="panel" px={5} py={4}>
                    <Text fontSize="xs" fontWeight="medium" color="blue.600" textTransform="uppercase" letterSpacing="wide">
                        Total Quantity
                    </Text>
                    <Heading size="md" mt={1} color="blue.700">
                        {summary.totalQuantity.toLocaleString()}
                    </Heading>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                        {parts.length} parts in inventory
                    </Text>
                </Box>

                <Box layerStyle="panel" px={5} py={4}>
                    <Text fontSize="xs" fontWeight="medium" color="green.600" textTransform="uppercase" letterSpacing="wide">
                        Stock Value
                    </Text>
                    <Heading size="md" mt={1} color="green.700">
                        {formatCurrency(summary.stockValue)}
                    </Heading>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                        Quantity × unit price
                    </Text>
                </Box>

                <Box layerStyle="panel" px={5} py={4}>
                    <Text fontSize="xs" fontWeight="medium" color="orange.600" textTransform="uppercase" letterSpacing="wide">
                        Low / Out of Stock
                    </Text>
                    <Heading size="md" mt={1} color="orange.700">
                        {summary.lowStock}
                    </Heading>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                        Parts with {LOW_STOCK} or fewer on hand
                    </Text>
                </Box>
            </SimpleGrid>

            <Box layerStyle="panel" mt={4} px={{ base: 4, md: 5 }} py={4}>
                <Tabs colorScheme="brand" isLazy>
                    <Flex
                        direction={{ base: "column", md: "row" }}
                        justify="space-between"
                        align={{ base: "stretch", md: "center" }}
                        gap={3}
                    >
                        <TabList borderBottom="none">
                            <Tab fontSize="sm">Parts</Tab>
                            <Tab fontSize="sm">Stock Ledger</Tab>
                        </TabList>

                        <Flex gap={2} direction={{ base: "column", sm: "row" }}>
                            <Button
                                size="sm"
                                variant="outline"
                                colorScheme="green"
                                leftIcon={<ArrowsRightLeftIcon width={16} height={16} />}
                                onClick={() => openStock(null)}
                            >
                                Stock In / Out
                            </Button>

                            <Button
                                size="sm"
                                colorScheme="brand"
                                leftIcon={<PlusIcon width={16} height={16} />}
                                onClick={openAdd}
                            >
                                Add Vehicle Part
                            </Button>
                        </Flex>
                    </Flex>

                    <TabPanels>

                        <TabPanel px={0} pb={0}>
                            <Flex direction={{ base: "column", md: "row" }} gap={3} mb={4}>
                                <InputGroup flex="1" size="sm">
                                    <InputLeftElement pointerEvents="none">
                                        <MagnifyingGlassIcon width={17} height={17} style={{ color: "#A0AEC0" }} />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search parts..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        bg="white"
                                        borderColor="gray.300"
                                        rounded="md"
                                    />
                                </InputGroup>

                                <Select
                                    {...inputStyle}
                                    w={{ base: "100%", md: "200px" }}
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </Select>

                                <Select
                                    {...inputStyle}
                                    w={{ base: "100%", md: "180px" }}
                                    value={stockFilter}
                                    onChange={(e) => setStockFilter(e.target.value)}
                                >
                                    <option value="">All Stock</option>
                                    <option value="in">In Stock</option>
                                    <option value="low">Low Stock</option>
                                    <option value="out">Out of Stock</option>
                                </Select>
                            </Flex>

                            <VehiclePartsTable
                                parts={filteredParts}
                                loading={loadingParts}
                                onEdit={openEdit}
                                onStock={openStock}
                                onLedger={openLedger}
                                onArchive={handleArchive}
                            />
                        </TabPanel>

                        <TabPanel px={0} pb={0}>
                            <Flex direction={{ base: "column", md: "row" }} gap={3} mb={4}>
                                <Select
                                    {...inputStyle}
                                    flex="1"
                                    value={ledgerPart}
                                    onChange={(e) => setLedgerPart(e.target.value)}
                                >
                                    <option value="">All Parts</option>
                                    {parts.map((part) => (
                                        <option key={part.id} value={part.id}>
                                            {part.part_name}
                                        </option>
                                    ))}
                                </Select>

                                <Select
                                    {...inputStyle}
                                    w={{ base: "100%", md: "180px" }}
                                    value={ledgerType}
                                    onChange={(e) => setLedgerType(e.target.value as StockMovementType | "")}
                                >
                                    <option value="">All Types</option>
                                    {STOCK_MOVEMENT_TYPES.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </Select>

                                <Input
                                    {...inputStyle}
                                    type="date"
                                    w={{ base: "100%", md: "160px" }}
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />

                                <Input
                                    {...inputStyle}
                                    type="date"
                                    w={{ base: "100%", md: "160px" }}
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </Flex>

                            <StockMovementTable movements={movements} loading={loadingMovements} />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>

            <VehiclePartFormModal
                isOpen={formModal.isOpen}
                onClose={formModal.onClose}
                onSuccess={reloadAll}
                part={selectedPart}
            />

            <StockMovementModal
                isOpen={stockModal.isOpen}
                onClose={stockModal.onClose}
                onSuccess={reloadAll}
                parts={parts}
                part={selectedPart}
            />

            <Modal isOpen={ledgerModal.isOpen} onClose={ledgerModal.onClose} size="6xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <Text fontSize="lg" fontWeight="semibold">
                            {selectedPart?.part_name} Ledger
                        </Text>
                        <Text fontSize="sm" fontWeight="normal" color="gray.500" mt={1}>
                            {selectedPart?.quantity ?? 0} on hand
                        </Text>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <StockMovementTable movements={partLedger} loading={loadingPartLedger} showPart={false} />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}
