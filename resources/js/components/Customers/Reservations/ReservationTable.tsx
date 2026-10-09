import { useEffect, useState } from "react";

import {
  HStack,
  Alert,
  AlertIcon,
  AspectRatio,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  useDisclosure,
  Image,
} from "@chakra-ui/react";

import {
  EyeIcon,
  CreditCardIcon,
  BanknotesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import {
  type Reservation,
} from "../../../api/ReservationManagement/reservationApi";

import ViewReservationModal from "./ViewReservationModal";
import PaymentModal from "../Payments/PaymentModal";
import FinancingPaymentModal from "../Financings/FinancingPaymentModal";
import FinancingModal from "../Financings/FinancingModal";
import CancelReservationDialog from "./DeleteReservationDialog";
import ResubmitReservationIdModal from "./ResubmitReservationIdModal";

interface ReservationTableProps {
  reservations: Reservation[];
  loading: boolean;
  onReload: () => void;
  openFinancingReservationId?: number | null;
  onFinancingReservationOpened?: () => void;
  openPaymentReservationId?: number | null;
  onPaymentReservationOpened?: () => void;
  openFinancingPaymentReservationId?: number | null;
  onFinancingPaymentReservationOpened?: () => void;
}

export default function CustomerReservationTable({
  reservations,
  loading,
  onReload,
  openFinancingReservationId,
  onFinancingReservationOpened,
  openPaymentReservationId,
  onPaymentReservationOpened,
  openFinancingPaymentReservationId,
  onFinancingPaymentReservationOpened,
}: ReservationTableProps) {
  // Modals

  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const {
    isOpen: isPaymentOpen,
    onOpen: onPaymentOpen,
    onClose: onPaymentClose,
  } = useDisclosure();

  const {
    isOpen: isFinancingPaymentOpen,
    onOpen: onFinancingPaymentOpen,
    onClose: onFinancingPaymentClose,
  } = useDisclosure();

  const {
    isOpen: isFinancingOpen,
    onOpen: onFinancingOpen,
    onClose: onFinancingClose,
  } = useDisclosure();

  const {
    isOpen: isResubmitOpen,
    onOpen: onResubmitOpen,
    onClose: onResubmitClose,
  } = useDisclosure();

  // Selected Reservation

  const [
    selectedReservation,
    setSelectedReservation,
  ] = useState<Reservation | null>(null);

  // Payment Alert State
  // Keeps track of reservations whose payment was successfully submitted.
  // This makes the "Payment is ready" alert disappear immediately after
  // a successful payment transaction.

  const [
    completedPaymentAlerts,
    setCompletedPaymentAlerts,
  ] = useState<Set<number>>(new Set());

  // Actions

  const handleView = (
    reservation: Reservation
  ) => {
    setSelectedReservation(reservation);
    onViewOpen();
  };

  const handlePayment = (
    reservation: Reservation
  ) => {
    setSelectedReservation(reservation);
    onPaymentOpen();
  };

  // Payment Successfully Submitted

  const handlePaymentPaid = () => {
    if (selectedReservation?.id) {
      setCompletedPaymentAlerts((previous) => {
        const next = new Set(previous);

        next.add(selectedReservation.id);

        return next;
      });
    }

    onReload();
  };

  const handleFinancingPayment = (
    reservation: Reservation
  ) => {
    setSelectedReservation(reservation);
    onFinancingPaymentOpen();
  };

  const handleFinancing = (
    reservation: Reservation
  ) => {
    setSelectedReservation(reservation);
    onFinancingOpen();
  };

  const handleDelete = (
    reservation: Reservation
  ) => {
    setSelectedReservation(reservation);
    onDeleteOpen();
  };

  const handleResubmit = (
    reservation: Reservation
  ) => {
    setSelectedReservation(reservation);
    onResubmitOpen();
  };

  // Open Financing Automatically

  useEffect(() => {
    if (!openFinancingReservationId) return;

    const reservation = reservations.find(
      (item) => item.id === openFinancingReservationId
    );

    if (!reservation) return;

    setSelectedReservation(reservation);
    onFinancingOpen();
    onFinancingReservationOpened?.();
  }, [
    openFinancingReservationId,
    reservations,
    onFinancingOpen,
    onFinancingReservationOpened,
  ]);

  // Open Financing Payment Automatically

  useEffect(() => {
    if (!openFinancingPaymentReservationId) return;

    const reservation = reservations.find(
      (item) =>
        item.id === openFinancingPaymentReservationId
    );

    if (!reservation) return;

    setSelectedReservation(reservation);
    onFinancingPaymentOpen();
    onFinancingPaymentReservationOpened?.();
  }, [
    openFinancingPaymentReservationId,
    reservations,
    onFinancingPaymentOpen,
    onFinancingPaymentReservationOpened,
  ]);

  // Open Payment Automatically

  useEffect(() => {
    if (!openPaymentReservationId) return;

    const reservation = reservations.find(
      (item) => item.id === openPaymentReservationId
    );

    if (!reservation) return;

    setSelectedReservation(reservation);
    onPaymentOpen();
    onPaymentReservationOpened?.();
  }, [
    openPaymentReservationId,
    reservations,
    onPaymentOpen,
    onPaymentReservationOpened,
  ]);

  // Reservation ID Resubmission

  const reservationsNeedingResubmission =
    reservations.filter(
      (reservation) =>
        reservation.valid_id_front_status === "resubmit" ||
        reservation.valid_id_back_status === "resubmit"
    );

  // Reservation Status Color

  const getStatusColor = (
    status: Reservation["reservation_status"]
  ) => {
    switch (status) {
      case "pending_reservation":
        return "yellow";
      case "pending_documents":
        return "purple";
      case "pending_financing":
        return "cyan";
      case "pending_payment":
        return "orange";
      case "reserved":
        return "blue";
      case "completed":
        return "green";
      case "rejected":
      case "cancelled":
        return "red";
      case "expired":
        return "gray";
      default:
        return "gray";
    }
  };

  // Format Status

  const formatStatus = (
    status: string
  ) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  // Cash Payment Eligibility

  const canPay = (
    reservation: Reservation
  ) => {
    return (
      reservation.purchase_option === "cash" &&
      (
        reservation.reservation_status === "reserved" ||
        reservation.reservation_status === "pending_payment"
      )
    );
  };

  // Financing Payment Eligibility

  const canPayFinancing = (
    reservation: Reservation
  ) =>
    reservation.purchase_option === "financing" &&
    reservation.reservation_status === "pending_payment";

  // Financing Eligibility

  const canFinance = (
    reservation: Reservation
  ) => {
    return (
      reservation.purchase_option === "financing" &&
      (
        reservation.reservation_status ===
        "pending_reservation" ||
        reservation.reservation_status ===
        "pending_financing"
      )
    );
  };

  // Payment Alerts
  // Only show reservations that:
  // 1. Are eligible for payment
  // 2. Have not already successfully submitted payment

  const cashPaymentsRequired =
    reservations.filter(
      (reservation) =>
        canPay(reservation) &&
        !completedPaymentAlerts.has(reservation.id)
    );

  // UI

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
            My Reservations
          </Heading>

          <Text
            fontSize={{
              base: "xs",
              md: "sm",
            }}
            color="gray.500"
            mt={1}
          >
            View your reservations,
            payment status, and vehicle
            reservation progress.
          </Text>
        </Box>

        <Badge
          color="brand.600"
          borderRadius="full"
          px={3}
          py={2}
          fontSize="sm"
        >
          {reservations.length} Reservations
        </Badge>
      </Flex>

      {/* CONTENT */}

      {loading ? (
        <Flex
          justify="center"
          align="center"
          py={10}
        >
          <Text color="gray.500">
            Loading reservations...
          </Text>
        </Flex>
      ) : reservations.length === 0 ? (
        <Flex
          justify="center"
          align="center"
          py={10}
        >
          <Text color="gray.500">
            No reservations found.
          </Text>
        </Flex>
      ) : (
        <>
          {/* COMPACT PAYMENT ALERT */}

          {cashPaymentsRequired.length > 0 && (
            <Box
              mb={4}
              display="flex"
              flexWrap="wrap"
              gap={2}
            >
              {cashPaymentsRequired.map(
                (reservation) => (
                  <Alert
                    key={reservation.id}
                    status="info"
                    width="fit-content"
                    maxW="100%"
                    minW="0"
                    py={2}
                    px={3}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="blue.100"
                    bg="blue.50"
                    alignItems="center"
                    boxShadow="none"
                  >
                    <AlertIcon
                      boxSize={4}
                      mr={2}
                    />

                    <Flex
                      align="center"
                      gap={3}
                      flexWrap="wrap"
                    >
                      <Text
                        fontSize="xs"
                        fontWeight="medium"
                        color="blue.800"
                      >
                        payment is ready.
                      </Text>

                      <Button
                        size="xs"
                        colorScheme="blue"
                        leftIcon={
                          <CreditCardIcon
                            width={13}
                            height={13}
                          />
                        }
                        onClick={() =>
                          handlePayment(reservation)
                        }
                      >
                        Pay Now
                      </Button>
                    </Flex>
                  </Alert>
                )
              )}
            </Box>
          )}

          {/* DOCUMENT RESUBMISSION ALERT */}

          {reservationsNeedingResubmission.length >
            0 && (
              <Box
                mb={4}
                p={{ base: 3, md: 4 }}
                bg="orange.50"
                border="1px solid"
                borderColor="orange.200"
                borderRadius="md"
              >
                <Flex
                  direction={{
                    base: "column",
                    md: "row",
                  }}
                  justify="space-between"
                  align={{
                    base: "stretch",
                    md: "center",
                  }}
                  gap={3}
                >
                  <Box>
                    <Heading
                      size="xs"
                      color="orange.800"
                    >
                      Document resubmission required
                    </Heading>

                    <Text
                      color="orange.700"
                      fontSize="xs"
                      mt={1}
                    >
                      Staff reviewed one or more of your
                      reservation IDs. Please upload a
                      replacement document to continue.
                    </Text>
                  </Box>

                  <VStack
                    align="stretch"
                    spacing={2}
                    minW={{
                      md: "260px",
                    }}
                  >
                    {reservationsNeedingResubmission.map(
                      (reservation) => {
                        const sides = [
                          reservation.valid_id_front_status ===
                          "resubmit" &&
                          "Front",

                          reservation.valid_id_back_status ===
                          "resubmit" &&
                          "Back",
                        ]
                          .filter(Boolean)
                          .join(" & ");

                        return (
                          <Button
                            key={reservation.id}
                            size="xs"
                            colorScheme="orange"
                            variant="solid"
                            onClick={() =>
                              handleResubmit(
                                reservation
                              )
                            }
                          >
                            RES-{String(reservation.id).padStart(3, "0")}: Replace{" "}
                            {sides} ID
                          </Button>
                        );
                      }
                    )}
                  </VStack>
                </Flex>
              </Box>
            )}

          {/* CARD GRID */}

          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)",
            }}
            gap={4}
          >
            {reservations.map(
              (reservation) => (
                <Box
                  key={reservation.id}
                  layerStyle="panel"
                  overflow="hidden"
                  transition="all 0.2s"
                  _hover={{
                    borderColor: "brand.300",
                    boxShadow: "md",
                    transform:
                      "translateY(-2px)",
                  }}
                >
                  {/* PHOTO + STATUS */}

                  <Box position="relative" bg="gray.100">
                    <AspectRatio ratio={16 / 9}>
                      {(reservation.vehicle as any)?.images?.[0]?.image_path ? (
                        <Image
                          src={`/storage/${(reservation.vehicle as any).images[0].image_path}`}
                          alt=""
                          objectFit="cover"
                        />
                      ) : (
                        <Box />
                      )}
                    </AspectRatio>
                    <Flex position="absolute" top={3} left={3} right={3} justify="space-between" align="center">
                      <Badge
                        colorScheme={getStatusColor(reservation.reservation_status)}
                        variant="solid"
                        borderRadius="full"
                        px={2.5}
                        fontSize="10px"
                      >
                        {formatStatus(reservation.reservation_status)}
                      </Badge>
                      <Badge bg="blackAlpha.700" color="white" borderRadius="full" px={2.5} fontSize="10px">
                        RES-{String(reservation.id).padStart(3, "0")}
                      </Badge>
                    </Flex>
                  </Box>

                  {/* CARD BODY */}

                  <Box p={4}>
                    <VStack
                      align="stretch"
                      spacing={4}
                    >
                      {/* VEHICLE */}

                      <Box>
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          fontWeight="medium"
                          mb={1}
                        >
                          VEHICLE
                        </Text>

                        <Text
                          fontSize="md"
                          fontWeight="bold"
                          color="gray.800"
                          noOfLines={2}
                        >
                          {[
                            reservation.vehicle?.brand
                              ?.brand,

                            reservation.vehicle?.model
                              ?.model,

                            reservation.vehicle?.variant
                              ?.variant,
                          ]
                            .filter(Boolean)
                            .join(" ") || "-"}
                        </Text>
                      </Box>

                      {/* VEHICLE INFO */}

                      <Flex
                        justify="space-between"
                        gap={3}
                      >
                        <Box flex={1}>
                          <Text
                            fontSize="xs"
                            color="gray.500"
                          >
                            Stock No.
                          </Text>

                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                          >
                            {reservation.vehicle
                              ?.stock_no ?? "-"}
                          </Text>
                        </Box>

                        <Box flex={1}>
                          <Text
                            fontSize="xs"
                            color="gray.500"
                          >
                            Year
                          </Text>

                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                          >
                            {reservation.vehicle
                              ?.year_model ?? "-"}
                          </Text>
                        </Box>
                      </Flex>

                      {/* RESERVATION DATE */}

                      <Box>
                        <Text
                          fontSize="xs"
                          color="gray.500"
                        >
                          Reservation Date
                        </Text>

                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          {reservation.reserved_at
                            ? new Date(
                              reservation.reserved_at
                            ).toLocaleDateString(
                              "en-PH",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                            : "-"}
                        </Text>
                      </Box>

                      {/* EXPIRATION DATE */}

                      <Box>
                        <Text
                          fontSize="xs"
                          color="gray.500"
                        >
                          Expiration Date
                        </Text>

                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          {reservation.expires_at
                            ? new Date(
                              reservation.expires_at
                            ).toLocaleDateString(
                              "en-PH",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                            : "-"}
                        </Text>
                      </Box>
                    </VStack>
                  </Box>

                  <Flex
                    mx={4}
                    mb={4}
                    pt={3}
                    borderTop="1px solid"
                    borderColor="gray.100"
                    align="center"
                    justify="space-between"
                    gap={2}
                    wrap="wrap"
                  >
                    <HStack spacing={1}>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="gray"
                        color="gray.700"
                        leftIcon={<EyeIcon width={16} height={16} />}
                        onClick={() => handleView(reservation)}
                      >
                        View
                      </Button>

                      {!["reserved", "completed", "cancelled", "expired", "rejected"].includes(reservation.reservation_status) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          leftIcon={<XMarkIcon width={16} height={16} />}
                          onClick={() => handleDelete(reservation)}
                        >
                          Cancel
                        </Button>
                      )}
                    </HStack>

                    <HStack spacing={2}>
                      {canFinance(reservation) && (
                        <Button
                          size="sm"
                          colorScheme="purple"
                          variant={canPay(reservation) || canPayFinancing(reservation) ? "outline" : "solid"}
                          leftIcon={<BanknotesIcon width={16} height={16} />}
                          onClick={() => handleFinancing(reservation)}
                        >
                          Financing
                        </Button>
                      )}

                      {canPayFinancing(reservation) && (
                        <Button
                          size="sm"
                          colorScheme="teal"
                          leftIcon={<CreditCardIcon width={16} height={16} />}
                          onClick={() => handleFinancingPayment(reservation)}
                        >
                          Full Payment
                        </Button>
                      )}

                      {canPay(reservation) && (
                        <Button
                          size="sm"
                          colorScheme="teal"
                          px={4}
                          leftIcon={<CreditCardIcon width={16} height={16} />}
                          onClick={() => handlePayment(reservation)}
                        >
                          Make Payment
                        </Button>
                      )}
                    </HStack>
                  </Flex>
                </Box>
              )
            )}
          </Grid>
        </>
      )}

      {/* MODALS */}

      <ViewReservationModal
        isOpen={isViewOpen}
        onClose={onViewClose}
        reservation={selectedReservation}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={onPaymentClose}
        reservation={selectedReservation}
        onPaid={handlePaymentPaid}
      />

      <FinancingPaymentModal
        isOpen={isFinancingPaymentOpen}
        onClose={onFinancingPaymentClose}
        reservation={selectedReservation}
        onPaid={onReload}
      />

      <FinancingModal
        isOpen={isFinancingOpen}
        onClose={onFinancingClose}
        reservationId={
          selectedReservation?.id ?? 0
        }
      />

      <CancelReservationDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        reservation={selectedReservation}
        onCancelled={onReload}
      />

      <ResubmitReservationIdModal
        isOpen={isResubmitOpen}
        onClose={onResubmitClose}
        reservation={selectedReservation}
        onSubmitted={onReload}
      />
    </Box>
  );
}