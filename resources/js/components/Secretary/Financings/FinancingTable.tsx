import { useEffect, useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
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
  useToast,
} from "@chakra-ui/react";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";

import type {
  Financing,
  FinancingStatus,
} from "../../../api/FinancingManagement/financingInfoApi";

import {
  approveFinancing,
  rejectFinancing,
} from "../../../api/FinancingManagement/financingInfoApi";

import FinancingVerifyModal from "./FinancingVerifyModal";

import FinancingDocumentsModal from "../Documents/FinancingDocumentsModal";
import CustomerAvatar from "../../Shared/Customers/CustomerAvatar";
import { customerFullName } from "../../Shared/Customers/customerName";

// Props

interface FinancingTableProps {
  financings?: Financing[];
  loading?: boolean;
  onRefresh?: () => void | Promise<void>;
}

// Constants

const ITEMS_PER_PAGE = 5;

// Component

export default function FinancingTable({
  financings = [],
  loading = false,
  onRefresh,
}: FinancingTableProps) {
  const toast = useToast();

  // Safety

  /**
   * Always make sure the table works with an array.
   *
   * This prevents errors such as:
   * Cannot read properties of undefined (reading 'length')
   */
  const safeFinancings = Array.isArray(financings)
    ? financings
    : [];

  // Documents Modal

  const [
    selectedDocumentsFinancing,
    setSelectedDocumentsFinancing,
  ] = useState<Financing | null>(null);

  const [
    isDocumentsOpen,
    setIsDocumentsOpen,
  ] = useState(false);

  const handleOpenDocuments = (
    financing: Financing,
  ) => {
    setSelectedDocumentsFinancing(financing);
    setIsDocumentsOpen(true);
  };

  const handleCloseDocuments = () => {
    setSelectedDocumentsFinancing(null);
    setIsDocumentsOpen(false);
  };

  // Verify Modal

  const [
    selectedFinancing,
    setSelectedFinancing,
  ] = useState<Financing | null>(null);

  const [
    isVerifyOpen,
    setIsVerifyOpen,
  ] = useState(false);

  const [
    verifyLoading,
    setVerifyLoading,
  ] = useState(false);

  // Open Verify Modal

  const handleOpenVerify = (
    financing: Financing,
  ) => {
    setSelectedFinancing(financing);
    setIsVerifyOpen(true);
  };

  // Close Verify Modal

  const handleCloseVerify = () => {
    if (verifyLoading) {
      return;
    }

    setIsVerifyOpen(false);
    setSelectedFinancing(null);
  };

  // Verification

  const handleConfirm = async (
    financing: Financing,
    status: FinancingStatus,
    remarks: string,
  ) => {
    try {
      setVerifyLoading(true);

      // APPROVE

      if (status === "approved") {
        await approveFinancing(
          financing.id,
          remarks.trim() || undefined,
        );
      }

      // REJECT

      else if (status === "rejected") {
        const trimmedRemarks =
          remarks.trim();

        if (!trimmedRemarks) {
          toast({
            title: "Rejection reason required",
            description:
              "Please provide a reason for rejecting this financing.",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });

          return;
        }
        await rejectFinancing(
          financing.id,
          trimmedRemarks,
        );
      }

      // Success

      toast({
        title: "Financing Updated",
        description:
          status === "approved"
            ? "Financing has been approved successfully."
            : "Financing has been rejected.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Close modal
      setIsVerifyOpen(false);
      setSelectedFinancing(null);

      // Refresh table
      await onRefresh?.();
    } catch (error) {
      console.error(
        "Financing verification failed:",
        error,
      );

      toast({
        title: "Update Failed",
        description:
          "Unable to update the financing status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  // Pagination

  const [currentPage, setCurrentPage] =
    useState(1);

  const totalItems =
    safeFinancings.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems / ITEMS_PER_PAGE,
    ),
  );

  /**
   * If filtering or refreshing reduces the number
   * of pages, automatically return to page 1.
   */
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const startIndex =
    (currentPage - 1) *
    ITEMS_PER_PAGE;

  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    totalItems,
  );

  const paginatedFinancings =
    safeFinancings.slice(
      startIndex,
      endIndex,
    );

  // Currency Formatter

  const formatCurrency = (
    amount?: number | null,
  ): string => {
    if (
      amount === null ||
      amount === undefined
    ) {
      return "—";
    }

    return new Intl.NumberFormat(
      "en-PH",
      {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      },
    ).format(Number(amount));
  };

  // Status Color

  const getStatusColorScheme = (
    status: FinancingStatus,
  ): string => {
    switch (status) {
      case "pending":
        return "yellow";

      case "approved":
        return "green";

      case "rejected":
        return "red";

      case "completed":
        return "purple";

      default:
        return "gray";
    }
  };

  // Status Label

  const formatStatus = (
    status: FinancingStatus,
  ): string => {
    switch (status) {
      case "pending":
        return "Pending";

      case "approved":
        return "Approved";

      case "rejected":
        return "Rejected";

      case "completed":
        return "Completed";

      default:
        return status;
    }
  };

  // Pagination Controls

  const goToPreviousPage = () => {
    setCurrentPage((page) =>
      Math.max(1, page - 1),
    );
  };

  const goToNextPage = () => {
    setCurrentPage((page) =>
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
            Financing Records
          </Heading>

          <Text
            fontSize={{
              base: "xs",
              md: "sm",
            }}
            color="gray.500"
            mt={1}
          >
            Review customer financing
            information, financing status,
            and submitted documents.
          </Text>
        </Box>
      </Flex>

      {/* Pending Review Alert */}

      {safeFinancings.some(
        (financing) =>
          financing.financing_status ===
          "pending",
      ) && (
          <Alert
            status="warning"
            variant="left-accent"
            mb={5}
            borderRadius="md"
            alignItems="flex-start"
          >
            <AlertIcon mt={1} />

            <Box>
              <AlertTitle fontSize="sm">
                Financing applications require review
              </AlertTitle>

              <AlertDescription fontSize="sm">
                Some financing records are
                pending. Please review the
                financing information and
                documents before approving or
                rejecting.
              </AlertDescription>
            </Box>
          </Alert>
        )}

      {/* Table */}

      <Box overflowX="auto">
        <Table
          variant="simple"
          minW="1050px"
        >
          <Thead bg="gray.50">
            <Tr>
              <Th>No</Th>

              <Th>
                Customer
              </Th>

              <Th>
                Reservation
              </Th>

              <Th>
                Financing Company
              </Th>

              <Th isNumeric>
                Financed Amount
              </Th>

              <Th isNumeric>
                Monthly Payment
              </Th>

              <Th>
                Loan Term
              </Th>

              <Th>
                Status
              </Th>

              <Th textAlign="center">
                Actions
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {/* Loading */}

            {loading ? (
              <Tr>
                <Td colSpan={9}>
                  <Center py={10}>
                    <HStack spacing={3}>
                      <Spinner size="sm" />

                      <Text
                        fontSize="sm"
                        color="gray.500"
                      >
                        Loading financing
                        records...
                      </Text>
                    </HStack>
                  </Center>
                </Td>
              </Tr>
            ) : paginatedFinancings.length ===
              0 ? (
              // Empty

              <Tr>
                <Td colSpan={9}>
                  <Center py={10}>
                    <Text
                      fontSize="sm"
                      color="gray.500"
                    >
                      No financing records
                      found.
                    </Text>
                  </Center>
                </Td>
              </Tr>
            ) : (
              // Records

              paginatedFinancings.map(
                (
                  financing,
                  index,
                ) => (
                  <Tr
                    key={
                      financing.id
                    }
                  >
                    {/* Number */}

                    <Td>
                      {startIndex +
                        index +
                        1}
                    </Td>

                    {/* Customer */}

                    <Td>

                      <CustomerAvatar
                        customer={financing.reservation?.customer}
                        withName
                        name={customerFullName(financing.reservation?.customer) || "—"}
                      />
                    </Td>

                    {/* Reservation */}

                    <Td>
                      <Text whiteSpace="nowrap">
                        #
                        {
                          financing.reservation_id
                        }
                      </Text>
                    </Td>

                    {/* Financing Company */}

                    <Td>
                      <Text whiteSpace="nowrap">
                        {
                          financing.company_name ??
                          "—"
                        }
                      </Text>
                    </Td>

                    {/* Financed Amount */}

                    <Td isNumeric>
                      {formatCurrency(
                        financing.financed_amount,
                      )}
                    </Td>

                    {/* Monthly Payment */}

                    <Td isNumeric>
                      {formatCurrency(
                        financing.monthly_payment,
                      )}
                    </Td>

                    {/* Loan Term */}

                    <Td>
                      {financing.loan_term_months
                        ? `${financing.loan_term_months} Months`
                        : "—"}
                    </Td>

                    {/* Status */}

                    <Td>
                      <HStack
                        spacing={2}
                        wrap="wrap"
                      >
                        <Badge
                          colorScheme={getStatusColorScheme(
                            financing.financing_status,
                          )}
                        >
                          {formatStatus(
                            financing.financing_status,
                          )}
                        </Badge>

                        {/* Documents Count */}

                        {(financing.documents
                          ?.length ??
                          0) > 0 && (
                            <Badge colorScheme="orange">
                              Documents (
                              {
                                financing
                                  .documents
                                  ?.length
                              }
                              )
                            </Badge>
                          )}
                      </HStack>
                    </Td>

                    {/* Actions */}

                    <Td>
                      <HStack
                        spacing={2}
                        justify="center"
                      >
                        {/* Documents Button */}

                        <Button
                          size="xs"
                          colorScheme="purple"
                          onClick={() =>
                            handleOpenDocuments(
                              financing,
                            )
                          }
                        >
                          Documents
                        </Button>

                        {/* Verify Button */}

                        {financing.financing_status ===
                          "pending" ? (
                          <Button
                            size="xs"
                            colorScheme="blue"
                            onClick={() =>
                              handleOpenVerify(
                                financing,
                              )
                            }
                          >
                            Verify
                          </Button>
                        ) : (
                          <Text
                            fontSize="xs"
                            color="gray.400"
                          >
                            No action
                          </Text>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ),
              )
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Verify Modal */}

      <FinancingVerifyModal
        isOpen={
          isVerifyOpen
        }
        onClose={
          handleCloseVerify
        }
        financing={
          selectedFinancing
        }
        onConfirm={
          handleConfirm
        }
        loading={
          verifyLoading
        }
      />

      {/* Documents Modal */}

      <FinancingDocumentsModal
        isOpen={
          isDocumentsOpen
        }
        onClose={
          handleCloseDocuments
        }
        financing={
          selectedDocumentsFinancing
        }
        onRefresh={
          onRefresh
        }
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
        {/* Pagination Information */}

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

          {/* Mobile Page Indicator */}

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

          {/* Desktop Page Numbers */}

          {Array.from(
            {
              length: totalPages,
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
                  isDisabled={
                    loading
                  }
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