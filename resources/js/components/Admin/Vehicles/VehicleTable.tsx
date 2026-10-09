import { useEffect, useState } from "react";

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Heading,
  useDisclosure,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";

import {
  EyeIcon,
  PencilSquareIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";

import ViewVehicleModal from "./ViewVehicleModal";
import UpdateVehicleModal from "./UpdateVehicleModal";
import ArchiveVehicleDialog from "./ArchiveVehicleDialog";
import VehicleMasterDataModal from "./VehicleMasterDataModal";
import VehicleNetIncomeModal from "./VehicleNetIncomeModal";
import VehicleInventoryModal from "./VehicleInventoryModal";
import VehicleExpenseModal from "./ExpenseVehicleModal";
import VehicleExpensesSummaryModal from "./VehicleExpensesSummaryModal";
import Pagination from "../../../Reusable/Paginations";

import type { Vehicle } from "../../../api/VehicleManagement/vehicleApi";
import DetailsLink from "../../Shared/Details/DetailsLink";

interface VehicleTableProps {
  vehicles: Vehicle[];
  loading: boolean;
  onReload: () => void;
}

export default function AdminVehicleTable({
  vehicles,
  loading,
  onReload,
}: VehicleTableProps) {
  const [selectedVehicle, setSelectedVehicle] =
    useState<Vehicle | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] =
    useState(false);

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  const {
    isOpen: isUpdateOpen,
    onOpen: onUpdateOpen,
    onClose: onUpdateClose,
  } = useDisclosure();

  const {
    isOpen: isMasterDataOpen,
    onOpen: onMasterDataOpen,
    onClose: onMasterDataClose,
  } = useDisclosure();

  const {
    isOpen: isInventoryOpen,
    onOpen: onInventoryOpen,
    onClose: onInventoryClose,
  } = useDisclosure();

  const {
    isOpen: isNetIncomeOpen,
    onOpen: onNetIncomeOpen,
    onClose: onNetIncomeClose,
  } = useDisclosure();

  const {
    isOpen: isExpenseOpen,
    onOpen: onExpenseOpen,
    onClose: onExpenseClose,
  } = useDisclosure();

  const {
    isOpen: isExpenseSummaryOpen,
    onOpen: onExpenseSummaryOpen,
    onClose: onExpenseSummaryClose,
  } = useDisclosure();

  // ACTIVE VEHICLES ONLY
  // 0 = Active
  // 1 = Archived
  const activeVehicles = vehicles.filter(
    (vehicle) => Number(vehicle.archived) === 0
  );

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalItems = activeVehicles.length;
  const paginatedVehicles = activeVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // STATUS

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

  useEffect(() => {
    setCurrentPage(1);
  }, [vehicles]);

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
            Vehicle Inventory
          </Heading>

          <Text
            mt={1}
            fontSize="xs"
            color="gray.500"
          >
            Browse and manage your vehicle
            inventory and records.
          </Text>
        </Box>

        {/* QUICK ACTIONS */}

        <HStack
          spacing={2}
          flexWrap="wrap"
        >
          <Button
            size="sm"
            variant="outline"
            leftIcon={
              <ClipboardDocumentListIcon
                width={16}
                height={16}
              />
            }
            borderColor="gray.300"
            color="dark.700"
            onClick={onInventoryOpen}
            _hover={{
              bg: "brand.50",
              color: "brand.500",
              borderColor:
                "brand.300",
            }}
          >
            Vehicle Inventory
          </Button>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<BanknotesIcon width={16} height={16} />}
            borderColor="gray.300"
            color="dark.700"
            onClick={onExpenseSummaryOpen}
            _hover={{
              bg: "yellow.50",
              color: "yellow.600",
              borderColor: "yellow.300",
            }}
          >
            View Vehicle Expenses
          </Button>

          <Button
            size="sm"
            variant="outline"
            leftIcon={
              <CircleStackIcon
                width={16}
                height={16}
              />
            }
            borderColor="gray.300"
            color="dark.700"
            onClick={onMasterDataOpen}
            _hover={{
              bg: "brand.50",
              color: "brand.500",
              borderColor:
                "brand.300",
            }}
          >
            Master Data
          </Button>
        </HStack>
      </Flex>

      {/* TABLE */}

      <Box overflowX="auto">
        <Table
          variant="simple"
          minW="1000px"
        >
          <Thead bg="gray.50">
            <Tr>
              {[
                "Stock No.",
                "Brand / Model",
                "Plate Number",
                "Year",
                "Color",
                "Status",
                "Actions",
              ].map((header, index) => (
                <Th
                  key={header}
                  fontSize="xs"
                  fontWeight="800"
                  color="gray.700"
                  py={2}
                  textAlign={index === 6 ? "center" : undefined}
                >
                  {header}
                </Th>
              ))}
            </Tr>
          </Thead>

          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py={10}>
                  <Text fontSize="sm" color="gray.500">
                    Loading vehicles...
                  </Text>
                </Td>
              </Tr>
            ) : paginatedVehicles.length > 0 ? (
              paginatedVehicles.map((vehicle) => (
                <Tr
                  key={vehicle.id}
                  _hover={{ bg: "gray.50" }}
                  transition="background 0.15s"
                >
                  <Td py={2} fontSize="sm" fontWeight="600" color="dark.900" >
                    <DetailsLink type="vehicle" id={vehicle.id}>{vehicle.stock_no}</DetailsLink>
                  </Td>

                  <Td py={2}>
                    <Text fontSize="sm" fontWeight="500" color="dark.900">
                      {[
                        vehicle.brand?.brand,
                        vehicle.model?.model,
                        vehicle.variant?.variant,
                      ]
                        .filter(Boolean)
                        .join(" / ")}
                    </Text>
                  </Td>

                  <Td py={2} fontSize="sm" color="gray.600">
                    {vehicle.specs?.plate_number ?? "—"}
                  </Td>

                  <Td py={2} fontSize="sm" color="gray.600">
                    {vehicle.year_model}
                  </Td>

                  <Td py={2} fontSize="sm" color="gray.600">
                    {vehicle.color}
                  </Td>

                  <Td py={2}>
                    <Badge
                      colorScheme={getStatusColor(vehicle.status)}
                      px={2}
                      py={1}
                      rounded="full"
                      fontSize="xs"
                      fontWeight="600"
                    >
                      {vehicle.status.charAt(0).toUpperCase() +
                        vehicle.status.slice(1)}
                    </Badge>
                  </Td>

                  <Td py={2}>
                    <HStack spacing={1} justify="center">
                      {[
                        {
                          label: "View Vehicle",
                          icon: <EyeIcon width={18} height={18} />,
                          hover: { bg: "blue.50", color: "blue.500" },
                          click: () => {
                            setSelectedVehicle(vehicle);
                            onOpen();
                          },
                        },
                        {
                          label: "Update Vehicle",
                          icon: (
                            <PencilSquareIcon
                              width={18}
                              height={18}
                            />
                          ),
                          hover: {
                            bg: "orange.50",
                            color: "orange.500",
                          },
                          click: () => {
                            setSelectedVehicle(vehicle);
                            onUpdateOpen();
                          },
                        },
                        {
                          label: "Expenses per vehicle",
                          icon: (
                            <BanknotesIcon
                              width={18}
                              height={18}
                            />
                          ),
                          hover: {
                            bg: "yellow.50",
                            color: "yellow.600",
                          },
                          click: () => {
                            setSelectedVehicle(vehicle);
                            onExpenseOpen();
                          },
                        },
                        {
                          label: "Net Income per vehicle",
                          icon: (
                            <ChartBarIcon
                              width={18}
                              height={18}
                            />
                          ),
                          hover: {
                            bg: "teal.50",
                            color: "teal.500",
                          },
                          click: () => {
                            setSelectedVehicle(vehicle);
                            onNetIncomeOpen();
                          },
                        },
                        {
                          label: "Archive Vehicle",
                          icon: (
                            <ArchiveBoxIcon
                              width={18}
                              height={18}
                            />
                          ),
                          hover: {
                            bg: "orange.50",
                            color: "orange.500",
                          },
                          click: () => {
                            setSelectedVehicle(vehicle);
                            setIsDeleteOpen(true);
                          },
                        },
                      ].map((action) => (
                        <Tooltip
                          key={action.label}
                          label={action.label}
                          hasArrow
                          placement="top"
                        >
                          <IconButton
                            aria-label={action.label}
                            size="sm"
                            variant="ghost"
                            color="gray.600"
                            icon={action.icon}
                            onClick={action.click}
                            _hover={action.hover}
                          />
                        </Tooltip>
                      ))}
                    </HStack>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={7} textAlign="center" py={10}>
                  <Text fontSize="sm" color="gray.500">
                    No active vehicles found.
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        itemLabel="vehicle"
      />

      {/* MODALS */}

      <ViewVehicleModal
        isOpen={isOpen}
        onClose={onClose}
        vehicle={selectedVehicle}
      />

      <UpdateVehicleModal
        isOpen={isUpdateOpen}
        onClose={onUpdateClose}
        vehicle={selectedVehicle}
        onReload={onReload}
      />

      <ArchiveVehicleDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        vehicle={selectedVehicle}
        onArchived={onReload}
      />

      <VehicleMasterDataModal
        isOpen={isMasterDataOpen}
        onClose={onMasterDataClose}
        onReload={onReload}
      />

      <VehicleInventoryModal
        isOpen={isInventoryOpen}
        onClose={onInventoryClose}
        vehicles={vehicles}
      />

      <VehicleNetIncomeModal
        isOpen={isNetIncomeOpen}
        onClose={onNetIncomeClose}
        vehicle={selectedVehicle}
      />

      <VehicleExpenseModal
        isOpen={isExpenseOpen}
        onClose={onExpenseClose}
        vehicle={selectedVehicle}
        onReload={onReload}
      />

      <VehicleExpensesSummaryModal
        isOpen={isExpenseSummaryOpen}
        onClose={onExpenseSummaryClose}
      />
    </Box>
  );
}