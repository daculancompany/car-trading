import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

import {
  MagnifyingGlassIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";

import AddVehicleModal from "./AddVehicleModal";
import AddBrandModal from "../Vehicles/VehicleMasterData/AddBrandModal";
import AddModelModal from "../Vehicles/VehicleMasterData/AddModelModal";
import AddVariantModal from "../Vehicles/VehicleMasterData/AddVariantModal";
import AddExpenseTypeModal from "../Vehicles/VehicleMasterData/AddExpenseTypeModal";

interface VehicleToolbarProps {
  search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onVehicleAdded: () => void;
}

export default function AdminVehicleToolbar({
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onVehicleAdded,
}: VehicleToolbarProps) {
  const vehicleModal = useDisclosure();
  const brandModal = useDisclosure();
  const modelModal = useDisclosure();
  const variantModal = useDisclosure();
  const expenseType = useDisclosure();

  return (
    <>
      {/* VEHICLE TOOLBAR */}
      <Box
        layerStyle="panel"
        px={{ base: 4, md: 5 }}
        py={4}
        mb={0}
      >
        <Flex
          direction={{
            base: "column",
            lg: "row",
          }}
          justify="space-between"
          align={{
            base: "stretch",
            lg: "center",
          }}
          gap={4}
        >
          {/* SEARCH + FILTER */}
          <Flex
            direction={{
              base: "column",
              sm: "row",
            }}
            flex="1"
            gap={4}
          >
            {/* Search */}
            <InputGroup flex="1">
              <InputLeftElement
                h="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                pointerEvents="none"
              >
                <MagnifyingGlassIcon
                  width={17}
                  height={17}
                />
              </InputLeftElement>

              <Input
                placeholder="Search brand, model, variant..."
                value={search}
                onChange={(e) =>
                  onSearchChange(e.target.value)
                }
                bg="white"
                size="sm"
                pl="40px"
              />
            </InputGroup>

            {/* Status */}
            <Select
              placeholder="All Status"
              value={statusFilter}
              onChange={(e) =>
                onStatusChange(
                  e.target.value
                )
              }
              w={{
                base: "100%",
                sm: "180px",
              }}
              bg="white"
              size="sm"
            >
              <option value="available">
                Available
              </option>

              <option value="reserved">
                Reserved
              </option>

              <option value="sold">
                Sold
              </option>

              <option value="maintenance">
                Maintenance
              </option>
            </Select>
          </Flex>

          {/* ACTIONS */}
          <Flex
            gap={2}
            flexWrap="wrap"
          >
            {/* Master Data */}
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                leftIcon={
                  <PlusIcon
                    width={16}
                    height={16}
                  />
                }
                rightIcon={
                  <ChevronDownIcon
                    width={16}
                    height={16}
                  />
                }
                variant="outline"
                borderColor="gray.300"
                color="dark.700"
                _hover={{
                  bg: "brand.50",
                  color: "brand.500",
                  borderColor:
                    "brand.300",
                }}
              >
                Master Data
              </MenuButton>

              <MenuList>
                <MenuItem
                  onClick={
                    brandModal.onOpen
                  }
                >
                  Add Brand
                </MenuItem>

                <MenuItem
                  onClick={
                    modelModal.onOpen
                  }
                >
                  Add Model
                </MenuItem>

                <MenuItem
                  onClick={
                    variantModal.onOpen
                  }
                >
                  Add Variant
                </MenuItem>

                <MenuItem
                  onClick={
                    expenseType.onOpen
                  }
                >
                  Add Expense Type
                </MenuItem>
              </MenuList>
            </Menu>

            {/* Add Vehicle */}
            <Button
              size="sm"
              leftIcon={
                <PlusIcon
                  width={16}
                  height={16}
                />
              }
              bg="brand.500"
              color="white"
              _hover={{
                bg: "brand.600",
              }}
              onClick={
                vehicleModal.onOpen
              }
            >
              Add Vehicle
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* MODALS */}

      <AddVehicleModal
        isOpen={vehicleModal.isOpen}
        onClose={vehicleModal.onClose}
        onSuccess={onVehicleAdded}
      />

      <AddBrandModal
        isOpen={brandModal.isOpen}
        onClose={brandModal.onClose}
      />

      <AddModelModal
        isOpen={modelModal.isOpen}
        onClose={modelModal.onClose}
      />

      <AddVariantModal
        isOpen={variantModal.isOpen}
        onClose={variantModal.onClose}
      />

      <AddExpenseTypeModal
        isOpen={expenseType.isOpen}
        onClose={expenseType.onClose}
      />
    </>
  );
}