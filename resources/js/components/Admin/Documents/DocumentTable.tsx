import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  HStack,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  FinancingDocument,
} from "../../../api/FinancingManagement/documentApi";

import type {
  Financing,
} from "../../../api/FinancingManagement/financingInfoApi";

import FinancingDocumentsModal from "./FinancingDocumentsModal";

// Props

interface DocumentTableProps {
  documents: FinancingDocument[];
  loading?: boolean;
  onRefresh?: () => void;
}

// Constants

const ITEMS_PER_PAGE = 5;

// Component

export default function DocumentTable({
  documents,
  loading = false,
  onRefresh,
}: DocumentTableProps) {
  // Pagination

  const [currentPage, setCurrentPage] = useState(1);

  // Financing Documents Modal

  const [selectedFinancing, setSelectedFinancing] =
    useState<Financing | null>(null);

  const [isFinancingDocumentsOpen, setIsFinancingDocumentsOpen] =
    useState(false);

  // Group Documents By Financing

  const financingGroups = useMemo(() => {
    const groups = new Map<number, FinancingDocument[]>();

    documents.forEach((document) => {
      const financingId = Number(document.financing_info_id);

      const group =
        groups.get(financingId) ?? [];

      group.push(document);

      groups.set(financingId, group);
    });

    return Array.from(groups.entries()).map(
      ([financingId, group]) => {
        // Keep only the latest version
        // of each financing requirement.

        const latestByRequirement =
          new Map<number, FinancingDocument>();

        [...group]
          .sort((first, second) => {
            const firstDate = new Date(
              first.created_at ??
                first.uploaded_at,
            ).getTime();

            const secondDate = new Date(
              second.created_at ??
                second.uploaded_at,
            ).getTime();

            return (
              secondDate -
                firstDate ||
              second.id - first.id
            );
          })
          .forEach((document) => {
            if (
              !latestByRequirement.has(
                document.financing_requirement_id,
              )
            ) {
              latestByRequirement.set(
                document.financing_requirement_id,
                document,
              );
            }
          });

        return {
          financingId,
          documents:
            Array.from(
              latestByRequirement.values(),
            ),
        };
      },
    );
  }, [documents]);

  // Reset Page

  useEffect(() => {
    setCurrentPage(1);
  }, [documents.length]);

  // Pagination Calculations

  const totalItems =
    financingGroups.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems /
        ITEMS_PER_PAGE,
    ),
  );

  const startIndex =
    (currentPage - 1) *
    ITEMS_PER_PAGE;

  const endIndex = Math.min(
    startIndex +
      ITEMS_PER_PAGE,
    totalItems,
  );

  const paginatedFinancingGroups =
    financingGroups.slice(
      startIndex,
      endIndex,
    );

  // Helpers

  const formatDate = (
    date?: string | null,
  ): string => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleString(
      "en-PH",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      },
    );
  };

  // Document Summary

  const getDocumentSummary = (
    documents: FinancingDocument[],
  ) => {
    const total =
      documents.length;

    const verified =
      documents.filter(
        (document) =>
          document.verification_status ===
          "verified",
      ).length;

    const pending =
      documents.filter(
        (document) =>
          document.verification_status ===
          "pending",
      ).length;

    const rejected =
      documents.filter(
        (document) =>
          document.verification_status ===
          "rejected",
      ).length;

    return {
      total,
      verified,
      pending,
      rejected,
    };
  };

  // Overall Status

  const getGroupStatus = (
    documents: FinancingDocument[],
  ) => {
    const {
      pending,
      rejected,
      verified,
    } = getDocumentSummary(
      documents,
    );

    if (pending > 0) {
      return {
        label: "Pending Review",
        color: "yellow",
      };
    }

    if (rejected > 0) {
      return {
        label: "Rejected",
        color: "red",
      };
    }

    if (
      verified ===
      documents.length
    ) {
      return {
        label: "Verified",
        color: "green",
      };
    }

    return {
      label: "Pending Review",
      color: "yellow",
    };
  };

  // Open Documents

  const handleViewFinancingDocuments = (
    financingId: number,
  ) => {
    /*
     * The modal only needs the financing ID
     * to load its documents.
     */

    setSelectedFinancing({
      id: financingId,
    } as Financing);

    setIsFinancingDocumentsOpen(
      true,
    );
  };

  // Close Documents

  const handleCloseFinancingDocuments =
    () => {
      setSelectedFinancing(null);
      setIsFinancingDocumentsOpen(
        false,
      );
    };

  // Pagination Controls

  const goToPreviousPage = () => {
    setCurrentPage(
      (page) =>
        Math.max(
          1,
          page - 1,
        ),
    );
  };

  const goToNextPage = () => {
    setCurrentPage(
      (page) =>
        Math.min(
          totalPages,
          page + 1,
        ),
    );
  };

  // Render

  return (
    <Box
      layerStyle="panel"
      p={{ base: 4, md: 5 }}
      overflow="hidden"
      mt={0}
    >
      {/* Header */}

      <Flex
        direction={{
          base: "column",
          md: "row",
        }}
        justify="space-between"
        align={{
          base: "flex-start",
          md: "center",
        }}
        gap={2}
        mb={5}
      >
        <Box>
          <Heading
            size={{
              base: "sm",
              md: "md",
            }}
          >
            Financing Documents
          </Heading>

          <Text
            fontSize={{
              base: "xs",
              md: "sm",
            }}
            color="gray.500"
            mt={1}
          >
            Review and manage submitted
            financing documents.
          </Text>
        </Box>
      </Flex>

      {/* Table */}

      <Box overflowX="auto">
        <Table
          variant="simple"
          minW="950px"
        >
          <Thead bg="gray.50">
            <Tr>
              <Th>#</Th>
              <Th>Financing ID</Th>
              <Th>Documents</Th>
              <Th>Verification</Th>
              <Th>Latest Upload</Th>
              <Th>Status</Th>

              <Th textAlign="center">
                Actions
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {/* Loading */}

            {loading ? (
              <Tr>
                <Td colSpan={7}>
                  <Center py={10}>
                    <HStack spacing={3}>
                      <Spinner size="sm" />

                      <Text
                        fontSize="sm"
                        color="gray.500"
                      >
                        Loading documents...
                      </Text>
                    </HStack>
                  </Center>
                </Td>
              </Tr>
            ) : paginatedFinancingGroups.length ===
              0 ? (
              // Empty

              <Tr>
                <Td colSpan={7}>
                  <Center py={10}>
                    <Text
                      fontSize="sm"
                      color="gray.500"
                    >
                      No financing documents
                      found.
                    </Text>
                  </Center>
                </Td>
              </Tr>
            ) : (
              // Records

              paginatedFinancingGroups.map(
                (
                  group,
                  index,
                ) => {
                  const summary =
                    getDocumentSummary(
                      group.documents,
                    );

                  const status =
                    getGroupStatus(
                      group.documents,
                    );

                  const latestUpload =
                    group.documents
                      .map(
                        (
                          document,
                        ) =>
                          document.created_at ??
                          document.uploaded_at,
                      )
                      .sort(
                        (
                          first,
                          second,
                        ) =>
                          new Date(
                            second,
                          ).getTime() -
                          new Date(
                            first,
                          ).getTime(),
                      )[0];

                  return (
                    <Tr
                      key={
                        group.financingId
                      }
                    >
                      {/* Number */}

                      <Td>
                        {startIndex +
                          index +
                          1}
                      </Td>

                      {/* Financing ID */}

                      <Td>
                        <Text
                          fontWeight="semibold"
                          whiteSpace="nowrap"
                        >
                          #
                          {
                            group.financingId
                          }
                        </Text>
                      </Td>

                      {/* Documents */}

                      <Td>
                        <Text
                          fontWeight="medium"
                        >
                          {
                            summary.total
                          }{" "}
                          document
                          {summary.total ===
                          1
                            ? ""
                            : "s"}
                        </Text>

                        <Text
                          fontSize="xs"
                          color="gray.500"
                        >
                          {
                            summary.verified
                          }{" "}
                          verified
                        </Text>
                      </Td>

                      {/* Verification */}

                      <Td>
                        <HStack
                          spacing={2}
                          wrap="wrap"
                        >
                          {summary.verified >
                            0 && (
                            <Badge colorScheme="green">
                              {
                                summary.verified
                              }{" "}
                              Verified
                            </Badge>
                          )}

                          {summary.pending >
                            0 && (
                            <Badge colorScheme="yellow">
                              {
                                summary.pending
                              }{" "}
                              Pending
                            </Badge>
                          )}

                          {summary.rejected >
                            0 && (
                            <Badge colorScheme="red">
                              {
                                summary.rejected
                              }{" "}
                              Rejected
                            </Badge>
                          )}
                        </HStack>
                      </Td>

                      {/* Latest Upload */}

                      <Td>
                        <Text
                          fontSize="sm"
                          whiteSpace="nowrap"
                        >
                          {formatDate(
                            latestUpload,
                          )}
                        </Text>
                      </Td>

                      {/* Status */}

                      <Td>
                        <Badge
                          colorScheme={
                            status.color
                          }
                        >
                          {
                            status.label
                          }
                        </Badge>
                      </Td>

                      {/* Actions */}

                      <Td>
                        <HStack
                          justify="center"
                          spacing={2}
                        >
                          <Button
                            size="xs"
                            colorScheme="blue"
                            onClick={() =>
                              handleViewFinancingDocuments(
                                group.financingId,
                              )
                            }
                          >
                            View Documents
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  );
                },
              )
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Documents Modal */}

      <FinancingDocumentsModal
        isOpen={
          isFinancingDocumentsOpen
        }
        onClose={
          handleCloseFinancingDocuments
        }
        financing={
          selectedFinancing
        }
        onRefresh={onRefresh}
      />

      {/* Pagination */}

      <Flex
        mt={4}
        pt={4}
        borderTop="1px"
        borderColor="gray.200"
        direction={{
          base: "column",
          md: "row",
        }}
        justify="space-between"
        align={{
          base: "flex-start",
          md: "center",
        }}
        gap={4}
      >
        <Text
          fontSize="sm"
          color="gray.600"
        >
          {totalItems === 0 ? (
            "Showing 0 of 0 financings"
          ) : (
            <>
              Showing{" "}
              <strong>
                {startIndex + 1}–
                {endIndex}
              </strong>{" "}
              of{" "}
              <strong>
                {totalItems}
              </strong>{" "}
              financings
            </>
          )}
        </Text>

        <HStack spacing={2}>
          {/* Previous */}

          <Button
            size="sm"
            variant="ghost"
            onClick={
              goToPreviousPage
            }
            isDisabled={
              currentPage === 1 ||
              loading
            }
          >
            <ChevronLeftIcon />
          </Button>

          {/* Mobile */}

          <Text
            fontSize="sm"
            display={{
              base: "block",
              md: "none",
            }}
          >
            Page {currentPage} of{" "}
            {totalPages}
          </Text>

          {/* Desktop */}

          {Array.from(
            {
              length:
                totalPages,
            },
            (_, index) => {
              const page =
                index + 1;

              return (
                <Button
                  key={page}
                  size="sm"
                  variant={
                    page ===
                    currentPage
                      ? "solid"
                      : "outline"
                  }
                  colorScheme={
                    page ===
                    currentPage
                      ? "blue"
                      : undefined
                  }
                  display={{
                    base: "none",
                    md: "inline-flex",
                  }}
                  onClick={() =>
                    setCurrentPage(
                      page,
                    )
                  }
                  isDisabled={loading}
                >
                  {page}
                </Button>
              );
            },
          )}

          {/* Next */}

          <Button
            size="sm"
            variant="ghost"
            onClick={
              goToNextPage
            }
            isDisabled={
              currentPage ===
                totalPages ||
              loading ||
              totalItems === 0
            }
          >
            <ChevronRightIcon />
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}
