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
    getVehicleModels,
    type VehicleModel,
} from "../../../../api/VehicleManagement/modelApi";

export default function AdminViewModel() {
    const toast = useToast();

    const [models, setModels] = useState<VehicleModel[]>([]);
    const [loading, setLoading] = useState(true);

    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    /**
     * Load Vehicle Models
     */
    const loadModels = async () => {
        try {
            setLoading(true);

            const data = await getVehicleModels();

            setModels(data);
            setCurrentPage(1);
        } catch (error) {
            console.error(
                "Failed to load vehicle models:",
                error
            );

            toast({
                title: "Error",
                description:
                    "Failed to load vehicle models.",
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
        loadModels();
    }, []);

    /**
     * Pagination
     */
    const totalPages = Math.ceil(
        models.length / ITEMS_PER_PAGE
    );

    const paginatedModels = models.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const startItem =
        models.length === 0
            ? 0
            : (currentPage - 1) * ITEMS_PER_PAGE + 1;

    const endItem = Math.min(
        currentPage * ITEMS_PER_PAGE,
        models.length
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
                        Model Master Data
                    </Heading>

                    <Text
                        mt={1}
                        fontSize="sm"
                        color="gray.500"
                    >
                        Manage vehicle models.
                    </Text>
                </Box>

                <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="gray.500"
                >
                    {models.length}{" "}
                    {models.length === 1
                        ? "Model"
                        : "Models"}
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
                            Vehicle Models
                        </Text>

                        <Text
                            mt={0.5}
                            fontSize="xs"
                            color="gray.500"
                        >
                            List of registered vehicle models
                        </Text>
                    </Box>

                    {!loading && (
                        <Badge
                            px={2.5}
                            py={1}
                            borderRadius="full"
                            colorScheme="blue"
                            fontSize="xs"
                            fontWeight="600"
                        >
                            {models.length} Total
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
                    <Box overflowX="auto">
                        <Table
                            variant="simple"
                            size="md"
                        >
                            <Thead>
                                <Tr bg="gray.50">
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
                                        fontSize="xs"
                                        color="gray.500"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                        borderBottom="1px solid"
                                        borderColor="gray.200"
                                    >
                                        Model
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
                                        Variants
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
                                {paginatedModels.length > 0 ? (
                                    paginatedModels.map(
                                        (model, index) => (
                                            <Tr
                                                key={model.id}
                                                _hover={{
                                                    bg: "gray.50",
                                                }}
                                                transition="background 0.15s"
                                            >
                                                {/* Number */}
                                                <Td
                                                    textAlign="center"
                                                    fontSize="sm"
                                                    color="gray.500"
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
                                                    fontSize="sm"
                                                    fontWeight="600"
                                                    color="gray.700"
                                                    borderBottom="1px solid"
                                                    borderColor="gray.100"
                                                >
                                                    {model.brand?.brand ??
                                                        "-"}
                                                </Td>

                                                {/* Model */}
                                                <Td
                                                    fontSize="sm"
                                                    fontWeight="600"
                                                    color="gray.800"
                                                    borderBottom="1px solid"
                                                    borderColor="gray.100"
                                                >
                                                    {model.model}
                                                </Td>

                                                {/* Variants */}
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
                                                        {model.variants_count ??
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
                                                            model.is_active
                                                                ? "green"
                                                                : "red"
                                                        }
                                                        fontSize="xs"
                                                        fontWeight="600"
                                                    >
                                                        {model.is_active
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
                                            colSpan={5}
                                            textAlign="center"
                                            py={12}
                                        >
                                            <Text
                                                fontSize="sm"
                                                fontWeight="500"
                                                color="gray.500"
                                            >
                                                No vehicle models found.
                                            </Text>

                                            <Text
                                                mt={1}
                                                fontSize="xs"
                                                color="gray.400"
                                            >
                                                There are currently no
                                                vehicle models available.
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
                                {models.length}
                            </Text>
                            {" models"}
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