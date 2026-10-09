import { useState, type ReactNode } from "react";
import {
  AspectRatio,
  Badge,
  Box,
  Checkbox,
  Flex,
  HStack,
  Icon,
  Image,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import {
  BeakerIcon,
  Cog6ToothIcon,
  CameraIcon,
  MapIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

import type { Vehicle } from "../../api/VehicleManagement/vehicleApi";
import InspectionReportModal from "./Vehicles/InspectionReportModal";
import LoanCalculatorModal from "./Vehicles/LoanCalculatorModal";
import { inspectionColor, monthlyPayment } from "./Vehicles/loan";

const peso = (value?: number | string | null) =>
  `₱${Math.round(Number(value) || 0).toLocaleString("en-PH")}`;

const titleCase = (value?: string | null) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ") : "";

export const vehicleStatus = (status: Vehicle["status"]): string => {
  const raw = typeof status === "object" && status !== null
    ? (status as { value?: unknown }).value
    : status;
  return String(raw ?? "").trim().toLowerCase();
};

const statusStyle: Record<string, { label: string; scheme: string }> = {
  available: { label: "Available", scheme: "green" },
  reserved: { label: "Reserved", scheme: "orange" },
  unavailable: { label: "On hold", scheme: "orange" },
  sold: { label: "Sold", scheme: "gray" },
  maintenance: { label: "In the shop", scheme: "purple" },
};

type Props = {
  vehicle: Vehicle;
  onImageClick?: () => void;
  // Buttons or notes shown at the bottom of the card.
  footer?: ReactNode;
  // Small label over the photo, e.g. "Your reservation".
  ribbon?: string;
  compare?: { selected: boolean; disabled?: boolean; onToggle: () => void };
};

// The listing card used on the public site and in the customer portal.
export default function VehicleCard({ vehicle, onImageClick, footer, ribbon, compare }: Props) {
  const [inspectionOpen, setInspectionOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const badge = vehicle.inspection_badge;
  const price = Number(vehicle.selling_price) || 0;
  const title = [vehicle.year_model, vehicle.brand?.brand, vehicle.model?.model].filter(Boolean).join(" ");
  const status = statusStyle[vehicleStatus(vehicle.status)] ?? { label: "Unknown", scheme: "gray" };
  const photos = vehicle.images ?? [];
  const cover = photos[0]?.image_path;
  const specs = vehicle.specs;

  const facts = [
    specs?.mileage != null && { icon: MapIcon, text: `${Number(specs.mileage).toLocaleString("en-PH")} km` },
    specs?.transmission && { icon: Cog6ToothIcon, text: titleCase(specs.transmission) },
    specs?.fuel_type && { icon: BeakerIcon, text: titleCase(specs.fuel_type) },
  ].filter(Boolean) as { icon: typeof MapIcon; text: string }[];

  return (
    <Flex
      direction="column"
      layerStyle="panel"
      overflow="hidden"
      h="full"
      role="group"
      transition="box-shadow 0.2s ease, transform 0.2s ease"
      _hover={{ boxShadow: "0 10px 24px rgba(16, 24, 40, 0.10)", transform: "translateY(-2px)" }}
    >
      <Box position="relative" bg="gray.100" cursor={onImageClick ? "pointer" : undefined} onClick={onImageClick}>
        <AspectRatio ratio={16 / 10}>
          {cover ? (
            <Image
              src={`/storage/${cover}`}
              alt={`${vehicle.year_model ?? ""} ${vehicle.brand?.brand ?? ""} ${vehicle.model?.model ?? ""}`}
              objectFit="cover"
              transition="transform 0.35s ease"
              _groupHover={{ transform: "scale(1.04)" }}
            />
          ) : (
            <Flex align="center" justify="center" color="gray.400" direction="column" gap={1}>
              <Icon as={PhotoIcon} boxSize={8} />
              <Text fontSize="xs">No photo yet</Text>
            </Flex>
          )}
        </AspectRatio>

        <HStack position="absolute" top={3} left={3} spacing={2}>
          <Badge colorScheme={status.scheme} variant="solid" borderRadius="full" px={2.5} py={0.5} fontSize="10px">
            {status.label}
          </Badge>
          {ribbon && (
            <Badge bg="dark.800" color="white" borderRadius="full" px={2.5} py={0.5} fontSize="10px">
              {ribbon}
            </Badge>
          )}
        </HStack>

        {compare && (
          <Box
            position="absolute"
            top={3}
            right={3}
            bg="whiteAlpha.900"
            borderRadius="md"
            px={2}
            py={1}
            boxShadow="sm"
            onClick={(event) => event.stopPropagation()}
          >
            <Checkbox size="sm" colorScheme="brand" isChecked={compare.selected} isDisabled={compare.disabled && !compare.selected} onChange={compare.onToggle}>
              <Text fontSize="xs" fontWeight="700" color="gray.700">
                Compare
              </Text>
            </Checkbox>
          </Box>
        )}

        {badge?.score != null && (
          <HStack
            as="button"
            position="absolute"
            bottom={3}
            left={3}
            spacing={1}
            bg="white"
            color={`${inspectionColor(badge.score)}.700`}
            px={2}
            py={1}
            borderRadius="full"
            fontSize="11px"
            fontWeight="800"
            boxShadow="md"
            onClick={(event) => {
              event.stopPropagation();
              setInspectionOpen(true);
            }}
            _hover={{ transform: "scale(1.04)" }}
            transition="transform 0.15s"
          >
            <Icon as={ShieldCheckIcon} boxSize={3.5} />
            <Text>Inspected · {badge.score}%</Text>
          </HStack>
        )}

        {photos.length > 0 && (
          <HStack
            position="absolute"
            bottom={3}
            right={3}
            spacing={1}
            bg="blackAlpha.700"
            color="white"
            px={2}
            py={0.5}
            borderRadius="full"
            fontSize="11px"
          >
            <Icon as={CameraIcon} boxSize={3.5} />
            <Text>{photos.length}</Text>
          </HStack>
        )}
      </Box>

      <Stack spacing={3} p={4} flex="1">
        <Box>
          <Text fontWeight="800" fontSize="md" color="dark.900" lineHeight="1.3" noOfLines={1}>
            {vehicle.brand?.brand} {vehicle.model?.model}
          </Text>
          <Text fontSize="sm" color="gray.500" noOfLines={1}>
            {[vehicle.year_model, vehicle.variant?.variant, vehicle.color].filter(Boolean).join(" · ")}
          </Text>
        </Box>

        {facts.length > 0 && (
          <HStack spacing={3} flexWrap="wrap" color="gray.600" fontSize="xs">
            {facts.map((fact) => (
              <HStack key={fact.text} spacing={1}>
                <Icon as={fact.icon} boxSize={4} color="gray.400" />
                <Text>{fact.text}</Text>
              </HStack>
            ))}
          </HStack>
        )}

        {vehicle.description && (
          <Text fontSize="sm" color="gray.600" lineHeight="1.5" noOfLines={2}>
            {vehicle.description}
          </Text>
        )}

        <Flex mt="auto" pt={3} borderTop="1px solid" borderColor="gray.100" justify="space-between" align="flex-end" gap={2}>
          <Box>
            <Text fontSize="xs" color="gray.500">Cash price</Text>
            <Text fontSize="xl" fontWeight="800" color="brand.600" letterSpacing="-0.02em" lineHeight="1.2">
              {peso(vehicle.selling_price)}
            </Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="gray.500">Reserve for</Text>
            <Text fontSize="sm" fontWeight="700" color="dark.800">{peso(vehicle.reservation_price)}</Text>
          </Box>
        </Flex>

        {price > 0 && (
          <Link fontSize="xs" color="gray.600" onClick={() => setLoanOpen(true)} _hover={{ color: "brand.600" }} w="fit-content">
            Financing from <b>{peso(monthlyPayment(price))}/mo</b> · compute
          </Link>
        )}

        {footer && <Box>{footer}</Box>}
      </Stack>

      {badge && <InspectionReportModal isOpen={inspectionOpen} onClose={() => setInspectionOpen(false)} vehicleId={vehicle.id} title={title} />}
      <LoanCalculatorModal isOpen={loanOpen} onClose={() => setLoanOpen(false)} price={price} title={title} />
    </Flex>
  );
}
