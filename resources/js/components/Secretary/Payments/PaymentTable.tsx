import { useState } from "react";

import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Heading,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";

import {
  EyeIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

import type { Payment } from "../../../api/PaymentManagement/paymentApi";

import VerifyPaymentModal from "./VerifyPaymentModal";

interface PaymentTableProps {
  payments: Payment[];
  loading: boolean;
  onReload: () => void;

  onView?: (payment: Payment) => void;
  onReject?: (payment: Payment) => void;
  onArchive?: (payment: Payment) => void;
}

export default function PaymentTable({
  payments,
  loading,
  onReload,
  onView,
  onArchive,
}: PaymentTableProps) {
  const {
    isOpen: isVerifyOpen,
    onOpen: onVerifyOpen,
    onClose: onVerifyClose,
  } = useDisclosure();

  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  // ACTIVE PAYMENTS ONLY
  // 0 = Active
  // 1 = Archived

  const isArchived = (payment: Payment) => {
    const record = payment as Payment & {
      archived?: number | boolean;
      archive?: number | boolean;
    };

    return Number(
      record.archived ?? record.archive ?? 0
    ) === 1;
  };

  const activePayments = payments.filter(
    (payment) => !isArchived(payment)
  );

  const pendingCustomerPayments = activePayments.filter(
    (payment) =>
      payment.payer_type === "customer" &&
      payment.payment_status === "pending",
  );

  const rejectedCustomerPayments = activePayments.filter(
    (payment) =>
      payment.payer_type === "customer" &&
      payment.payment_status === "rejected",
  );

  // PAGINATION

  const currentPage = 1;
  const itemsPerPage = 10;

  const totalItems = activePayments.length;

  const startItem =
    totalItems === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;

  const endItem = Math.min(
    currentPage * itemsPerPage,
    totalItems
  );

  const paginatedPayments = activePayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // FORMATTERS

  const formatPaymentType = (
    type: Payment["payment_type"]
  ) =>
    type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const formatPaymentMethod = (
    method: Payment["payment_method"]
  ) =>
    method
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const formatPaymentDate = (
    date: Payment["payment_date"]
  ) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-PH",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const formatAmount = (
    amount: number | string
  ) =>
    Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // STATUS

  const getStatusColor = (
    status: Payment["payment_status"]
  ) => {
    switch (status) {
      case "verified":
        return "green";

      case "pending":
        return "yellow";

      case "rejected":
        return "red";

      default:
        return "gray";
    }
  };

  // VERIFY HANDLERS

  const handleVerifyClick = (payment: Payment) => {
    setSelectedPayment(payment);
    onVerifyOpen();
  };

  const handleVerifyClose = () => {
    setSelectedPayment(null);
    onVerifyClose();
  };

  // RENDER

  return (
    <Box
      layerStyle="panel"
      overflow="hidden"
    >
      {/* TABLE HEADER */}

      <Flex
        px={{ base: 4, md: 5 }}
        py={4}
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
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Box>
          <Heading
            size="sm"
            fontWeight="700"
            color="dark.900"
          >
            Payment Records
          </Heading>

          <Text
            mt={1}
            fontSize="xs"
            color="gray.500"
          >
            Browse and manage customer payment
            records and verification status.
          </Text>
        </Box>

        <Text
          fontSize="xs"
          color="gray.500"
          fontWeight="500"
        >
          {totalItems} record
          {totalItems !== 1 ? "s" : ""}
        </Text>
      </Flex>

      {pendingCustomerPayments.length > 0 && (
        <Alert
          status="info"
          mx={{ base: 4, md: 5 }}
          mt={4}
          borderRadius="md"
          alignItems="flex-start"
        >
          <AlertIcon mt={1} />
          <Box>
            <Text fontSize="sm" fontWeight="700" color="blue.800">
              Customer payment received
            </Text>
            <Text fontSize="xs" color="blue.700" mt={1}>
              {pendingCustomerPayments.length} customer payment
              {pendingCustomerPayments.length !== 1 ? "s are" : " is"} waiting
              for verification.
            </Text>
          </Box>
        </Alert>
      )}

      {rejectedCustomerPayments.length > 0 && (
        <Alert
          status="warning"
          mx={{ base: 4, md: 5 }}
          mt={4}
          borderRadius="md"
          alignItems="flex-start"
        >
          <AlertIcon mt={1} />
          <Box>
            <Text fontSize="sm" fontWeight="700" color="orange.800">
              Resubmit payment requirements
            </Text>
            <Text fontSize="xs" color="orange.700" mt={1}>
              {rejectedCustomerPayments.length} customer payment
              {rejectedCustomerPayments.length !== 1 ? "s were" : " was"} rejected
              and require{rejectedCustomerPayments.length === 1 ? "s" : ""} a corrected proof.
            </Text>
          </Box>
        </Alert>
      )}

      {/* TABLE */}

      <Box overflowX="auto">
        <Table
          variant="simple"
          minW="950px"
        >
          <Thead bg="gray.50">
            <Tr>
              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Payment No.
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Payment Type
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Method
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
                isNumeric
              >
                Amount
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Payment Date
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Status
              </Th>

              <Th
                textAlign="center"
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Actions
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {/* LOADING */}

            {loading ? (
              <Tr>
                <Td
                  colSpan={7}
                  textAlign="center"
                  py={10}
                >
                  <Text
                    fontSize="sm"
                    color="gray.500"
                  >
                    Loading payments...
                  </Text>
                </Td>
              </Tr>
            ) : activePayments.length > 0 ? (
              paginatedPayments.map((payment) => (
                <Tr
                  key={payment.id}
                  _hover={{
                    bg: "gray.50",
                  }}
                  transition="background 0.15s"
                >
                  {/* PAYMENT NUMBER */}

                  <Td
                    fontSize="sm"
                    fontWeight="600"
                    color="dark.900"
                  >
                    #{payment.id}
                  </Td>

                  {/* PAYMENT TYPE */}

                  <Td>
                    <Text
                      fontSize="sm"
                      color="gray.700"
                      whiteSpace="nowrap"
                    >
                      {formatPaymentType(
                        payment.payment_type
                      )}
                    </Text>
                  </Td>

                  {/* METHOD */}

                  <Td>
                    <Text
                      fontSize="sm"
                      color="gray.700"
                      whiteSpace="nowrap"
                    >
                      {formatPaymentMethod(
                        payment.payment_method
                      )}
                    </Text>
                  </Td>

                  {/* AMOUNT */}

                  <Td isNumeric>
                    <Text
                      fontSize="sm"
                      fontWeight="700"
                      color="dark.900"
                      whiteSpace="nowrap"
                    >
                      ₱
                      {formatAmount(
                        payment.amount
                      )}
                    </Text>
                  </Td>

                  {/* DATE */}

                  <Td>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      whiteSpace="nowrap"
                    >
                      {formatPaymentDate(
                        payment.payment_date
                      )}
                    </Text>
                  </Td>

                  {/* STATUS */}

                  <Td>
                    <Box>
                      <Badge
                        colorScheme={getStatusColor(
                          payment.payment_status
                        )}
                        px={2}
                        py={1}
                        rounded="full"
                        fontSize="xs"
                        fontWeight="600"
                      >
                        {payment.payment_status
                          .charAt(0)
                          .toUpperCase() +
                          payment.payment_status.slice(
                            1
                          )}
                      </Badge>

                      {payment.payer_type === "customer" &&
                        payment.payment_status === "pending" && (
                          <Box mt={2}>
                            <Badge
                              colorScheme="blue"
                              px={2}
                              py={1}
                              rounded="md"
                              fontSize="10px"
                              fontWeight="700"
                            >
                              Customer Payment Submitted
                            </Badge>
                          </Box>
                        )}

                      {payment.payer_type === "customer" &&
                        payment.payment_status === "rejected" && (
                          <Box mt={2}>
                            <Badge
                              colorScheme="orange"
                              px={2}
                              py={1}
                              rounded="md"
                              fontSize="10px"
                              fontWeight="700"
                            >
                              Customer Must Resubmit Proof
                            </Badge>
                          </Box>
                        )}
                    </Box>
                  </Td>

                  {/* ACTIONS */}

                  <Td>
                    <HStack
                      spacing={1}
                      justify="center"
                    >
                      {/* VIEW */}

                      <Tooltip
                        label="View Payment"
                        hasArrow
                        placement="top"
                      >
                        <IconButton
                          aria-label="View Payment"
                          size="sm"
                          variant="ghost"
                          color="gray.600"
                          icon={
                            <EyeIcon
                              width={18}
                              height={18}
                            />
                          }
                          onClick={() =>
                            onView?.(payment)
                          }
                          _hover={{
                            bg: "blue.50",
                            color: "blue.500",
                          }}
                        />
                      </Tooltip>

                      {/* VERIFY + REJECT */}

                      {payment.payment_status ===
                        "pending" && (
                          <>
                            <Tooltip
                              label="Verify Payment"
                              hasArrow
                              placement="top"
                            >
                              <IconButton
                                aria-label="Verify Payment"
                                size="sm"
                                variant="ghost"
                                color="gray.600"
                                icon={
                                  <CheckCircleIcon
                                    width={18}
                                    height={18}
                                  />
                                }
                                onClick={() =>
                                  handleVerifyClick(
                                    payment
                                  )
                                }
                                _hover={{
                                  bg: "green.50",
                                  color: "green.500",
                                }}
                              />
                            </Tooltip>
                          </>
                        )}

                      {/* ARCHIVE */}

                      <Tooltip
                        label="Archive Payment"
                        hasArrow
                        placement="top"
                      >
                        <IconButton
                          aria-label="Archive Payment"
                          size="sm"
                          variant="ghost"
                          color="gray.600"
                          icon={
                            <ArchiveBoxIcon
                              width={18}
                              height={18}
                            />
                          }
                          onClick={() =>
                            onArchive?.(
                              payment
                            )
                          }
                          _hover={{
                            bg: "orange.50",
                            color: "orange.500",
                          }}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td
                  colSpan={7}
                  textAlign="center"
                  py={10}
                >
                  <Text
                    fontSize="sm"
                    color="gray.500"
                  >
                    No active payments found.
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* VERIFY MODAL */}

      <VerifyPaymentModal
        isOpen={isVerifyOpen}
        onClose={handleVerifyClose}
        payment={selectedPayment}
        onVerified={onReload}
      />

      {/* PAGINATION */}

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
        <Text
          fontSize="xs"
          color="gray.500"
        >
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
          payment
          {totalItems !== 1 ? "s" : ""}
        </Text>

        <HStack spacing={1}>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={
              <ChevronLeftIcon
                width={16}
                height={16}
              />
            }
            isDisabled
            fontSize="xs"
          >
            Previous
          </Button>

          <Button
            size="sm"
            bg="brand.500"
            color="white"
            minW="32px"
            px={3}
            _hover={{
              bg: "brand.600",
            }}
          >
            1
          </Button>

          <Button
            size="sm"
            variant="ghost"
            rightIcon={
              <ChevronRightIcon
                width={16}
                height={16}
              />
            }
            isDisabled
            fontSize="xs"
          >
            Next
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}