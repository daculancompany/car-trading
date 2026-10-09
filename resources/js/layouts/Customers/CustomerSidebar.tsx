import { NavLink, useNavigate } from "react-router-dom";

import {
  Box,
  Flex,
  Icon,
  Image,
  Text,
  VStack,
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
} from "@heroicons/react/24/solid";

import Logo from "../../assets/logo/logo.jpg";

import { logout } from "../../api/UserManagement/authApi";
import { clearAuth } from "../../utils/auth";

type SidebarProps = {
  collapsed: boolean;
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

// Customer Sidebar

export default function CustomerSidebar({
  collapsed,
}: SidebarProps) {
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
        description:
          "You have been logged out successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      navigate("/browse-vehicles", {
        replace: true,
      });
    }
  };

  // Render

  return (
    <Box
      w={collapsed ? "80px" : "230px"}
      bg="dark.700"
      color="white"
      h="100vh"
      transition="width 0.3s ease"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {/* LOGO */}

      <Flex
        direction="column"
        align="center"
        justify="center"
        py={4}
        px={2}
        flexShrink={0}
      >
        <Image
          src={Logo}
          w={collapsed ? "48px" : "155px"}
          h="auto"
          objectFit="contain"
        />
      </Flex>

      {/* MENU */}

      <Box
        flex="1"
        overflowY="auto"
        px={3}
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

              {!collapsed && (
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
              )}

              {/* GROUP MENUS */}

              <VStack
                align="stretch"
                spacing={1}
              >
                {group.menus.map((menu) => (
                  <NavLink
                    key={menu.path}
                    to={menu.path}
                  >
                    {({ isActive }) => (
                      <Flex
                        align="center"
                        justify={
                          collapsed
                            ? "center"
                            : "flex-start"
                        }
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

                        {!collapsed && (
                          <Text
                            fontSize="sm"
                            fontWeight={
                              isActive
                                ? "600"
                                : "500"
                            }
                            color="white"
                            noOfLines={1}
                          >
                            {menu.title}
                          </Text>
                        )}
                      </Flex>
                    )}
                  </NavLink>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* LOGOUT */}

      <Box
        p={3}
        flexShrink={0}
      >
        <Flex
          align="center"
          justify={
            collapsed
              ? "center"
              : "flex-start"
          }
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

          {!collapsed && (
            <Text
              fontSize="sm"
              fontWeight="500"
              color="white"
            >
              Logout
            </Text>
          )}
        </Flex>
      </Box>
    </Box>
  );
}