import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

import { useMemo, useState } from "react";

import {
  ArrowRightIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ClockIcon,
  CreditCardIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

import type React from "react";
import type { ReactNode } from "react";

import type { Payment } from "../../../api/PaymentManagement/paymentApi";
import ResubmitPaymentProofModal from "./ResubmitPaymentProofModal";

// Props

interface PaymentTableProps {
  payments: Payment[];
  loading: boolean;
  onReload: () => void;
  onPayBalance: (payment: Payment) => void;
}

// Helpers

const getStatusColor = (
  status: Payment["payment_status"]
) => {
  switch (status) {
    case "pending":
      return "yellow";
    case "verified":
      return "green";
    case "rejected":
      return "red";
    default:
      return "gray";
  }
};

const formatText = (
  value?: string | null
) => {
  if (!value) {
    return "-";
  }
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

const formatDate = (
  date?: string | null
) => {
  if (!date) {
    return "-";
  }
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }
  return parsedDate.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatAmount = (
  amount: string | number
) => {
  return Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: ReactNode;
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: InfoItemProps) => {
  return (
    <HStack
      align="start"
      spacing={2}
      minW={0}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
        color="gray.500"
        borderRadius="md"
        minW="32px"
        h="32px"
      >
        <Icon
          width={17}
          height={17}
        />
      </Box>

      <Box minW={0}>
        <Text
          fontSize="10px"
          fontWeight="semibold"
          color="gray.500"
          textTransform="uppercase"
          letterSpacing="wide"
        >
          {label}
        </Text>

        <Text
          fontSize="sm"
          fontWeight="medium"
          color="gray.800"
          noOfLines={2}
          wordBreak="break-word"
        >
          {value || "-"}
        </Text>
      </Box>
    </HStack>
  );
};

// Component

export default function CustomerPaymentTable({
  payments,
  loading,
  onReload,
  onPayBalance,
}: PaymentTableProps) {
  const {
    isOpen: isResubmitOpen,
    onOpen: onResubmitOpen,
    onClose: onResubmitClose,
  } = useDisclosure();

  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  const latestPaymentByTransaction = useMemo(() => {
    const map = new Map<
      string,
      Payment
    >();

    [...payments]
      .sort((first, second) => {
        const firstDate = new Date(
          first.payment_date ??
          first.created_at ??
          ""
        ).getTime();

        const secondDate = new Date(
          second.payment_date ??
          second.created_at ??
          ""
        ).getTime();

        return (
          secondDate - firstDate ||
          second.id - first.id
        );
      })
      .forEach((payment) => {
        const key = [
          payment.reservation_id,
          payment.payment_type,
        ].join("-");

        if (!map.has(key)) {
          map.set(key, payment);
        }
      });

    return map;
  }, [payments]);

  // Rejected payments that STILL require action
  //
  // If a newer payment exists for the same reservation/type,
  // the old rejected payment no longer triggers the alert.

  const rejectedPayments = useMemo(() => {
    return payments.filter((payment) => {
      if (
        payment.payment_status !==
        "rejected"
      ) {
        return false;
      }

      const key = [
        payment.reservation_id,
        payment.payment_type,
      ].join("-");

      const latestPayment =
        latestPaymentByTransaction.get(key);

      return (
        latestPayment?.id === payment.id
      );
    });
  }, [
    payments,
    latestPaymentByTransaction,
  ]);

  // Verified balance payments
  //
  // Only show if the reservation does NOT already have a
  // verified full payment.

  const verifiedBalancePayments = useMemo(() => {
    return payments.filter((payment) => {
      if (
        payment.payment_status !==
        "verified"
      ) {
        return false;
      }

      if (
        payment.payment_type !==
        "reservation_fee" &&
        payment.payment_type !==
        "partial_payment"
      ) {
        return false;
      }

      const hasVerifiedFullPayment =
        payments.some(
          (otherPayment) =>
            otherPayment.reservation_id ===
            payment.reservation_id &&
            otherPayment.payment_type ===
            "full_payment" &&
            otherPayment.payment_status ===
            "verified"
        );

      return !hasVerifiedFullPayment;
    });
  }, [payments]);

  // Verified full payments
  //
  // Only keep the latest verified full payment for each
  // reservation.

  const verifiedFullPayments = useMemo(() => {
    const seenReservations =
      new Set<number>();

    return [...payments]
      .filter(
        (payment) =>
          payment.payment_status ===
          "verified" &&
          payment.payment_type ===
          "full_payment"
      )
      .sort((first, second) => {
        const firstDate = new Date(
          first.payment_date ??
          first.created_at ??
          ""
        ).getTime();

        const secondDate = new Date(
          second.payment_date ??
          second.created_at ??
          ""
        ).getTime();

        return (
          secondDate - firstDate ||
          second.id - first.id
        );
      })
      .filter((payment) => {
        if (
          seenReservations.has(
            payment.reservation_id
          )
        ) {
          return false;
        }

        seenReservations.add(
          payment.reservation_id
        );

        return true;
      });
  }, [payments]);

  // Resubmit

  const handleResubmit = (
    payment: Payment
  ) => {
    setSelectedPayment(payment);
    onResubmitOpen();
  };

  // Render

  return (
    <Box
      layerStyle="panel"
      p={{ base: 4, md: 5 }}
      overflow="hidden"
      mt={0}
    >
      {/* HEADER */}

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
        gap={3}
        mb={5}
      >
        <HStack spacing={3}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="red.50"
            color="red.500"
            borderRadius="lg"
            w="42px"
            h="42px"
          >
            <CreditCardIcon
              width={23}
              height={23}
            />
          </Box>

          <Box>
            <Heading
              size={{
                base: "sm",
                md: "md",
              }}
              color="gray.800"
            >
              My Payment Transactions
            </Heading>

            <Text
              fontSize={{
                base: "xs",
                md: "sm",
              }}
              color="gray.500"
              mt={1}
            >
              View your payment history and
              verification status.
            </Text>
          </Box>
        </HStack>

        <Badge
          colorScheme="blue"
          borderRadius="full"
          px={3}
          py={1}
          fontSize="xs"
        >
          {payments.length} Transactions
        </Badge>
      </Flex>

      {/* COMPACT ALERTS */}

      {rejectedPayments.length > 0 && (
        <Alert
          status="error"
          mb={3}
          borderRadius="md"
          py={2}
          px={3}
          width="fit-content"
          maxW="100%"
          alignItems="center"
        >
          <AlertIcon
            boxSize={4}
            mr={2}
          />

          <Box>
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="red.800"
            >
              Payment action required
            </Text>

            <Text
              color="red.700"
              fontSize="xs"
            >
              {rejectedPayments.length} payment
              {rejectedPayments.length !== 1
                ? "s were"
                : " was"}{" "}
              rejected. Please resubmit
              the payment proof.
            </Text>
          </Box>
        </Alert>
      )}

      {verifiedBalancePayments.length >
        0 && (
          <Alert
            status="success"
            mb={3}
            borderRadius="md"
            py={2}
            px={3}
            width="fit-content"
            maxW="100%"
            alignItems="center"
          >
            <AlertIcon
              boxSize={4}
              mr={2}
            />

            <Box>
              <Text
                fontSize="xs"
                fontWeight="bold"
                color="green.800"
              >
                Payment verified
              </Text>

              <Text
                color="green.700"
                fontSize="xs"
              >
                Your payment was verified.
                Please continue with the
                remaining balance.
              </Text>
            </Box>
          </Alert>
        )}

      {verifiedFullPayments.length >
        0 && (
          <Alert
            status="success"
            mb={3}
            borderRadius="md"
            py={2}
            px={3}
            width="fit-content"
            maxW="100%"
            alignItems="center"
          >
            <AlertIcon
              boxSize={4}
              mr={2}
            />

            <Box>
              <Text
                fontSize="xs"
                fontWeight="bold"
                color="green.800"
              >
                Vehicle ready for release
              </Text>

              <Text
                color="green.700"
                fontSize="xs"
              >
                Your full payment was verified.
                Please coordinate with CDO Car
                Trading for vehicle release.
              </Text>
            </Box>
          </Alert>
        )}

      {/* LOADING */}

      {loading ? (
        <Box
          textAlign="center"
          py={12}
          color="gray.500"
        >
          <VStack spacing={3}>
            <ClockIcon
              width={32}
              height={32}
            />

            <Text fontSize="sm">
              Loading payments...
            </Text>
          </VStack>
        </Box>
      ) : payments.length === 0 ? (
        // EMPTY STATE

        <Box
          textAlign="center"
          py={12}
          border="1px dashed"
          borderColor="gray.300"
          borderRadius="xl"
        >
          <VStack spacing={3}>
            <DocumentTextIcon
              width={40}
              height={40}
            />

            <Text
              fontSize="sm"
              color="gray.500"
            >
              No payment transactions found.
            </Text>
          </VStack>
        </Box>
      ) : (
        // PAYMENT CARDS

        <Grid
          templateColumns={{
            base: "1fr",
            lg: "repeat(2, minmax(0, 1fr))",
          }}
          gap={4}
        >
          {payments.map(
            (payment) => {
              const vehicleName = [
                payment.reservation
                  ?.vehicle?.brand?.brand,
                payment.reservation
                  ?.vehicle?.model?.model,
                payment.reservation
                  ?.vehicle?.variant?.variant,
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <Box
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  overflow="hidden"
                  transition="all 0.2s"
                  _hover={{
                    borderColor:
                      "red.200",
                    boxShadow: "md",
                    transform:
                      "translateY(-2px)",
                  }}
                >
                  {/* CARD HEADER */}

                  <Flex
                    bg="gray.50"
                    px={4}
                    py={3}
                    justify="space-between"
                    align="center"
                    gap={2}
                  >
                    <Badge
                      colorScheme={getStatusColor(
                        payment.payment_status
                      )}
                      borderRadius="full"
                      px={3}
                      py={1}
                      fontSize="xs"
                      textTransform="capitalize"
                    >
                      {formatText(
                        payment.payment_status
                      )}
                    </Badge>
                  </Flex>

                  {/* CARD BODY */}

                  <Box
                    px={4}
                    py={4}
                  >
                    <VStack
                      align="stretch"
                      spacing={4}
                    >
                      {/* AMOUNT */}

                      <Box
                        bg="red.50"
                        borderRadius="lg"
                        px={4}
                        py={3}
                      >
                        <Text
                          fontSize="xs"
                          color="red.600"
                          fontWeight="semibold"
                        >
                          PAYMENT AMOUNT
                        </Text>

                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="red.600"
                        >
                          ₱
                          {formatAmount(
                            payment.amount
                          )}
                        </Text>
                      </Box>

                      {/* VEHICLE */}

                      <Box>
                        <HStack
                          spacing={2}
                          mb={2}
                        >
                          <TruckIcon
                            width={18}
                            height={18}
                          />

                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.700"
                          >
                            Reservation Vehicle
                          </Text>
                        </HStack>

                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {vehicleName ||
                            "Vehicle unavailable"}
                        </Text>

                        <Text
                          fontSize="xs"
                          color="gray.500"
                          mt={1}
                        >
                          Reservation #
                          {
                            payment.reservation_id
                          }
                        </Text>
                      </Box>

                      {/* INFO */}

                      <Grid
                        templateColumns={{
                          base: "1fr",
                          sm: "repeat(2, 1fr)",
                        }}
                        gap={4}
                      >
                        <InfoItem
                          icon={
                            BanknotesIcon
                          }
                          label="Payment Type"
                          value={formatText(
                            payment.payment_type
                          )}
                        />

                        <InfoItem
                          icon={
                            CreditCardIcon
                          }
                          label="Payment Method"
                          value={formatText(
                            payment.payment_method
                          )}
                        />

                        <InfoItem
                          icon={
                            DocumentTextIcon
                          }
                          label="Reference Number"
                          value={
                            payment.reference_number ||
                            "-"
                          }
                        />

                        <InfoItem
                          icon={
                            CalendarDaysIcon
                          }
                          label="Payment Date"
                          value={formatDate(
                            payment.payment_date
                          )}
                        />
                      </Grid>
                    </VStack>
                  </Box>

                  {/* CARD FOOTER */}

                  <Box
                    borderTop="1px solid"
                    borderColor="gray.100"
                    px={4}
                    py={3}
                  >
                    <Flex
                      direction={{
                        base: "column",
                        sm: "row",
                      }}
                      justify="space-between"
                      align={{
                        base: "stretch",
                        sm: "center",
                      }}
                      gap={3}
                    >
                      <HStack
                        spacing={2}
                        color="gray.500"
                      >
                        <InformationCircleIcon
                          width={16}
                          height={16}
                        />

                        <Text fontSize="xs">
                          {payment.payment_status ===
                            "pending"
                            ? "Waiting for staff verification"
                            : payment.payment_status ===
                              "rejected"
                              ? "Payment proof rejected"
                              : payment.payment_type ===
                                "full_payment"
                                ? "Vehicle ready for release"
                                : "Payment verified - balance due"}
                        </Text>
                      </HStack>

                      {/* ACTION */}

                      {payment.payment_status ===
                        "rejected" ? (
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() =>
                            handleResubmit(
                              payment
                            )
                          }
                        >
                          Resubmit Proof
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={
                            <ArrowRightIcon
                              width={16}
                              height={16}
                            />
                          }
                          onClick={() =>
                            onPayBalance(
                              payment
                            )
                          }
                          isDisabled={
                            payment.payment_status !==
                            "verified"
                          }
                        >
                          Pay Balance
                        </Button>
                      )}
                    </Flex>
                  </Box>
                </Box>
              );
            }
          )}
        </Grid>
      )}

      {/* RESUBMIT PAYMENT MODAL */}

      <ResubmitPaymentProofModal
        isOpen={isResubmitOpen}
        onClose={onResubmitClose}
        payment={selectedPayment}
        onSubmitted={onReload}
      />
    </Box>
  );
}