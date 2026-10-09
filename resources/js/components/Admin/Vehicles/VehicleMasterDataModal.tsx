import {
    Box,
    Button,
    Flex,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Text,
} from "@chakra-ui/react";

import ViewBrands from "./VehicleMasterData/ViewBrand";
import ViewModels from "./VehicleMasterData/ViewModel";
import ViewVariants from "./VehicleMasterData/ViewVariant";
import ViewExpenses from "./VehicleMasterData/ViewExpenses";

interface VehicleMasterDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReload: () => void;
}

export default function AdminVehicleMasterDataModal({
    isOpen,
    onClose,
}: VehicleMasterDataModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="6xl"
            scrollBehavior="inside"
            isCentered
        >
            <ModalOverlay
                bg="blackAlpha.600"
                backdropFilter="blur(3px)"
            />

            <ModalContent
                borderRadius="xl"
                overflow="hidden"
                boxShadow="2xl"
                border="1px solid"
                borderColor="gray.200"
            >
                {/* HEADER */}
                <ModalHeader
                    px={{ base: 5, md: 7 }}
                    pt={6}
                    pb={4}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    bg="white"
                >
                    <Box>
                        <Text
                            fontSize="xl"
                            fontWeight="700"
                            color="gray.800"
                            lineHeight="1.3"
                        >
                            Vehicle Master Data
                        </Text>

                        <Text
                            mt={1}
                            fontSize="sm"
                            fontWeight="400"
                            color="gray.500"
                        >
                            Manage vehicle brands, models, variants,
                            and expense types.
                        </Text>
                    </Box>
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
                    py={5}
                    bg="gray.50"
                >
                    <Box
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        overflow="hidden"
                    >
                        <Tabs
                            isLazy
                            variant="unstyled"
                            colorScheme="blue"
                        >
                            {/* TABS */}
                            <TabList
                                px={{ base: 2, md: 4 }}
                                pt={3}
                                gap={1}
                                borderBottom="1px solid"
                                borderColor="gray.200"
                                overflowX="auto"
                                bg="white"
                            >
                                <Tab
                                    px={5}
                                    py={3}
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.500"
                                    borderRadius="md"
                                    _hover={{
                                        color: "blue.600",
                                        bg: "blue.50",
                                    }}
                                    _selected={{
                                        color: "blue.600",
                                        bg: "blue.50",
                                        boxShadow:
                                            "inset 0 -2px 0",
                                    }}
                                >
                                    Brands
                                </Tab>

                                <Tab
                                    px={5}
                                    py={3}
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.500"
                                    borderRadius="md"
                                    _hover={{
                                        color: "blue.600",
                                        bg: "blue.50",
                                    }}
                                    _selected={{
                                        color: "blue.600",
                                        bg: "blue.50",
                                        boxShadow:
                                            "inset 0 -2px 0",
                                    }}
                                >
                                    Models
                                </Tab>

                                <Tab
                                    px={5}
                                    py={3}
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.500"
                                    borderRadius="md"
                                    _hover={{
                                        color: "blue.600",
                                        bg: "blue.50",
                                    }}
                                    _selected={{
                                        color: "blue.600",
                                        bg: "blue.50",
                                        boxShadow:
                                            "inset 0 -2px 0",
                                    }}
                                >
                                    Variants
                                </Tab>

                                <Tab
                                    px={5}
                                    py={3}
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.500"
                                    borderRadius="md"
                                    _hover={{
                                        color: "blue.600",
                                        bg: "blue.50",
                                    }}
                                    _selected={{
                                        color: "blue.600",
                                        bg: "blue.50",
                                        boxShadow:
                                            "inset 0 -2px 0",
                                    }}
                                >
                                    Expenses
                                </Tab>
                            </TabList>

                            {/* TAB CONTENT */}
                            <TabPanels>
                                <TabPanel
                                    px={{ base: 4, md: 5 }}
                                    py={5}
                                >
                                    <ViewBrands />
                                </TabPanel>

                                <TabPanel
                                    px={{ base: 4, md: 5 }}
                                    py={5}
                                >
                                    <ViewModels />
                                </TabPanel>

                                <TabPanel
                                    px={{ base: 4, md: 5 }}
                                    py={5}
                                >
                                    <ViewVariants />
                                </TabPanel>

                                <TabPanel
                                    px={{ base: 4, md: 5 }}
                                    py={5}
                                >
                                    <ViewExpenses />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
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
                    <Flex
                        w="100%"
                        justify="flex-end"
                    >
                        <Button
                            onClick={onClose}
                            variant="outline"
                            size="sm"
                            borderRadius="md"
                            color="gray.600"
                            borderColor="gray.300"
                            _hover={{
                                bg: "gray.50",
                                borderColor: "gray.400",
                            }}
                        >
                            Close
                        </Button>
                    </Flex>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}