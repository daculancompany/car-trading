import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
} from "@chakra-ui/react";

import {
  Bars3Icon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import api from "../../api/api";

import NotificationModal from "../../pages/Admin/AdminNotificationBell";

import UserMenu from "../../components/Shared/UserMenu";
// Adjust this path if your CustomerMessageWidget is located elsewhere
import CustomerMessageWidget from "../../components/Customers/Messages/CustomerMessage";

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpenMobile: () => void;
}

export default function CustomerHeader({
  collapsed,
  onToggle,
  onOpenMobile,
}: HeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] =
    useState(false);

  const [isMessageOpen, setIsMessageOpen] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  /*
   * Fetch Unread Notification Count
   */

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get(
        "/notifications/unread-count",
      );

      setUnreadCount(
        response.data.unread_count,
      );
    } catch (error) {
      console.error(
        "Failed to fetch unread notification count:",
        error,
      );
    }
  }, []);

  /*
   * Notification Polling
   */

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  /*
   * Render
   */

  return (
    <Flex
      h="70px"
      px={{
        base: 4,
        md: 6,
      }}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      justify="space-between"
      align="center"
      flexShrink={0}
    >
      {/* LEFT */}

      <HStack spacing={3}>
        {/* DESKTOP SIDEBAR TOGGLE */}

        <IconButton
          aria-label={
            collapsed
              ? "Expand Sidebar"
              : "Collapse Sidebar"
          }
          icon={
            <Icon
              as={
                collapsed
                  ? ChevronDoubleRightIcon
                  : ChevronDoubleLeftIcon
              }
              boxSize={7}
            />
          }
          variant="ghost"
          color="dark.600"
          display={{
            base: "none",
            lg: "flex",
          }}
          _hover={{
            bg: "gray.100",
            color: "brand.500",
          }}
          onClick={onToggle}
        />

        {/* MOBILE MENU */}

        <IconButton
          aria-label="Open Menu"
          icon={
            <Icon
              as={Bars3Icon}
              boxSize={6}
            />
          }
          variant="ghost"
          color="dark.600"
          display={{
            base: "flex",
            lg: "none",
          }}
          _hover={{
            bg: "gray.100",
            color: "brand.500",
          }}
          onClick={onOpenMobile}
        />

        {/* SYSTEM IDENTITY */}

        <Box
          ml={10}
          display={{
            base: "none",
            sm: "block",
          }}
        >
          <HStack spacing={2}>
            <Text
              fontSize="sm"
              fontWeight="700"
              color="dark.900"
              letterSpacing="wide"
            >
              AUTO CDO
            </Text>

            <Text
              fontSize="xs"
              color="gray.400"
            >
              •
            </Text>

            <Text
              fontSize="xs"
              fontWeight="500"
              color="gray.800"
            >
              CUSTOMER PORTAL
            </Text>
          </HStack>

          <Text
            fontSize="xs"
            color="gray.800"
            mt={0.5}
          >
            Car Trading Customer Services
          </Text>
        </Box>
      </HStack>

      {/* RIGHT */}

      <HStack spacing={2}>
        {/* MESSAGES */}

        <IconButton
          aria-label="Messages"
          icon={
            <Icon
              as={ChatBubbleLeftRightIcon}
              boxSize={5}
            />
          }
          variant="ghost"
          color="dark.600"
          _hover={{
            bg: "brand.50",
            color: "brand.500",
          }}
          onClick={() => {
            setIsMessageOpen(true);
          }}
        />

        {/* NOTIFICATIONS */}

        <Box position="relative">
          <IconButton
            aria-label="Notifications"
            icon={
              <Icon
                as={BellIcon}
                boxSize={5}
              />
            }
            variant="ghost"
            color="dark.600"
            _hover={{
              bg: "brand.50",
              color: "brand.500",
            }}
            onClick={() => {
              setIsNotificationOpen(true);
              fetchUnreadCount();
            }}
          />

          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              borderRadius="full"
              minW="18px"
              h="18px"
              px={1}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="10px"
              fontWeight="700"
              border="2px solid white"
            >
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </Badge>
          )}
        </Box>

        <UserMenu profilePath="/customer-profile" />
      </HStack>

      {/* CUSTOMER MESSAGE MODAL */}

      <CustomerMessageWidget
        isOpen={isMessageOpen}
        onClose={() => {
          setIsMessageOpen(false);
        }}
      />

      {/* NOTIFICATION MODAL */}

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => {
          setIsNotificationOpen(false);
          fetchUnreadCount();
        }}
      />
    </Flex>
  );
}