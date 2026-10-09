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

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/api";

import UserMenu from "../../components/Shared/UserMenu";
import NotificationModal from "../../pages/Admin/AdminNotificationBell";

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpenMobile: () => void;
}

export default function AdminHeader({
  collapsed,
  onToggle,
  onOpenMobile,
}: HeaderProps) {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] =
    useState(false);
  const [unreadCount, setUnreadCount] = useState(0);


  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get("/notifications/unread-count");

      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error(
        "Failed to fetch unread notification count:",
        error
      );
    }
  }, []);
  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <Flex
      h="70px"
      px={{ base: 4, md: 6 }}
      bg="white"
      borderColor="gray.200"
      justify="space-between"
      align="center"
      flexShrink={0}
    >
      {/* LEFT */}
      <HStack spacing={3}>
        {/* Desktop Sidebar Toggle */}
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

        {/* Mobile Menu */}
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

        {/* System Identity */}
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
              ADMIN PANEL
            </Text>
          </HStack>

          <Text
            fontSize="xs"
            color="gray.800"
            mt={0.5}
          >
            Car Trading Inventory and Sales Management
          </Text>
        </Box>
      </HStack>

      {/* RIGHT */}
      <HStack spacing={2}>
        {/* Notifications */}
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
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Box>

        {/* Messages */}
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
          onClick={() => navigate("/admin-messages")}
        />

        <UserMenu profilePath="/admin-profile" />
      </HStack>

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

