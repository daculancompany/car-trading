import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Flex,
  Icon,
  Text,
} from "@chakra-ui/react";

import {
  InformationCircleIcon,
  WrenchScrewdriverIcon,
  PhotoIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

import type { Vehicle } from "../../../api/VehicleManagement/vehicleApi";
import UpdateVehicleInformation from "./UpdateTabs/UpdateVehicleInformation";
import UpdateVehicleSpecification from "./UpdateTabs/UpdateVehicleSpecification";
import UpdateVehicleDocuments from "./UpdateTabs/UpdateVehicleDocuments";
import UpdateVehicleImages from "./UpdateTabs/UpdateVehicleImages";

interface UpdateVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onReload: () => void;
}

export default function UpdateVehicleModal({
  isOpen,
  onClose,
  vehicle,
  onReload,
}: UpdateVehicleModalProps) {

  if (!vehicle) return null;

  /**
   * Tabs
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
      label: "Images",
      icon: PhotoIcon,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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

            {/* Brand Indicator */}

            <Box
              w="4px"
              h="28px"
              bg="brand.500"
              borderRadius="full"
            />

            {/* Header Text */}

            <Box>

              <Text
                fontSize="lg"
                fontWeight="700"
                color="dark.900"
              >
                Update Vehicle
              </Text>

              <Text
                fontSize="xs"
                color="gray.500"
                fontWeight="400"
                mt={0.5}
              >
                Update vehicle information and inventory details
              </Text>

            </Box>

          </Flex>
        </ModalHeader>

        {/* Close Button */}

        <ModalCloseButton
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

              {/* INFORMATION */}

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

                  <UpdateVehicleInformation
                    vehicle={vehicle}
                    onReload={onReload}
                    onClose={onClose}
                  />

                </Box>

              </TabPanel>

              {/* SPECIFICATIONS */}

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

                  <UpdateVehicleSpecification
                    vehicle={vehicle}
                    onReload={onReload}
                    onClose={onClose}
                  />

                </Box>

              </TabPanel>

              {/* DOCUMENTS */}

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
                  <UpdateVehicleDocuments
                    vehicle={vehicle}
                    onReload={async () => {
                      await onReload();
                    }}
                    onClose={onClose}
                  />
                </Box>
              </TabPanel>

              {/* IMAGES */}

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

                  <UpdateVehicleImages
                    vehicle={vehicle}
                    onReload={onReload}
                    onClose={onClose}
                  />

                </Box>

              </TabPanel>

            </TabPanels>

          </Tabs>

        </ModalBody>

      </ModalContent>

    </Modal>
  );
}