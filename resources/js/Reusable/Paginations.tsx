import React from "react";
import { Button, Flex, HStack, Text } from "@chakra-ui/react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage?: number;
    onPageChange: (page: number) => void;
    itemLabel?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalItems,
    itemsPerPage = 10,
    onPageChange,
    itemLabel = "vehicle",
}) => {
    const totalPages = Math.max(
        Math.ceil(totalItems / itemsPerPage),
        1
    );

    const safeCurrentPage = Math.min(
        Math.max(currentPage, 1),
        totalPages
    );

    const startItem =
        totalItems === 0
            ? 0
            : (safeCurrentPage - 1) * itemsPerPage + 1;

    const endItem = Math.min(
        safeCurrentPage * itemsPerPage,
        totalItems
    );

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        onPageChange(page);
    };

    return (
        <Flex
            px={{ base: 4, md: 5 }}
            py={3}
            borderTop="1px solid"
            borderColor="gray.200"
            justify="space-between"
            align={{
                base: "flex-start",
                md: "center",
            }}
            direction={{
                base: "column",
                md: "row",
            }}
            gap={3}
        >
            <Text fontSize="xs" color="gray.500">
                Showing{" "}
                <Text
                    as="span"
                    fontWeight="600"
                    color="dark.700"
                >
                    {startItem}–{endItem}
                </Text>{" "}
                of{" "}
                <Text
                    as="span"
                    fontWeight="600"
                    color="dark.700"
                >
                    {totalItems}
                </Text>{" "}
                {itemLabel}
                {totalItems !== 1 ? "s" : ""}
            </Text>

            <HStack spacing={1}>
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={
                        <ChevronLeftIcon width={16} height={16} />
                    }
                    onClick={() =>
                        handlePageChange(safeCurrentPage - 1)
                    }
                    isDisabled={safeCurrentPage === 1}
                    fontSize="xs"
                >
                    Previous
                </Button>

                {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                ).map((page) => (
                    <Button
                        key={page}
                        size="sm"
                        minW="32px"
                        px={3}
                        variant={
                            safeCurrentPage === page ? "solid" : "ghost"
                        }
                        bg={
                            safeCurrentPage === page
                                ? "brand.500"
                                : "transparent"
                        }
                        color={
                            safeCurrentPage === page
                                ? "white"
                                : "gray.600"
                        }
                        _hover={{
                            bg:
                                safeCurrentPage === page
                                    ? "brand.600"
                                    : "gray.100",
                        }}
                        onClick={() => handlePageChange(page)}
                        display={{
                            base:
                                page === safeCurrentPage
                                    ? "inline-flex"
                                    : "none",
                            md: "inline-flex",
                        }}
                    >
                        {page}
                    </Button>
                ))}

                <Button
                    size="sm"
                    variant="ghost"
                    rightIcon={
                        <ChevronRightIcon width={16} height={16} />
                    }
                    onClick={() =>
                        handlePageChange(safeCurrentPage + 1)
                    }
                    isDisabled={
                        safeCurrentPage === totalPages ||
                        totalItems === 0
                    }
                    fontSize="xs"
                >
                    Next
                </Button>
            </HStack>
        </Flex>
    );
};

export default Pagination;
