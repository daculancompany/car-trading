import { NavLink } from "react-router-dom";

import {
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerOverlay,
    DrawerCloseButton,
    DrawerHeader,
    VStack,
    Flex,
    Text,
    Icon,
} from "@chakra-ui/react";

import { FiClock,
    FiGrid,
    FiTruck,
    FiUsers,
    FiCalendar,
    FiFileText,
    FiCreditCard,
    FiDollarSign,
    FiBarChart2,
    FiTool,
    FiPackage,
    FiLogOut,
} from "react-icons/fi";

const menus = [
    { title: "Dashboard", icon: FiGrid, path: "/secretary-dashboard" },
    { title: "Vehicles", icon: FiTruck, path: "/secretary-vehicles" },
    { title: "Customers", icon: FiUsers, path: "/secretary-customers" },
    { title: "Reservations", icon: FiCalendar, path: "/secretary-reservations" },
    { title: "Documents", icon: FiFileText, path: "/secretary-documents" },
    { title: "Payments", icon: FiCreditCard, path: "/secretary-payments" },
    { title: "Sales", icon: FiDollarSign, path: "/secretary-sales" },
    { title: "Reports", icon: FiBarChart2, path: "/secretary-reports" },
    { title: "Job Orders", icon: FiTool, path: "/secretary-job-orders" },
    { title: "Schedule", icon: FiClock, path: "/secretary-schedule" },
    { title: "Vehicle Parts", icon: FiPackage, path: "/secretary-vehicle-parts" },
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: Props) {
    return (
        <Drawer placement="left" isOpen={isOpen} onClose={onClose}>
            <DrawerOverlay />

            <DrawerContent bg="dark.900" color="white">
                <DrawerCloseButton />

                <DrawerHeader borderBottomWidth="1px">AUTO CDO</DrawerHeader>

                <DrawerBody p={4}>
                    <VStack align="stretch" spacing={2}>
                        {menus.map((menu) => (
                            <NavLink key={menu.path} to={menu.path} onClick={onClose}>
                                {({ isActive }) => (
                                    <Flex
                                        align="center"
                                        gap={4}
                                        px={4}
                                        py={3}
                                        rounded="xl"
                                        bg={isActive ? "brand.500" : "transparent"}
                                        _hover={{
                                            bg: "brand.500",
                                        }}
                                    >
                                        <Icon as={menu.icon} boxSize={5} />

                                        <Text>{menu.title}</Text>
                                    </Flex>
                                )}
                            </NavLink>
                        ))}

                        <Flex
                            align="center"
                            gap={4}
                            px={4}
                            py={3}
                            rounded="xl"
                            cursor="pointer"
                            _hover={{
                                bg: "red.500",
                            }}
                        >
                            <Icon as={FiLogOut} />

                            <Text>Logout</Text>
                        </Flex>
                    </VStack>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
}
