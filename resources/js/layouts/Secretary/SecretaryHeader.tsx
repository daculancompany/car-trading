import {
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";


import UserMenu from "../../components/Shared/UserMenu";
import NotificationModal from "../../pages/Secretary/NotificationModal";

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpenMobile: () => void;
}

export default function SecretaryHeader({
  collapsed,
  onToggle,
  onOpenMobile,
}: HeaderProps) {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] =
    useState(false);


  return (
    <Flex
      h="75px"
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
          color="dark.800"
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
              boxSize={7}
            />
          }
          variant="ghost"
          color="dark.800"
          display={{
            base: "flex",
            lg: "none",
          }}
          _hover={{
            bg: "gray.200",
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
              SECRETARY PANEL
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
        <IconButton
          aria-label="Notifications"
          icon={
            <Icon
              as={BellIcon}
              boxSize={6}
            />
          }
          variant="ghost"
          color="dark.800"
          _hover={{
            bg: "gray.200",
            color: "brand.500",
          }}
          onClick={() => setIsNotificationOpen(true)}
        />

        {/* Messages */}
        <IconButton
          aria-label="Messages"
          icon={
            <Icon
              as={ChatBubbleLeftRightIcon}
              boxSize={6}
            />
          }
          variant="ghost"
          color="dark.800"
          _hover={{
            bg: "gray.200",
            color: "brand.500",
          }}
          onClick={() => navigate("/secretary-messages")}
        />

        <UserMenu profilePath="/secretary-profile" />
      </HStack>

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

    </Flex>

  );
}

