import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import {
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";

import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  IdentificationIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

import {
  createReservation,
  type CreateReservationData,
} from "../../../api/ReservationManagement/reservationApi";

import type { Vehicle } from "../../../api/VehicleManagement/vehicleApi";

import IdOnFileCard, { useValidIdOnFile } from "./IdOnFileCard";

interface ReservationVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onSuccess?: () => void;
}

type ReservationFormData = {
  vehicle_id: number;
  reservation_source: "online";
  purchase_option: "financing";
  valid_id_type: string;
  valid_id_front: File | null;
  valid_id_back: File | null;
  remarks: string;
};

const initialFormData: ReservationFormData = {
  vehicle_id: 0,
  reservation_source: "online",
  purchase_option: "financing",
  valid_id_type: "",
  valid_id_front: null,
  valid_id_back: null,
  remarks: "",
};

const formatDateTime = (date: Date) =>
  date.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const getVehicleName = (vehicle: Vehicle | null) => {
  if (!vehicle) return "No vehicle selected";

  return [
    vehicle.brand?.brand,
    vehicle.model?.model,
    vehicle.variant?.variant,
  ]
    .filter(Boolean)
    .join(" / ") || "Vehicle details unavailable";
};

export default function CustomerFinancingReservationVehicleModal({
  isOpen,
  onClose,
  vehicle,
  onSuccess,
}: ReservationVehicleModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] =
    useState<ReservationFormData>(initialFormData);
  const { idOnFile, useOnFile, setUseOnFile } = useValidIdOnFile(isOpen);

  const reservedAt = useMemo(() => new Date(), [isOpen]);
  const expiresAt = useMemo(
    () => new Date(reservedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
    [reservedAt],
  );

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...initialFormData,
        vehicle_id: vehicle?.id ?? 0,
      });
    }
  }, [isOpen, vehicle]);

  const isFormValid =
    formData.vehicle_id > 0 &&
    ((useOnFile && Boolean(idOnFile)) ||
        (Boolean(formData.valid_id_type) &&
            Boolean(formData.valid_id_front) &&
            Boolean(formData.valid_id_back)));

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    field: "valid_id_front" | "valid_id_back",
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: event.target.files?.[0] ?? null,
    }));
  };

  const showWarning = (title: string, description: string) => {
    toast({
      title,
      description,
      status: "warning",
      duration: 3500,
      isClosable: true,
      position: "top-right",
    });
  };

  const handleSubmit = async () => {
    if (!vehicle) {
      showWarning(
        "Vehicle not selected",
        "Please select a vehicle before making a reservation.",
      );
      return;
    }

    if (!isFormValid) {
      showWarning(
        "Incomplete information",
        "Please complete all required fields and upload both sides of your valid ID.",
      );
      return;
    }

    try {
      setLoading(true);

      const data: CreateReservationData = {
        vehicle_id: formData.vehicle_id,
        reservation_source: "online",
        ...(useOnFile && idOnFile
            ? {}
            : {
                  valid_id_type: formData.valid_id_type,
                  valid_id_front: formData.valid_id_front!,
                  valid_id_back: formData.valid_id_back!,
              }),
        purchase_option: "financing",
        remarks: formData.remarks.trim() || null,
      };

      await createReservation(data);

      toast({
        title: "Financing reservation submitted",
        description:
          "Your reservation was submitted successfully. Financing approval is handled by your selected financing company.",
        status: "success",
        duration: 4500,
        isClosable: true,
        position: "top-right",
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Financing reservation error:", error);

      toast({
        title: "Reservation failed",
        description:
          error?.response?.data?.message ||
          "Something went wrong while creating your reservation.",
        status: "error",
        duration: 4500,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
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
          <HStack spacing={3}>
            <Box p={2} borderRadius="lg">
              <Icon
                as={DocumentCheckIcon}
                boxSize={6}
                color="brand.700"
              />
            </Box>

            <Box>
              <Text fontSize="md" fontWeight="700" color="dark.800">
                Reserve Vehicle
              </Text>
              <Text
                fontSize="xs"
                fontWeight="500"
                color="gray.600"
              >
                CDO Car Trading • Financing Reservation
              </Text>
            </Box>
          </HStack>
        </ModalHeader>

        <ModalCloseButton
          color="brand.600"
          top={4}
          right={4}
          isDisabled={loading}
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
            <Box
              p={5}
              borderRadius="md"
              bg="gray.50"
            >
              <HStack justify="space-between" align="start" mb={3}>
                <HStack spacing={2}>
                  <Icon
                    as={TruckIcon}
                    boxSize={5}
                    color="brand.700"
                  />
                  <Text fontSize="xs" fontWeight="800" color="gray.800">
                    Selected Vehicle
                  </Text>
                </HStack>

                <Badge
                  colorScheme="purple"
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  Financing
                </Badge>
              </HStack>

              <Text fontSize={{ base: "md", md: "sm" }} fontWeight="800" color="gray.800">
                {getVehicleName(vehicle)}
              </Text>

              {vehicle && (
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
              )}
            </Box>

            <Box>
              <HStack spacing={2} mb={3}>
                <Icon as={InformationCircleIcon} boxSize={5} color="brand.700" />
                <Text fontWeight="800" color="gray.800" fontSize="sm">Financing Information</Text>
              </HStack>

              <Box
                p={4}
                borderRadius="md"
                bg="brand.50"
              >
                <Text fontSize="xs" color="blue.800">
                  Financing approval, interest rates, requirements,
                  payment schedules, and other terms are determined
                  by the financing company selected by the customer.
                  CDO Car Trading only records the financing
                  information and does not guarantee approval.
                </Text>
              </Box>
            </Box>

            <Box>
              <HStack spacing={2} mb={3}>
                <Icon as={ClockIcon} boxSize={5} color="brand.700" />
                <Text fontWeight="800" color="gray.800" fontSize="sm">Reservation Period</Text>
              </HStack>

              <Box
                p={4}
                borderRadius="md"
                bg="brand.50"
              >
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <HStack align="start" spacing={3}>
                    <Icon as={CalendarDaysIcon} boxSize={5} color="dark.700" mt={1} />
                    <Box>
                      <Text fontSize="xs" color="dark.700">Reserved At</Text>
                      <Text fontSize="xs" fontWeight="700">
                        {formatDateTime(reservedAt)}
                      </Text>
                    </Box>
                  </HStack>

                  <HStack align="start" spacing={3}>
                    <Icon as={CalendarDaysIcon} boxSize={5} color="dark.700" mt={1} />
                    <Box>
                      <Text fontSize="xs" color="dark.700">Expires At</Text>
                      <Text fontSize="xs" fontWeight="700" color="gray.700">
                        {formatDateTime(expiresAt)}
                      </Text>
                    </Box>
                  </HStack>
                </SimpleGrid>

                <Divider my={4} borderColor="brand.500" />

                <HStack align="start" spacing={2}>
                  <Icon as={InformationCircleIcon} boxSize={5} color="dark.700" mt={0.5} />
                  <Text fontSize="sm" color="gray.800">
                    This reservation is valid for 7 days. Complete
                    the required process within this period to
                    avoid expiration.
                  </Text>
                </HStack>
              </Box>
            </Box>

            <Box>
              <HStack spacing={2} mb={3}>
                <Icon as={IdentificationIcon} boxSize={5} color="brand.700" />
                <Text fontWeight="800" color="gray.800" fontSize="sm">Identity Verification</Text>
              </HStack>

              {useOnFile && idOnFile ? (
                <IdOnFileCard
                  idOnFile={idOnFile}
                  onUseDifferent={() => setUseOnFile(false)}
                />
              ) : (
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="700">
                    Valid ID Type
                  </FormLabel>
                  <Select
                    name="valid_id_type"
                    value={formData.valid_id_type}
                    onChange={handleChange}
                    placeholder="Select your valid ID"
                    focusBorderColor="brand.500"
                    borderRadius="md"
                  >
                    <option value="Driver's License">Driver's License</option>
                    <option value="Passport">Passport</option>
                    <option value="PhilSys ID">PhilSys ID</option>
                    <option value="Postal ID">Postal ID</option>
                    <option value="Voter's ID">Voter's ID</option>
                    <option value="PRC ID">PRC ID</option>
                  </Select>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {(["valid_id_front", "valid_id_back"] as const).map((field) => (
                    <FormControl key={field} isRequired>
                      <FormLabel fontSize="xs" fontWeight="700">
                        {field === "valid_id_front"
                          ? "Valid ID — Front"
                          : "Valid ID — Back"}
                      </FormLabel>

                      <Input
                        type="file"
                        accept="image/*"
                        p={1.5}
                        h="auto"
                        borderRadius="md"
                        focusBorderColor="brand.500"
                        onChange={(event) =>
                          handleFileChange(event, field)
                        }
                      />

                      {formData[field] && (
                        <Box
                          mt={2}
                          p={2}
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="md"
                          bg="gray.50"
                          display="flex"
                          justifyContent="center"
                        >
                          <Box
                            w="140px"
                            h="90px"
                            borderRadius="sm"
                            overflow="hidden"
                            border="1px solid"
                            borderColor="gray.200"
                            bg="white"
                          >
                            <img
                              src={URL.createObjectURL(formData[field]!)}
                              alt={
                                field === "valid_id_front"
                                  ? "Valid ID front preview"
                                  : "Valid ID back preview"
                              }
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                display: "block",
                              }}
                            />
                          </Box>
                        </Box>
                      )}
                    </FormControl>
                  ))}
                </SimpleGrid>
              </Stack>
              )}
            </Box>

            <Box>
              <HStack spacing={2} mb={3}>
                <Icon as={DocumentTextIcon} boxSize={5} color="brand.700" />
                <Text fontWeight="800" color="gray.800" fontSize="sm">Additional Information</Text>
              </HStack>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="700">Remarks</FormLabel>
                <Textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Add optional financing questions or remarks..."
                  rows={2}
                  resize="vertical"
                  borderRadius="md"
                  focusBorderColor="brand.500"
                />
              </FormControl>
            </Box>

            <Box
              p={4}
              borderRadius="md"
              bg="green.50"
              border="1px solid"
              borderColor="green.100"
            >
              <HStack align="start" spacing={3}>
                <Icon as={ShieldCheckIcon} boxSize={5} color="green.600" />
                <Box>
                  <Text fontSize="sm" fontWeight="800" color="green.800">
                    Secure Financing Reservation
                  </Text>
                  <Text mt={1} fontSize="xs" color="green.700">
                    Your information will be used for reservation
                    processing and financing documentation.
                  </Text>
                </Box>
              </HStack>
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
          flexWrap="wrap"
        >
          <Button
            variant="ghost"
            onClick={handleClose}
            isDisabled={loading}
          >
            Cancel
          </Button>

          <Button
            leftIcon={<Icon as={CheckCircleIcon} boxSize={5} />}
            colorScheme="red"
            bg="brand.700"
            _hover={{ bg: "brand.800" }}
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Submitting..."
            isDisabled={!isFormValid}
            borderRadius="md"
            px={6}
          >
            Submit Financing Reservation
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
