import { NavLink, useNavigate } from "react-router-dom";

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
  Box,
  Image,
  useToast,
} from "@chakra-ui/react";

import {
  Squares2X2Icon,
  TruckIcon,
  KeyIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import Logo from "../../assets/logo/logo.jpg";

import { logout } from "../../api/UserManagement/authApi";
import { clearAuth } from "../../utils/auth";

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Customer Menu Groups

const menuGroups = [
  {
    label: "MAIN",

    menus: [
      {
        title: "Dashboard",
        icon: Squares2X2Icon,
        path: "/customer-dashboard",
      },
    ],
  },

  {
    label: "SHOPPING",

    menus: [
      {
        title: "Vehicles",
        icon: TruckIcon,
        path: "/customer-vehicles",
      },
      {
        title: "My Vehicles",
        icon: KeyIcon,
        path: "/customer-owned-vehicles",
      },
      {
        title: "Reservations",
        icon: CalendarDaysIcon,
        path: "/customer-reservations",
      },
    ],
  },

  {
    label: "FINANCING & DOCUMENTATION",

    menus: [
      {
        title: "Financings",
        icon: BriefcaseIcon,
        path: "/customer-financings",
      },
      {
        title: "Documents",
        icon: DocumentTextIcon,
        path: "/customer-documents",
      },
    ],
  },

  {
    label: "PAYMENTS",

    menus: [
      {
        title: "Payments",
        icon: CreditCardIcon,
        path: "/customer-payments",
      },
    ],
  },

  {
    label: "SERVICE OPERATIONS",

    menus: [
      {
        title: "Request Services",
        icon: WrenchScrewdriverIcon,
        path: "/customer-request-services",
      },
    ],
  },
];

// Mobile Customer Sidebar

export default function MobileSidebar({
  isOpen,
  onClose,
}: MobileSidebarProps) {
  const navigate = useNavigate();
  const toast = useToast();

  // Logout

  const handleLogout = async () => {
    try {
      await logout();

    } catch (error) {
      console.error(error);
    } finally {
      clearAuth();

      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      onClose();

      navigate("/browse-vehicles", {
        replace: true,
      });
    }
  };

  return (
    <Drawer
      placement="left"
      isOpen={isOpen}
      onClose={onClose}
    >
      <DrawerOverlay />

      <DrawerContent
        bg="dark.700"
        color="white"
        maxW="280px"
      >
        {/* HEADER */}

        <DrawerCloseButton
          color="white"
          _hover={{
            bg: "dark.600",
          }}
        />

        <DrawerHeader
          borderBottomWidth="0"
          px={5}
          py={5}
        >
          <Flex
            align="center"
            justify="center"
          >
            <Image
              src={Logo}
              w="155px"
              h="auto"
              objectFit="contain"
            />
          </Flex>
        </DrawerHeader>

        {/* MENU */}

        <DrawerBody
          px={3}
          py={2}
          overflowY="auto"
          css={{
            "&::-webkit-scrollbar": {
              width: "4px",
            },

            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },

            "&::-webkit-scrollbar-thumb": {
              background: "#363C40",
              borderRadius: "8px",
            },

            "&::-webkit-scrollbar-thumb:hover": {
              background: "#555D62",
            },
          }}
        >
          <VStack
            align="stretch"
            spacing={4}
          >
            {menuGroups.map((group) => (
              <Box key={group.label}>
                {/* CATEGORY LABEL */}

                <Text
                  px={4}
                  mb={2}
                  fontSize="10px"
                  fontWeight="700"
                  letterSpacing="0.08em"
                  color="gray.400"
                >
                  {group.label}
                </Text>

                {/* GROUP MENUS */}

                <VStack
                  align="stretch"
                  spacing={1}
                >
                  {group.menus.map((menu) => (
                    <NavLink
                      key={menu.path}
                      to={menu.path}
                      onClick={onClose}
                    >
                      {({ isActive }) => (
                        <Flex
                          align="center"
                          gap={4}
                          px={4}
                          py={2.5}
                          minH="44px"
                          rounded="lg"
                          bg={
                            isActive
                              ? "brand.500"
                              : "transparent"
                          }
                          color="white"
                          transition="all 0.2s ease"
                          _hover={{
                            bg: isActive
                              ? "brand.600"
                              : "dark.600",
                            color: "white",
                          }}
                        >
                          <Icon
                            as={menu.icon}
                            boxSize={5}
                            flexShrink={0}
                          />

                          <Text
                            fontSize="sm"
                            fontWeight={
                              isActive ? "600" : "500"
                            }
                            color="white"
                            noOfLines={1}
                          >
                            {menu.title}
                          </Text>
                        </Flex>
                      )}
                    </NavLink>
                  ))}
                </VStack>
              </Box>
            ))}
          </VStack>
        </DrawerBody>

        {/* LOGOUT */}

        <Box
          p={3}
          flexShrink={0}
        >
          <Flex
            align="center"
            gap={4}
            px={4}
            py={2.5}
            minH="44px"
            rounded="lg"
            cursor="pointer"
            color="white"
            transition="all 0.2s ease"
            _hover={{
              bg: "red.600",
              color: "white",
            }}
            onClick={handleLogout}
          >
            <Icon
              as={ArrowRightOnRectangleIcon}
              boxSize={5}
              flexShrink={0}
            />

            <Text
              fontSize="sm"
              fontWeight="500"
              color="white"
            >
              Logout
            </Text>
          </Flex>
        </Box>
      </DrawerContent>
    </Drawer>
  );
}