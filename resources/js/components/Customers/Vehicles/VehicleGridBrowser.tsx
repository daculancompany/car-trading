import { useEffect, useState } from "react";

import {
  Badge,
  Box,
  Flex,
  HStack,
  Text,
  Heading,
  Icon,
  useDisclosure,
  Tooltip,
  IconButton,
  Button,
  SimpleGrid,
  Skeleton,
} from "@chakra-ui/react";

import {
  EyeIcon,
  CheckCircleIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/solid";

import type { Vehicle } from "../../../api/VehicleManagement/vehicleApi";

import CompareTray from "../../Shared/Vehicles/CompareTray";
import { useCompare } from "../../Shared/Vehicles/compare";
import VehicleCard from "../../Shared/VehicleCard";
import ViewVehicleModal from "./ViewVehicleModal";
import ReservationVehicleModal from "../Reservations/CashReservationModal";
import ReservationPaymentMethodDialog from "../Reservations/ReservationPaymentMethodDialog";
import FinancingReservationModal from "../Reservations/FinancingReservationModal";

interface VehicleTableProps {
  vehicles: Vehicle[];
  loading: boolean;
  onReload: () => void;
}

const normalizeStatus = (status: Vehicle["status"]): string => {
  if (typeof status === "object" && status !== null) {
    const enumStatus = status as { value?: unknown; name?: unknown };

    return String(enumStatus.value ?? enumStatus.name ?? "")
      .trim()
      .toLowerCase();
  }

  return String(status ?? "")
    .trim()
    .toLowerCase();
};

export default function CustomerVehicleGridBrowser({
  vehicles,
  loading,
  onReload,
}: VehicleTableProps) {
  const [selectedVehicle, setSelectedVehicle] =
    useState<Vehicle | null>(null);
  const compare = useCompare();

  // CUSTOMER VEHICLE VISIBILITY

  const customerVehicles = vehicles.filter((vehicle) => {
    const status = normalizeStatus(vehicle.status);

    const isMyReservation =
      vehicle.is_my_reservation === true ||
      String(vehicle.is_my_reservation).toLowerCase() === "true";

    if (status === "available") {
      return true;
    }

    if (
      (status === "reserved" || status === "unavailable") &&
      isMyReservation
    ) {
      return true;
    }

    return false;
  });

  const availableVehiclesCount = customerVehicles.filter(
    (vehicle) => normalizeStatus(vehicle.status) === "available"
  ).length;

  // BACK TO TOP

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // MODALS

  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  const {
    isOpen: isPaymentMethodOpen,
    onOpen: onPaymentMethodOpen,
    onClose: onPaymentMethodClose,
  } = useDisclosure();

  const {
    isOpen: isReserveOpen,
    onOpen: onReserveOpen,
    onClose: onReserveClose,
  } = useDisclosure();

  const {
    isOpen: isFinancingOpen,
    onOpen: onFinancingOpen,
    onClose: onFinancingClose,
  } = useDisclosure();

  // VIEW VEHICLE

  const handleViewVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    onViewOpen();
  };

  // RESERVE VEHICLE

  const handleReserveVehicle = (vehicle: Vehicle) => {
    const isAvailable =
      normalizeStatus(vehicle.status) === "available";

    const isReservable = vehicle.is_reservable !== false;

    if (!isAvailable || !isReservable) {
      return;
    }

    setSelectedVehicle(vehicle);

    onPaymentMethodOpen();
  };

  // SELECT PAYMENT METHOD

  const handlePaymentMethodSelect = (
    paymentMethod: "cash" | "financing"
  ) => {
    onPaymentMethodClose();

    if (paymentMethod === "cash") {
      onReserveOpen();
      return;
    }

    if (paymentMethod === "financing") {
      onFinancingOpen();
    }
  };

  // CLOSE CASH RESERVATION

  const handleReserveClose = () => {
    onReserveClose();

    setSelectedVehicle(null);
  };

  // CLOSE FINANCING RESERVATION

  const handleFinancingClose = () => {
    onFinancingClose();

    setSelectedVehicle(null);
  };

  // UI

  return (
    <Box layerStyle="panel" w="100%" p={{ base: 4, md: 5 }}>
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        gap={2}
        mb={4}
      >
        <Box>
          <Heading size="sm" color="dark.800">Units on the lot</Heading>
          <Text fontSize="sm" color="gray.500" mt={0.5}>
            Tap a photo or View for full details. Reserving holds the unit for 7 days.
          </Text>
        </Box>
        <Badge colorScheme="green" borderRadius="full" px={3} py={1} fontSize="xs">
          {availableVehiclesCount} available
        </Badge>
      </Flex>

      {loading ? (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, "2xl": 4 }} spacing={4}>
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} h="380px" borderRadius="lg" />
          ))}
        </SimpleGrid>
      ) : customerVehicles.length === 0 ? (
        <Flex direction="column" align="center" py={14} color="gray.500" textAlign="center">
          <Text fontWeight="700" color="dark.700">No cars match that search</Text>
          <Text fontSize="sm" mt={1}>Try another brand or clear the search.</Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, "2xl": 4 }} spacing={4}>
          {customerVehicles.map((vehicle) => {
            const status = normalizeStatus(vehicle.status);
            const canReserve = status === "available" && vehicle.is_reservable !== false;
            const isMine =
              vehicle.is_my_reservation === true ||
              String(vehicle.is_my_reservation).toLowerCase() === "true";

            return (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                ribbon={isMine ? "Your reservation" : undefined}
                compare={{
                  selected: compare.ids.includes(vehicle.id),
                  disabled: compare.full,
                  onToggle: () => compare.toggle(vehicle.id),
                }}
                onImageClick={() => handleViewVehicle(vehicle)}
                footer={
                  <HStack spacing={2}>
                    <Button
                      flex="1"
                      size="sm"
                      variant="outline"
                      leftIcon={<Icon as={EyeIcon} boxSize={4} />}
                      onClick={() => handleViewVehicle(vehicle)}
                    >
                      View
                    </Button>
                    <Tooltip
                      label={isMine ? "You already reserved this unit" : "Not available for reservation"}
                      isDisabled={canReserve}
                      hasArrow
                    >
                      <Button
                        flex="1"
                        size="sm"
                        colorScheme="brand"
                        leftIcon={<Icon as={CheckCircleIcon} boxSize={4} />}
                        isDisabled={!canReserve}
                        onClick={() => handleReserveVehicle(vehicle)}
                      >
                        Reserve
                      </Button>
                    </Tooltip>
                  </HStack>
                }
              />
            );
          })}
        </SimpleGrid>
      )}

      {/* VIEW VEHICLE MODAL */}

      <ViewVehicleModal
        isOpen={isViewOpen}
        onClose={() => {
          onViewClose();
          setSelectedVehicle(null);
        }}
        vehicle={selectedVehicle}
      />

      {/* PAYMENT METHOD DIALOG */}

      <ReservationPaymentMethodDialog
        isOpen={isPaymentMethodOpen}
        onClose={onPaymentMethodClose}
        vehicle={selectedVehicle}
        onSelect={handlePaymentMethodSelect}
      />

      {/* CASH RESERVATION MODAL */}

      <ReservationVehicleModal
        isOpen={isReserveOpen}
        onClose={handleReserveClose}
        vehicle={selectedVehicle}
        onSuccess={onReload}
      />

      {/* FINANCING RESERVATION MODAL */}

      <FinancingReservationModal
        isOpen={isFinancingOpen}
        onClose={handleFinancingClose}
        vehicle={selectedVehicle}
      />

      <CompareTray vehicles={customerVehicles} ids={compare.ids} onToggle={compare.toggle} onClear={compare.clear} />

      {/* BACK TO TOP BUTTON */}

      {showBackToTop && (
        <IconButton
          aria-label="Back to top"
          icon={<Icon as={ArrowUpIcon} boxSize={4} />}
          position="fixed"
          bottom={{ base: 5, md: 8 }}
          right={{ base: 5, md: 8 }}
          zIndex={1000}
          size="lg"
          borderRadius="full"
          bg="brand.800"
          color="white"
          _hover={{ bg: "brand.500" }}
          boxShadow="lg"
          onClick={handleBackToTop}
        />
      )}
    </Box>
  );
}