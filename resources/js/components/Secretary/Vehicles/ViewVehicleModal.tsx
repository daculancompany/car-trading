import {
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  Table,
  TableContainer,
  Tbody,
  Tfoot,
  Th,
  Thead,
  Tr,
  Td,
  Flex,
} from "@chakra-ui/react";

import type { Vehicle } from "../../../api/VehicleManagement/vehicleApi";

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box>
    <Text
      fontSize="xs"
      fontWeight="600"
      color="gray.500"
      mb={1}
      textTransform="uppercase"
      letterSpacing="0.03em"
    >
      {label}
    </Text>

    <Text
      fontSize="sm"
      fontWeight="600"
      color="gray.800"
    >
      {value}
    </Text>
  </Box>
);

interface ViewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

export default function AdminViewVehicleModal({
  isOpen,
  onClose,
  vehicle,
}: ViewVehicleModalProps) {
  if (!vehicle) return null;

  const money = (value?: number | null) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value ?? 0);

  /**
   * Vehicle Specification
   */
  const spec = vehicle.specs;

  /**
   * Total Expenses
   */
  const totalExpense =
    vehicle.expenses?.reduce(
      (total, expense) =>
        total + Number(expense.amount ?? 0),
      0
    ) ?? 0;

  /**
   * Status Color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "green";
      case "reserved":
        return "orange";
      case "sold":
        return "blue";
      case "maintenance":
        return "red";
      default:
        return "gray";
    }
  };

  const formatStatus = (status?: string) => {
    if (!status) return "-";
    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay
        bg="blackAlpha.600"
      />

      <ModalContent
        borderRadius="xl"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="2xl"
      >
        {/* HEADER */}
        <ModalHeader
          px={{ base: 5, md: 7 }}
          pt={6}
          pb={5}
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <Flex
            direction={{ base: "column", sm: "row" }}
            align={{ base: "start", sm: "center" }}
            justify="space-between"
            gap={3}
            pr={8}
          >
            <Box>
              <Text
                fontSize="xl"
                fontWeight="700"
                color="gray.800"
                lineHeight="1.3"
              >
                Vehicle Details
              </Text>

              <Text
                mt={1}
                fontSize="sm"
                color="gray.500"
                fontWeight="400"
              >
                Complete information and records for this vehicle.
              </Text>
            </Box>

            <Badge
              colorScheme={getStatusColor(vehicle.status)}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="600"
            >
              {formatStatus(vehicle.status)}
            </Badge>
          </Flex>
        </ModalHeader>

        <ModalCloseButton
          top={5}
          right={5}
          borderRadius="lg"
          color="gray.500"
          _hover={{
            bg: "gray.100",
            color: "gray.700",
          }}
        />

        {/* BODY */}
        <ModalBody
          px={{ base: 4, md: 7 }}
          py={6}
          bg="gray.50"
        >
          {/* VEHICLE INFORMATION */}
          <Box
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            p={{ base: 4, md: 5 }}
            mb={5}
          >
            <Flex
              align="center"
              justify="space-between"
              mb={5}
            >
              <Box>
                <Heading
                  size="sm"
                  color="gray.800"
                >
                  Vehicle Information
                </Heading>

                <Text
                  mt={1}
                  fontSize="xs"
                  color="gray.500"
                >
                  Basic vehicle identification and details
                </Text>
              </Box>
            </Flex>

            <SimpleGrid
              columns={{ base: 1, sm: 2, lg: 3 }}
              spacingX={6}
              spacingY={5}
            >
              <DetailItem
                label="Stock No."
                value={vehicle.stock_no}
              />

              <DetailItem
                label="Brand"
                value={vehicle.brand?.brand ?? "-"}
              />

              <DetailItem
                label="Model"
                value={vehicle.model?.model ?? "-"}
              />

              <DetailItem
                label="Variant"
                value={vehicle.variant?.variant ?? "-"}
              />

              <DetailItem
                label="Year Model"
                value={vehicle.year_model}
              />

              <DetailItem
                label="Color"
                value={vehicle.color}
              />
            </SimpleGrid>

            <Divider my={5} />

            {/* Description */}
            <Box>
              <Text
                fontSize="xs"
                fontWeight="600"
                color="gray.500"
                mb={1}
                textTransform="uppercase"
                letterSpacing="0.03em"
              >
                Description
              </Text>

              <Text
                fontSize="sm"
                color="gray.700"
                lineHeight="1.7"
              >
                {vehicle.description || "No description available."}
              </Text>
            </Box>

            {/* Features */}
            <Box mt={5}>
              <Text
                fontSize="xs"
                fontWeight="600"
                color="gray.500"
                mb={3}
                textTransform="uppercase"
                letterSpacing="0.03em"
              >
                Features
              </Text>

              {vehicle.features ? (
                <Flex
                  gap={2}
                  flexWrap="wrap"
                >
                  {vehicle.features
                    .split("\n")
                    .filter(
                      (feature) =>
                        feature.trim() !== ""
                    )
                    .map((feature, index) => (
                      <Badge
                        key={`${feature}-${index}`}
                        colorScheme="green"
                        variant="subtle"
                        borderRadius="full"
                        px={3}
                        py={1.5}
                        fontSize="xs"
                        fontWeight="500"
                        textTransform="capitalize"
                      >
                        ✓ {feature.trim()}
                      </Badge>
                    ))}
                </Flex>
              ) : (
                <Text
                  color="gray.500"
                  fontSize="sm"
                >
                  No features available.
                </Text>
              )}
            </Box>
          </Box>

          {/* PRICING */}
          <Box
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            p={{ base: 4, md: 5 }}
            mb={5}
          >
            <Heading
              size="sm"
              color="gray.800"
              mb={1}
            >
              Vehicle Pricing
            </Heading>

            <Text
              fontSize="xs"
              color="gray.500"
              mb={5}
            >
              Current vehicle pricing information
            </Text>

            <SimpleGrid
              columns={{ base: 1, sm: 2, lg: 4 }}
              spacing={4}
            >
              <Box
                p={4}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                bg="gray.50"
              >
                <DetailItem
                  label="Selling Price"
                  value={money(vehicle.selling_price)}
                />
              </Box>

              <Box
                p={4}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                bg="gray.50"
              >
                <DetailItem
                  label="Reservation Price"
                  value={money(
                    vehicle.reservation_price
                  )}
                />
              </Box>
            </SimpleGrid>
          </Box>

          {/* SPECIFICATIONS */}
          <Box
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            p={{ base: 4, md: 5 }}
            mb={5}
          >
            <Heading
              size="sm"
              color="gray.800"
              mb={1}
            >
              Vehicle Specifications
            </Heading>

            <Text
              fontSize="xs"
              color="gray.500"
              mb={5}
            >
              Registration, engine, and technical information
            </Text>

            <SimpleGrid
              columns={{ base: 1, sm: 2, lg: 3 }}
              spacingX={6}
              spacingY={5}
            >
              <DetailItem
                label="Plate Number"
                value={spec?.plate_number ?? "-"}
              />

              <DetailItem
                label="Engine Number"
                value={spec?.engine_number ?? "-"}
              />

              <DetailItem
                label="Chassis Number"
                value={spec?.chassis_number ?? "-"}
              />

              <DetailItem
                label="Mileage"
                value={
                  spec?.mileage !== null &&
                    spec?.mileage !== undefined
                    ? `${spec.mileage.toLocaleString()} km`
                    : "-"
                }
              />

              <DetailItem
                label="Fuel Type"
                value={spec?.fuel_type ?? "-"}
              />

              <DetailItem
                label="Transmission"
                value={spec?.transmission ?? "-"}
              />
            </SimpleGrid>
          </Box>

          {/* EXPENSES */}
          <Box
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            p={{ base: 4, md: 5 }}
            mb={5}
          >
            <Flex
              direction={{ base: "column", sm: "row" }}
              align={{ base: "start", sm: "center" }}
              justify="space-between"
              gap={2}
              mb={5}
            >
              <Box>
                <Heading
                  size="sm"
                  color="gray.800"
                >
                  Vehicle Expenses
                </Heading>

                <Text
                  mt={1}
                  fontSize="xs"
                  color="gray.500"
                >
                  Recorded expenses associated with this vehicle
                </Text>
              </Box>

              <Badge
                colorScheme="red"
                variant="subtle"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="xs"
              >
                {vehicle.expenses?.length ?? 0} Records
              </Badge>
            </Flex>

            {vehicle.expenses &&
              vehicle.expenses.length > 0 ? (
              <TableContainer>
                <Table
                  variant="simple"
                  size="sm"
                >
                  <Thead bg="gray.50">
                    <Tr>
                      <Th
                        width="70px"
                        color="gray.500"
                        fontSize="xs"
                      >
                        No.
                      </Th>

                      <Th
                        color="gray.500"
                        fontSize="xs"
                      >
                        Expense Type
                      </Th>

                      <Th
                        isNumeric
                        color="gray.500"
                        fontSize="xs"
                      >
                        Amount
                      </Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {vehicle.expenses.map(
                      (expense, index) => (
                        <Tr
                          key={expense.id}
                          _hover={{
                            bg: "gray.50",
                          }}
                        >
                          <Td color="gray.500">
                            {index + 1}
                          </Td>

                          <Td
                            fontWeight="500"
                            color="gray.700"
                          >
                            {expense.expense_type
                              ?.expense_name ??
                              `Expense #${expense.expense_type_id}`}
                          </Td>

                          <Td
                            isNumeric
                            fontWeight="600"
                            color="gray.800"
                          >
                            {money(expense.amount)}
                          </Td>
                        </Tr>
                      )
                    )}
                  </Tbody>

                  <Tfoot>
                    <Tr bg="gray.50">
                      <Th
                        colSpan={2}
                        color="gray.700"
                        fontSize="sm"
                      >
                        Total Expenses
                      </Th>

                      <Th
                        isNumeric
                        color="red.600"
                        fontSize="sm"
                      >
                        {money(totalExpense)}
                      </Th>
                    </Tr>
                  </Tfoot>
                </Table>
              </TableContainer>
            ) : (
              <Box
                py={8}
                textAlign="center"
                border="1px dashed"
                borderColor="gray.300"
                borderRadius="md"
              >
                <Text
                  color="gray.500"
                  fontSize="sm"
                >
                  No expenses recorded.
                </Text>
              </Box>
            )}
          </Box>

          {/* IMAGES */}
          <Box
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            p={{ base: 4, md: 5 }}
          >
            <Heading
              size="sm"
              color="gray.800"
              mb={1}
            >
              Vehicle Images
            </Heading>

            <Text
              fontSize="xs"
              color="gray.500"
              mb={5}
            >
              Uploaded images for this vehicle
            </Text>

            {vehicle.images &&
              vehicle.images.length > 0 ? (
              <SimpleGrid
                columns={{
                  base: 1,
                  sm: 2,
                  md: 3,
                  lg: 4,
                }}
                spacing={4}
              >
                {vehicle.images.map((image) => (
                  <Box
                    key={image.id}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    overflow="hidden"
                    bg="gray.50"
                    _hover={{
                      boxShadow: "md",
                      transform: "translateY(-2px)",
                    }}
                    transition="all 0.2s"
                  >
                    <Image
                      src={`/storage/${image.image_path}`}
                      w="100%"
                      h="170px"
                      objectFit="cover"
                      alt="Vehicle"
                    />

                    <Box p={3}>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                      >
                        Vehicle Image
                      </Text>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Box
                py={8}
                textAlign="center"
                border="1px dashed"
                borderColor="gray.300"
                borderRadius="md"
              >
                <Text
                  color="gray.500"
                  fontSize="sm"
                >
                  No images uploaded.
                </Text>
              </Box>
            )}
          </Box>
        </ModalBody>

        {/* FOOTER */}
        <ModalFooter
          px={{ base: 5, md: 7 }}
          py={4}
          bg="white"
          borderTop="1px solid"
          borderColor="gray.100"
        >
          <Button
            onClick={onClose}
            size="sm"
            variant="outline"
            borderRadius="md"
            px={6}
            color="gray.600"
            borderColor="gray.300"
            _hover={{
              bg: "gray.50",
              borderColor: "gray.400",
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}