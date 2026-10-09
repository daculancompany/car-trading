import { useEffect, useState } from "react";

import {
    Badge,
    Box,
    Flex,
    Heading,
    Spinner,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    useToast,
    Button,
} from "@chakra-ui/react";

import {
    getVehicleBrands,
    type VehicleBrand,
} from "../../../../api/VehicleManagement/brandApi";

export default function AdminViewBrand() {
    const toast = useToast();

    const [brands, setBrands] = useState<VehicleBrand[]>([]);
    const [loading, setLoading] = useState(true);

    const ITEMS_PER_PAGE = 10;

    const [currentPage, setCurrentPage] = useState(1);

    /**
     * Load Brands
     */
    const loadBrands = async () => {
        try {
            setLoading(true);

            const data = await getVehicleBrands();

            setBrands(data);
            setCurrentPage(1);
        } catch (error) {
            console.error(
                "Failed to load vehicle brands:",
                error
            );

            toast({
                title: "Error",
                description: "Failed to load brands.",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Initial Load
     */
    useEffect(() => {
        loadBrands();
    }, []);

    /**
     * Pagination
     */
    const totalPages = Math.ceil(
        brands.length / ITEMS_PER_PAGE
    );

    const paginatedBrands = brands.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    /**
     * Display Range
     */
    const startItem =
        brands.length === 0
            ? 0
            : (currentPage - 1) * ITEMS_PER_PAGE + 1;

    const endItem = Math.min(
        currentPage * ITEMS_PER_PAGE,
        brands.length
    );

    return (
        <Box>
            {/* PAGE HEADER */}
            <Flex
                justify="space-between"
                align={{ base: "start", md: "center" }}
                direction={{ base: "column", md: "row" }}
                gap={3}
                mb={5}
            >
                <Box>
                    <Heading
                        size="md"
                        fontWeight="700"
                        color="gray.800"
                    >
                        Brand Master Data
                    </Heading>

                    <Text
                        mt={1}
                        fontSize="sm"
                        color="gray.500"
                    >
                        Manage vehicle brands.
                    </Text>
                </Box>

                <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="gray.500"
                >
                    {brands.length}{" "}
                    {brands.length === 1
                        ? "Brand"
                        : "Brands"}
                </Text>
            </Flex>

            {/* TABLE CARD */}
            <Box
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="sm"
            >
                {/* CARD HEADER */}
                <Flex
                    px={{ base: 4, md: 5 }}
                    py={4}
                    justify="space-between"
                    align="center"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                >
                    <Box>
                        <Text
                            fontSize="sm"
                            fontWeight="700"
                            color="gray.800"
                        >
                            Vehicle Brands
                        </Text>

                        <Text
                            fontSize="xs"
                            color="gray.500"
                            mt={0.5}
                        >
                            List of registered vehicle brands
                        </Text>
                    </Box>

                    {!loading && (
                        <Badge
                            px={2.5}
                            py={1}
                            borderRadius="full"
                            colorScheme="blue"
                            fontSize="xs"
                        >
                            {brands.length} Total
                        </Badge>
                    )}
                </Flex>

                {/* TABLE */}
                {loading ? (
                    <Flex
                        justify="center"
                        align="center"
                        minH="240px"
                    >
                        <Spinner
                            size="lg"
                            color="blue.500"
                            thickness="3px"
                        />
                    </Flex>
                ) : (
                    <Box
                        overflowX="auto"
                    >
                        <Table
                            variant="simple"
                            size="md"
                        >
                            <Thead>
                                <Tr
                                    bg="gray.50"
                                >
                                    <Th
                                        width="80px"
                                        textAlign="center"
                                        fontSize="xs"
                                        color="gray.500"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                        borderBottom="1px solid"
                                        borderColor="gray.200"
                                    >
                                        No.
                                    </Th>

                                    <Th
                                        fontSize="xs"
                                        color="gray.500"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                        borderBottom="1px solid"
                                        borderColor="gray.200"
                                    >
                                        Brand
                                    </Th>

                                    <Th
                                        width="140px"
                                        textAlign="center"
                                        fontSize="xs"
                                        color="gray.500"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                        borderBottom="1px solid"
                                        borderColor="gray.200"
                                    >
                                        Models
                                    </Th>

                                    <Th
                                        width="140px"
                                        textAlign="center"
                                        fontSize="xs"
                                        color="gray.500"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                        borderBottom="1px solid"
                                        borderColor="gray.200"
                                    >
                                        Status
                                    </Th>
                                </Tr>
                            </Thead>

                            <Tbody>
                                {paginatedBrands.length > 0 ? (
                                    paginatedBrands.map(
                                        (brand, index) => (
                                            <Tr
                                                key={brand.id}
                                                _hover={{
                                                    bg: "gray.50",
                                                }}
                                                transition="background 0.15s"
                                            >
                                                {/* Number */}
                                                <Td
                                                    textAlign="center"
                                                    color="gray.500"
                                                    fontSize="sm"
                                                    borderBottom="1px solid"
                                                    borderColor="gray.100"
                                                >
                                                    {(currentPage - 1) *
                                                        ITEMS_PER_PAGE +
                                                        index +
                                                        1}
                                                </Td>

                                                {/* Brand */}
                                                <Td
                                                    fontWeight="600"
                                                    color="gray.800"
                                                    borderBottom="1px solid"
                                                    borderColor="gray.100"
                                                >
                                                    {brand.brand}
                                                </Td>

                                                {/* Models */}
                                                <Td
                                                    textAlign="center"
                                                    borderBottom="1px solid"
                                                    borderColor="gray.100"
                                                >
                                                    <Text
                                                        fontSize="sm"
                                                        fontWeight="600"
                                                        color="gray.700"
                                                    >
                                                        {brand.models_count ??
                                                            0}
                                                    </Text>
                                                </Td>

                                                {/* Status */}
                                                <Td
                                                    textAlign="center"
                                                    borderBottom="1px solid"
                                                    borderColor="gray.100"
                                                >
                                                    <Badge
                                                        px={3}
                                                        py={1}
                                                        borderRadius="full"
                                                        colorScheme={
                                                            brand.is_active
                                                                ? "green"
                                                                : "red"
                                                        }
                                                        fontSize="xs"
                                                        fontWeight="600"
                                                    >
                                                        {brand.is_active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </Badge>
                                                </Td>
                                            </Tr>
                                        )
                                    )
                                ) : (
                                    <Tr>
                                        <Td
                                            colSpan={4}
                                            textAlign="center"
                                            py={12}
                                        >
                                            <Text
                                                fontSize="sm"
                                                fontWeight="500"
                                                color="gray.500"
                                            >
                                                No brands found.
                                            </Text>

                                            <Text
                                                mt={1}
                                                fontSize="xs"
                                                color="gray.400"
                                            >
                                                There are currently no
                                                vehicle brands available.
                                            </Text>
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                )}

                {/* PAGINATION */}
                {!loading && (
                    <Flex
                        px={{ base: 4, md: 5 }}
                        py={4}
                        justify="space-between"
                        align={{ base: "start", md: "center" }}
                        direction={{
                            base: "column",
                            sm: "row",
                        }}
                        gap={3}
                        borderTop="1px solid"
                        borderColor="gray.200"
                    >
                        {/* Showing */}
                        <Text
                            fontSize="sm"
                            color="gray.500"
                        >
                            Showing{" "}
                            <Text
                                as="span"
                                fontWeight="600"
                                color="gray.700"
                            >
                                {startItem}
                            </Text>
                            {" - "}
                            <Text
                                as="span"
                                fontWeight="600"
                                color="gray.700"
                            >
                                {endItem}
                            </Text>
                            {" of "}
                            <Text
                                as="span"
                                fontWeight="600"
                                color="gray.700"
                            >
                                {brands.length}
                            </Text>
                            {" brands"}
                        </Text>

                        {/* Controls */}
                        <Flex
                            gap={2}
                            align="center"
                        >
                            <Button
                                size="sm"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.600"
                                fontWeight="500"
                                _hover={{
                                    bg: "gray.50",
                                    borderColor: "gray.400",
                                }}
                                onClick={() =>
                                    setCurrentPage(
                                        (page) => page - 1
                                    )
                                }
                                isDisabled={
                                    currentPage === 1 ||
                                    totalPages === 0
                                }
                            >
                                Previous
                            </Button>

                            <Flex
                                minW="90px"
                                h="32px"
                                px={2}
                                align="center"
                                justify="center"
                                borderRadius="md"
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                            >
                                <Text
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.600"
                                >
                                    Page {currentPage} of{" "}
                                    {totalPages || 1}
                                </Text>
                            </Flex>

                            <Button
                                size="sm"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.600"
                                fontWeight="500"
                                _hover={{
                                    bg: "gray.50",
                                    borderColor: "gray.400",
                                }}
                                onClick={() =>
                                    setCurrentPage(
                                        (page) => page + 1
                                    )
                                }
                                isDisabled={
                                    currentPage === totalPages ||
                                    totalPages === 0
                                }
                            >
                                Next
                            </Button>
                        </Flex>
                    </Flex>
                )}
            </Box>
        </Box>
    );
}