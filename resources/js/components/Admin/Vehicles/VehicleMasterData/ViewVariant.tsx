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
    getVehicleVariants,
    type VehicleVariant,
} from "../../../../api/VehicleManagement/variantApi";

export default function AdminViewVariant() {
    const toast = useToast();

    const [variants, setVariants] = useState<VehicleVariant[]>([]);
    const [loading, setLoading] = useState(true);

    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    /**
     * Load Vehicle Variants
     */
    const loadVariants = async () => {
        try {
            setLoading(true);

            // getVehicleVariants() already returns VehicleVariant[]
            const data = await getVehicleVariants();

            setVariants(data);
            setCurrentPage(1);
        } catch (error) {
            console.error(
                "Failed to load vehicle variants:",
                error
            );

            toast({
                title: "Error",
                description:
                    "Failed to load vehicle variants.",
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
        loadVariants();
    }, []);

    /**
     * Pagination
     */
    const totalPages = Math.ceil(
        variants.length / ITEMS_PER_PAGE
    );

    const paginatedVariants = variants.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const startItem =
        variants.length === 0
            ? 0
            : (currentPage - 1) * ITEMS_PER_PAGE + 1;

    const endItem = Math.min(
        currentPage * ITEMS_PER_PAGE,
        variants.length
    );

    return (
        <Box>
            {/* PAGE HEADER */}
            <Box mb={5}>
                <Heading
                    size="lg"
                    fontWeight="700"
                    color="gray.800"
                >
                    Variant Master Data
                </Heading>

                <Text
                    mt={1}
                    fontSize="sm"
                    color="gray.500"
                >
                    Manage vehicle variants and their associated models.
                </Text>
            </Box>

            {/* VARIANT TABLE CARD */}
            <Box
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="xl"
                boxShadow="sm"
                overflow="hidden"
            >
                {/* CARD HEADER */}
                <Flex
                    px={{ base: 4, md: 5 }}
                    py={4}
                    justify="space-between"
                    align="center"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    bg="white"
                >
                    <Box>
                        <Text
                            fontSize="md"
                            fontWeight="700"
                            color="gray.800"
                        >
                            Vehicle Variants
                        </Text>

                        <Text
                            mt={0.5}
                            fontSize="xs"
                            color="gray.500"
                        >
                            List of registered vehicle variants
                        </Text>
                    </Box>

                    <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        colorScheme="blue"
                        fontSize="xs"
                        fontWeight="600"
                    >
                        {variants.length} Variants
                    </Badge>
                </Flex>

                {/* TABLE */}
                {loading ? (
                    <Flex
                        justify="center"
                        align="center"
                        direction="column"
                        py={16}
                        gap={3}
                    >
                        <Spinner
                            size="md"
                            thickness="3px"
                        />

                        <Text
                            fontSize="sm"
                            color="gray.500"
                        >
                            Loading vehicle variants...
                        </Text>
                    </Flex>
                ) : (
                    <Box overflowX="auto">
                        <Table
                            variant="simple"
                            minW="800px"
                        >
                            <Thead>
                                <Tr
                                    bg="gray.50"
                                    borderBottom="1px solid"
                                    borderColor="gray.200"
                                >
                                    <Th
                                        width="80px"
                                        textAlign="center"
                                        fontSize="xs"
                                        color="gray.500"
                                        fontWeight="700"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                        py={4}
                                    >
                                        No.
                                    </Th>

                                    <Th
                                        fontSize="xs"
                                        color="gray.500"
                                        fontWeight="700"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                    >
                                        Brand
                                    </Th>

                                    <Th
                                        fontSize="xs"
                                        color="gray.500"
                                        fontWeight="700"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                    >
                                        Model
                                    </Th>

                                    <Th
                                        fontSize="xs"
                                        color="gray.500"
                                        fontWeight="700"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                    >
                                        Variant
                                    </Th>

                                    <Th
                                        width="120px"
                                        textAlign="center"
                                        fontSize="xs"
                                        color="gray.500"
                                        fontWeight="700"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                    >
                                        Vehicles
                                    </Th>

                                    <Th
                                        width="120px"
                                        textAlign="center"
                                        fontSize="xs"
                                        color="gray.500"
                                        fontWeight="700"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                    >
                                        Status
                                    </Th>
                                </Tr>
                            </Thead>

                            <Tbody>
                                {paginatedVariants.length > 0 ? (
                                    paginatedVariants.map(
                                        (variant, index) => (
                                            <Tr
                                                key={variant.id}
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
                                                    py={4}
                                                >
                                                    {(currentPage - 1) *
                                                        ITEMS_PER_PAGE +
                                                        index +
                                                        1}
                                                </Td>

                                                {/* Brand */}
                                                <Td
                                                    fontSize="sm"
                                                    color="gray.700"
                                                >
                                                    {variant.model?.brand
                                                        ?.brand ?? "-"}
                                                </Td>

                                                {/* Model */}
                                                <Td
                                                    fontSize="sm"
                                                    color="gray.700"
                                                >
                                                    {variant.model?.model ??
                                                        "-"}
                                                </Td>

                                                {/* Variant */}
                                                <Td
                                                    fontSize="sm"
                                                    fontWeight="600"
                                                    color="gray.800"
                                                >
                                                    {variant.variant}
                                                </Td>

                                                {/* Vehicle Count */}
                                                <Td textAlign="center">
                                                    <Badge
                                                        variant="subtle"
                                                        colorScheme="blue"
                                                        px={2.5}
                                                        py={1}
                                                        borderRadius="md"
                                                        fontSize="xs"
                                                    >
                                                        {variant.vehicles_count ??
                                                            0}
                                                    </Badge>
                                                </Td>

                                                {/* Status */}
                                                <Td textAlign="center">
                                                    <Badge
                                                        px={3}
                                                        py={1}
                                                        borderRadius="full"
                                                        colorScheme={
                                                            variant.is_active
                                                                ? "green"
                                                                : "red"
                                                        }
                                                        fontSize="xs"
                                                        fontWeight="600"
                                                    >
                                                        {variant.is_active
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
                                            colSpan={6}
                                            textAlign="center"
                                            py={14}
                                        >
                                            <Box>
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="600"
                                                    color="gray.600"
                                                >
                                                    No vehicle variants found
                                                </Text>

                                                <Text
                                                    mt={1}
                                                    fontSize="xs"
                                                    color="gray.400"
                                                >
                                                    There are currently no
                                                    vehicle variants to display.
                                                </Text>
                                            </Box>
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                )}

                {/* PAGINATION FOOTER */}
                {!loading && (
                    <Flex
                        px={{ base: 4, md: 5 }}
                        py={4}
                        borderTop="1px solid"
                        borderColor="gray.200"
                        justify="space-between"
                        align="center"
                        flexWrap="wrap"
                        gap={3}
                    >
                        {/* Result Information */}
                        <Text
                            fontSize="xs"
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
                                {variants.length}
                            </Text>
                            {" variants"}
                        </Text>

                        {/* Pagination Controls */}
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
                                minW="100px"
                                h="32px"
                                px={3}
                                align="center"
                                justify="center"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                bg="gray.50"
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