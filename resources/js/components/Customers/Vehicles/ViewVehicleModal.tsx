import type { ReactNode } from "react";

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";

import {
  Cog6ToothIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  PhotoIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

import type { Vehicle } from "../../../api/VehicleManagement/vehicleApi";

interface ViewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

const getVehicleName = (vehicle: Vehicle | null) => {
  if (!vehicle) return "No vehicle selected";

  return (
    [
      vehicle.brand?.brand,
      vehicle.model?.model,
      vehicle.variant?.variant,
    ]
      .filter(Boolean)
      .join(" / ") || "Vehicle details unavailable"
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <Box>
    <Text fontSize="xs" fontWeight="700" color="gray.500" mb={1}>
      {label}
    </Text>

    <Text fontSize="sm" fontWeight="700" color="gray.800">
      {value || "-"}
    </Text>
  </Box>
);

const SectionTitle = ({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) => (
  <HStack spacing={2} mb={4}>
    {icon}
    <Text fontSize="sm" fontWeight="800" color="gray.800">
      {title}
    </Text>
  </HStack>
);

export default function CustomerViewVehicleModal({
  isOpen,
  onClose,
  vehicle,
}: ViewVehicleModalProps) {
  if (!vehicle) return null;

  const money = (value?: number | string) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(Number(value ?? 0));

  const status = vehicle.status?.toLowerCase() ?? "unknown";

  const statusColor =
    status === "available"
      ? "green"
      : status === "reserved"
        ? "orange"
        : status === "sold"
          ? "blue"
          : status === "maintenance"
            ? "red"
            : "gray";

  const formattedStatus =
    status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.600" />

      <ModalContent
        mx={4}
        maxH="90vh"
        overflow="hidden"
        borderRadius="md"
        bg="white"
        boxShadow="1xl"
      >
        <ModalHeader
          px={6}
          py={5}
          bg="dark.50"
          color="white"
          borderBottom="1px solid"
          borderColor="whiteAlpha.300"
        >
          <HStack spacing={3} align="center">
            <Box p={2} borderRadius="lg">
              <Icon
                as={TruckIcon}
                boxSize={6}
                color="brand.700"
              />
            </Box>

            <Box>
              <Text
                fontSize="md"
                fontWeight="800"
                color="dark.900"
              >
                Vehicle Details
              </Text>

              <Text
                fontSize="xs"
                fontWeight="500"
                color="gray.500"
              >
                CDO Car Trading • Vehicle Information
              </Text>
            </Box>
          </HStack>
        </ModalHeader>

        <ModalCloseButton
          color="brand.700"
          top={4}
          right={4}
          _hover={{ bg: "gray.100" }}
        />

        <ModalBody
          px={{ base: 4, md: 6 }}
          py={6}
          overflowY="auto"
          maxH="calc(90vh - 150px)"
          sx={{
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              background: "var(--chakra-colors-gray-300)",
              borderRadius: "full",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
          }}
        >
          <Stack spacing={6}>
            <Box p={5} borderRadius="md" bg="gray.50">
              <HStack
                justify="space-between"
                align="start"
                mb={3}
              >
                <HStack spacing={2}>
                  <Icon
                    as={TruckIcon}
                    boxSize={5}
                    color="brand.700"
                  />

                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.600"
                  >
                    Selected Vehicle
                  </Text>
                </HStack>

                <Badge
                  colorScheme={statusColor}
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  {formattedStatus}
                </Badge>
              </HStack>

              <Text
                fontSize="md"
                fontWeight="800"
                color="gray.800"
              >
                {getVehicleName(vehicle)}
              </Text>

              <HStack
                mt={2}
                spacing={2}
                color="gray.600"
                fontSize="xs"
                flexWrap="wrap"
              >
                <Text>{vehicle.year_model}</Text>

                {vehicle.color && (
                  <>
                    <Text>•</Text>
                    <Text>{vehicle.color}</Text>
                  </>
                )}

                {vehicle.specs?.plate_number && (
                  <>
                    <Text>•</Text>
                    <Text>{vehicle.specs.plate_number}</Text>
                  </>
                )}
              </HStack>
            </Box>

            <Box>
              <SectionTitle
                icon={
                  <Icon
                    as={InformationCircleIcon}
                    boxSize={5}
                    color="brand.700"
                  />
                }
                title="Vehicle Information"
              />

              <Stack spacing={4}>

                <DetailItem
                  label="Stock No."
                  value={vehicle.stock_no}
                />
                <DetailItem
                  label="Description"
                  value={vehicle.description || "-"}
                />
                <DetailItem
                  label="Features"
                  value={vehicle.features || "-"}
                />
              </Stack>
            </Box>

            <Box>
              <SectionTitle
                icon={
                  <Icon
                    as={Cog6ToothIcon}
                    boxSize={5}
                    color="brand.700"
                  />
                }
                title="Vehicle Specifications"
              />

              <SimpleGrid
                columns={{ base: 1, md: 2 }}
                spacing={5}
              >
                <DetailItem
                  label="Mileage"
                  value={vehicle.specs?.mileage}
                />
                <DetailItem
                  label="Fuel Type"
                  value={vehicle.specs?.fuel_type}
                />
                <DetailItem
                  label="Transmission"
                  value={vehicle.specs?.transmission}
                />
              </SimpleGrid>
            </Box>

            <Box>
              <SectionTitle
                icon={
                  <Icon
                    as={CurrencyDollarIcon}
                    boxSize={5}
                    color="brand.700"
                  />
                }
                title="Vehicle Pricing"
              />

              <Box p={4} borderRadius="md" bg="brand.50">
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacing={4}
                >
                  <DetailItem
                    label="Selling Price"
                    value={money(vehicle.selling_price)}
                  />
                  <DetailItem
                    label="Reservation Price"
                    value={money(
                      vehicle.reservation_price,
                    )}
                  />
                </SimpleGrid>
              </Box>
            </Box>

            <Box>
              <SectionTitle
                icon={
                  <Icon
                    as={PhotoIcon}
                    boxSize={5}
                    color="brand.700"
                  />
                }
                title="Vehicle Images"
              />

              {vehicle.images && vehicle.images.length > 0 ? (
                <SimpleGrid
                  columns={{ base: 1, sm: 2 }}
                  spacing={4}
                >
                  {vehicle.images.map((image) => (
                    <Box
                      key={image.id}
                      overflow="hidden"
                      borderRadius="md"
                      bg="gray.100"
                    >
                      <Image
                        src={`/storage/${image.image_path}`}
                        width="100%"
                        height="180px"
                        objectFit="cover"
                        transition="transform 0.2s ease"
                        _hover={{
                          transform: "scale(1.03)",
                        }}
                        fallback={
                          <Flex
                            height="180px"
                            align="center"
                            justify="center"
                          >
                            <Text
                              fontSize="xs"
                              color="gray.500"
                            >
                              Image unavailable
                            </Text>
                          </Flex>
                        }
                      />
                    </Box>
                  ))}
                </SimpleGrid>
              ) : (
                <Text fontSize="sm" color="gray.500">
                  No images uploaded.
                </Text>
              )}
            </Box>
          </Stack>
        </ModalBody>

        <ModalFooter
          px={{ base: 4, md: 6 }}
          py={4}
          borderTop="1px solid"
          borderColor="brand.100"
          bg="white"
          gap={3}
        >
          <Button
            variant="ghost"
            colorScheme="gray"
            onClick={onClose}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
