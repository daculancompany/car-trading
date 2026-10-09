import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Box,
  Flex,
  Icon,
  Text,
} from "@chakra-ui/react";
import {
  InformationCircleIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { showSuccessToast, showErrorToast } from "../../../utils/apiToast";
import { createVehicle, type CreateVehicleData, } from "../../../api/VehicleManagement/vehicleApi";
import { createVehicleSpec, type CreateVehicleSpecData, type FuelType, type TransmissionType, } from "../../../api/VehicleManagement/specApi";
import { createVehicleDocument, } from "../../../api/VehicleManagement/vehicleDocumentApi";
import { getExpenseTypes, type ExpenseType, } from "../../../api/ExpenseManagement/expenseTypeApi";
import { createVehicleExpense, type CreateVehicleExpenseData, } from "../../../api/ExpenseManagement/expenseApi";
import { uploadVehicleImages, } from "../../../api/VehicleManagement/imageApi";

import AddVehicleInfo from "./AddTabs/AddVehicleInfo";
import AddVehicleSpec from "./AddTabs/AddVehicleSpec";
import AddVehicleExpense from "./AddTabs/AddVehicleExpense";
import AddVehicleImage from "./AddTabs/AddVehicleImage";
import AddVehicleDocument from "./AddTabs/AddVehicleDocument";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminAddVehicleModal({
  isOpen,
  onClose,
  onSuccess,
}: AddVehicleModalProps) {

  const toast = useToast();
  const [images, setImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<{ vehicle_cr?: File; vehicle_or?: File; }>({});
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Vehicle
   */
  const [vehicle, setVehicle] = useState<CreateVehicleData>({
    brand_id: 0,
    model_id: 0,
    variant_id: 0,
    year_model: 0,
    color: "",
    description: "",
    features: "",
    selling_price: 0,
    // discount_amount: undefined,
    reservation_price: 0,
    status: "available",
  });

  /**
   * Vehicle Specification
   */
  const [spec, setSpec] = useState<
    Omit<CreateVehicleSpecData, "vehicle_id" | "fuel_type" | "transmission"> & {
      fuel_type: FuelType | "";
      transmission: TransmissionType | "";
    }>({
      plate_number: "",
      engine_number: "",
      chassis_number: "",
      mileage: 0,
      fuel_type: "",
      transmission: "",
    });

  /**
   * Vehicle Expenses
   */
  const [expenses, setExpenses] = useState<
    Omit<CreateVehicleExpenseData, "vehicle_id">[]>([{
      expense_type_id: 0,
      amount: 0,
      remarks: "",
    },
    ]);

  /**
   * Load Expense Types
   */
  const loadExpenseTypes = async () => {
    try {
      const response = await getExpenseTypes();
      setExpenseTypes(response);
    } catch (error) {
      console.error(
        "Failed to load expense types:",
        error
      );
      showErrorToast(toast, error);
    }
  };
  useEffect(() => {
    if (isOpen) {
      loadExpenseTypes();
    }
  }, [isOpen]);

  /**
   * Reset Form
   */
  const resetForm = () => {
    setVehicle({
      brand_id: 0,
      model_id: 0,
      variant_id: 0,
      year_model: 0,
      color: "",
      description: "",
      features: "",
      selling_price: 0,
      // discount_amount: undefined,
      reservation_price: 0,
      status: "available",
    });

    setSpec({
      plate_number: "",
      engine_number: "",
      chassis_number: "",
      mileage: 0,
      fuel_type: "",
      transmission: "",
    });

    setExpenses([{
      expense_type_id: 0,
      amount: 0,
      remarks: "",
    },
    ]);
    setImages([]);
    setDocuments({});
  };

  /**
   * Validation
   */
  const validateVehicle = () => {
    if (!vehicle.brand_id) {
      toast({
        title: "Brand is required.",
        status: "warning",
        position: "top-right",
      });
      return false;
    } if (!vehicle.model_id) {
      toast({
        title: "Model is required.",
        status: "warning",
        position: "top-right",
      });
      return false;
    } if (!vehicle.variant_id) {
      toast({
        title: "Variant is required.",
        status: "warning",
        position: "top-right",
      });
      return false;
    } if (!vehicle.year_model) {
      toast({
        title: "Year model is required.",
        status: "warning",
        position: "top-right",
      });
      return false;
    } if (!vehicle.color.trim()) {
      toast({
        title: "Color is required.",
        status: "warning",
        position: "top-right",
      });
      return false;
    } if (vehicle.selling_price <= 0) {
      toast({
        title: "Selling price is required.",
        status: "warning",
        position: "top-right",
      });
      return false;
    } if (vehicle.reservation_price < 0) {
      toast({
        title: "Reservation price cannot be negative.",
        status: "warning",
        position: "top-right",
      });
      return false;
    }
    return true;
  };

  const validateSpecification = () => {
    if (!spec.plate_number.trim()) {
      toast({
        title: "Plate number is required.",
        status: "warning",
        position: "top-right",
      });
      return false;
    } if (!spec.engine_number.trim()) {
      toast({
        title: "Engine number is required.",
        status: "warning",
        position: "top-right",
      });
      return false;
    } if (!spec.chassis_number.trim()) {
      toast({
        title: "Chassis number is required.",
        status: "warning",
        position: "top-right",
      });
      return false;
    } if (!spec.fuel_type) {
      toast({
        title: "Fuel type is required.",
        status: "warning",
        position: "top-right",
      });
      return false;
    } if (!spec.transmission) {
      toast({
        title: "Transmission is required.",
        status: "warning",
        position: "top-right",
      });
      return false;
    }
    return true;
  };

  /**
   * Save Vehicle
   */
  const handleSave = async () => {
    if (loading) return;
    if (!validateVehicle()) return;
    if (!validateSpecification()) return;
    try {
      setLoading(true);

      /**
       * 1. Create Vehicle
       */
      const vehicleResponse =
        await createVehicle(vehicle);
      const vehicleId =
        vehicleResponse.id;

      /**
       * 2. Create Vehicle Specification
       */
      await createVehicleSpec({
        vehicle_id: vehicleId,
        ...spec,
        fuel_type: spec.fuel_type as FuelType,
        transmission: spec.transmission as TransmissionType,
      });

      /**
       * 3. Create Vehicle Documents
       */
      if (
        documents.vehicle_cr ||
        documents.vehicle_or
      ) {
        await createVehicleDocument({
          vehicle_id: vehicleId,
          vehicle_cr:
            documents.vehicle_cr,
          vehicle_or:
            documents.vehicle_or,
        });
      }

      /**
       * 4. Create Vehicle Expenses
       */
      const validExpenses =
        expenses.filter(
          (expense) =>
            expense.expense_type_id > 0 &&
            expense.amount > 0
        );

      for (const expense of validExpenses) {
        await createVehicleExpense({
          vehicle_id: vehicleId,
          expense_type_id:
            expense.expense_type_id,
          amount: expense.amount,
          remarks: expense.remarks,
        });
      }

      /**
       * 5. Upload Images
       */
      if (images.length > 0) {
        await uploadVehicleImages({
          vehicle_id: vehicleId,
          images,
        });
      }

      /**
       * Success
       */
      showSuccessToast(
        toast,
        "Vehicle Added",
        "The vehicle has been added successfully."
      );
      onSuccess();
      resetForm();
      onClose();

    } catch (error) {
      console.error(
        "Failed to add vehicle:",
        error
      );
      showErrorToast(
        toast,
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel
   */
  const handleCancel = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  /**
   * Tab UI
   */
  const tabs = [
    {
      label: "Information",
      icon: InformationCircleIcon,
    },
    {
      label: "Specifications",
      icon: WrenchScrewdriverIcon,
    },
    {
      label: "Documents",
      icon: DocumentTextIcon,
    },
    {
      label: "Expenses",
      icon: CurrencyDollarIcon,
    },
    {
      label: "Images",
      icon: PhotoIcon,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      size="5xl"
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay bg="blackAlpha.500" />

      <ModalContent
        borderRadius="xl"
        overflow="hidden"
        boxShadow="xl"
      >
        {/* HEADER */}
        <ModalHeader
          px={{ base: 5, md: 6 }}
          py={4}
          borderBottom="1px solid"
          borderColor="gray.200"
          bg="white"
        >
          <Flex
            align="center"
            gap={3}
          >
            <Box
              w="4px"
              h="28px"
              bg="brand.500"
              borderRadius="full"
            />

            <Box>
              <Text
                fontSize="lg"
                fontWeight="700"
                color="dark.900"
              >
                Add New Vehicle
              </Text>

              <Text
                fontSize="xs"
                color="gray.500"
                fontWeight="400"
                mt={0.5}
              >
                Add vehicle information and inventory details
              </Text>
            </Box>
          </Flex>
        </ModalHeader>

        <ModalCloseButton
          onClick={handleCancel}
          isDisabled={loading}
          top={4}
          right={4}
        />

        {/* BODY */}
        <ModalBody
          p={0}
          bg="gray.50"
        >
          <Tabs
            isFitted
            variant="unstyled"
            colorScheme="orange"
          >
            {/* TAB LIST */}
            <TabList
              bg="white"
              px={{ base: 2, md: 4 }}
              borderBottom="1px solid"
              borderColor="gray.200"
              overflowX="auto"
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.label}
                  py={3}
                  px={3}
                  gap={2}
                  fontSize="sm"
                  fontWeight="500"
                  color="gray.500"
                  whiteSpace="nowrap"
                  transition="all 0.2s ease"
                  _hover={{
                    color: "brand.500",
                    bg: "brand.50",
                  }}
                  _selected={{
                    color: "brand.500",
                    fontWeight: "600",
                    bg: "brand.50",
                    borderBottom: "2px solid",
                    borderColor: "brand.500",
                  }}
                  _focus={{
                    boxShadow: "none",
                  }}
                >
                  <Icon
                    as={tab.icon}
                    boxSize={4}
                  />

                  {tab.label}
                </Tab>
              ))}
            </TabList>

            {/* TAB CONTENT */}
            <TabPanels>
              <TabPanel
                p={{ base: 4, md: 5 }}
              >
                <Box
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                  p={{ base: 4, md: 5 }}
                >
                  <AddVehicleInfo
                    vehicle={vehicle}
                    setVehicle={setVehicle}
                  />
                </Box>
              </TabPanel>

              <TabPanel
                p={{ base: 4, md: 5 }}
              >
                <Box
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                  p={{ base: 4, md: 5 }}
                >
                  <AddVehicleSpec
                    spec={spec}
                    setSpec={setSpec}
                  />
                </Box>
              </TabPanel>

              <TabPanel
                p={{ base: 4, md: 5 }}
              >
                <Box
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                  p={{ base: 4, md: 5 }}
                >
                  <AddVehicleDocument
                    documents={documents}
                    setDocuments={setDocuments}
                  />
                </Box>
              </TabPanel>

              <TabPanel
                p={{ base: 4, md: 5 }}
              >
                <Box
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                  p={{ base: 4, md: 5 }}
                >
                  <AddVehicleExpense
                    expenses={expenses}
                    setExpenses={setExpenses}
                    expenseTypes={expenseTypes}
                  />
                </Box>
              </TabPanel>

              <TabPanel
                p={{ base: 4, md: 5 }}
              >
                <Box
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                  p={{ base: 4, md: 5 }}
                >
                  <AddVehicleImage
                    images={images}
                    setImages={setImages}
                  />
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        {/* FOOTER */}
        <ModalFooter
          px={{ base: 4, md: 6 }}
          py={4}
          borderTop="1px solid"
          borderColor="gray.200"
          bg="white"
          justifyContent="space-between"
        >
          <Button
            variant="ghost"
            size="sm"
            color="gray.600"
            _hover={{
              bg: "gray.100",
              color: "gray.800",
            }}
            onClick={handleCancel}
            isDisabled={loading}
          >
            Cancel
          </Button>

          <Button
            size="sm"
            bg="brand.500"
            color="white"
            px={6}
            _hover={{
              bg: "brand.600",
            }}
            _active={{
              bg: "brand.700",
            }}
            onClick={handleSave}
            isLoading={loading}
            loadingText="Saving..."
            isDisabled={loading}
          >
            Save Vehicle
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}