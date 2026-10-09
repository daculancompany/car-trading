import { useEffect, useMemo, useState } from "react";

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";

import {
  BellIcon,
  CheckIcon,
  CreditCardIcon,
  DocumentTextIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

import api from "../../api/api";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationSender {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
}

interface NotificationItem {
  id: number;
  sender_user_id: number | null;
  receiver_user_id: number;
  title: string;
  message: string;
  notification_type:
  | "reservation"
  | "payment"
  | "financing"
  | "vehicle"
  | "service"
  | "job_order"
  | "system"
  | "message";
  is_read: boolean;
  created_at: string;
  sender?: NotificationSender | null;
}

interface NotificationApiResponse {
  data: {
    current_page: number;
    data: NotificationItem[];
    last_page: number;
    total: number;
  };
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "reservation":
      return CalendarDaysIcon;
    case "payment":
      return CreditCardIcon;
    case "financing":
      return BriefcaseIcon;
    case "vehicle":
      return TruckIcon;
    case "service":
      return WrenchScrewdriverIcon;
    case "job_order":
      return DocumentTextIcon;
    case "message":
      return ChatBubbleLeftRightIcon;
    case "system":
      return Cog6ToothIcon;
    default:
      return BellIcon;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "reservation":
      return "blue";
    case "payment":
      return "green";
    case "financing":
      return "purple";
    case "vehicle":
      return "orange";
    case "service":
      return "teal";
    case "job_order":
      return "cyan";
    case "message":
      return "pink";
    case "system":
      return "gray";
    default:
      return "gray";
  }
};

const getSenderName = (
  sender: NotificationSender | null | undefined,
  notificationType: string
): string => {
  if (!sender) {
    return notificationType === "system" ? "System" : "Unknown user";
  }

  if (sender.name) {
    return sender.name;
  }

  const fullName = [sender.first_name, sender.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || `User #${sender.id}`;
};

const formatNotificationDate = (date: string): string => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function AdminNotificationModal({
  isOpen,
  onClose,
}: NotificationModalProps) {
  const toast = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);

      const response =
        await api.get<NotificationApiResponse>("/notifications");

      setNotifications(response.data.data.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);

      toast({
        title: "Unable to load notifications",
        description: "Please check your connection and try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: number) => {
    try {
      setProcessingId(id);

      await api.patch(`/notifications/${id}/read`);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);

      toast({
        title: "Action failed",
        description: "The notification could not be marked as read.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setIsMarkingAll(true);

      await api.patch("/notifications/read-all");

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      toast({
        title: "Notifications updated",
        description: "All notifications have been marked as read.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);

      toast({
        title: "Action failed",
        description: "Notifications could not be updated.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.500" />

      <ModalContent
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="xl"
        overflow="hidden"
      >
        <ModalHeader
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
          py={4}
        >
          <Flex align="center" justify="space-between" pr={8}>
            <Box>
              <HStack spacing={2}>
                <Icon as={BellIcon} boxSize={5} color="brand.500" />

                <Text fontSize="md" fontWeight="700" color="dark.900">
                  Notifications
                </Text>

                {unreadCount > 0 && (
                  <Badge
                    colorScheme="red"
                    borderRadius="full"
                    fontSize="10px"
                    px={2}
                  >
                    {unreadCount} new
                  </Badge>
                )}
              </HStack>

              <Text mt={1} fontSize="xs" color="gray.500">
                View your latest system notifications.
              </Text>
            </Box>

            <Button
              size="xs"
              variant="ghost"
              color="brand.500"
              leftIcon={<CheckIcon width={13} height={13} />}
              onClick={handleMarkAllAsRead}
              isLoading={isMarkingAll}
              isDisabled={unreadCount === 0}
              _hover={{ bg: "brand.50" }}
            >
              Mark all as read
            </Button>
          </Flex>
        </ModalHeader>

        <ModalCloseButton
          top={4}
          color="gray.500"
          _hover={{ bg: "gray.100", color: "gray.700" }}
        />

        <ModalBody bg="gray.50" p={4}>
          {isLoading ? (
            <Flex justify="center" align="center" minH="180px">
              <Spinner color="brand.500" />
            </Flex>
          ) : notifications.length === 0 ? (
            <Flex
              justify="center"
              align="center"
              direction="column"
              minH="180px"
              gap={2}
            >
              <Icon as={BellIcon} boxSize={8} color="gray.300" />
              <Text fontSize="sm" color="gray.500">
                No notifications found.
              </Text>
            </Flex>
          ) : (
            <VStack align="stretch" spacing={3}>
              {notifications.map((notification) => {
                const NotificationIcon = getNotificationIcon(
                  notification.notification_type
                );

                const colorScheme = getNotificationColor(
                  notification.notification_type
                );

                return (
                  <Box
                    key={notification.id}
                    bg="white"
                    border="1px solid"
                    borderColor={
                      notification.is_read ? "gray.200" : "brand.200"
                    }
                    borderRadius="lg"
                    p={4}
                    boxShadow="sm"
                    transition="all 0.2s ease"
                    _hover={{
                      borderColor: "gray.300",
                      boxShadow: "md",
                    }}
                  >
                    <Flex align="flex-start" gap={3}>
                      <Flex
                        w="36px"
                        h="36px"
                        flexShrink={0}
                        align="center"
                        justify="center"
                        borderRadius="md"
                        bg={`${colorScheme}.50`}
                        color={`${colorScheme}.500`}
                      >
                        <Icon as={NotificationIcon} boxSize={5} />
                      </Flex>

                      <Box flex="1" minW={0}>
                        <Flex
                          align="flex-start"
                          justify="space-between"
                          gap={3}
                        >
                          <Box>
                            <HStack spacing={2} mb={1}>
                              <Text
                                fontSize="sm"
                                fontWeight="700"
                                color="dark.900"
                                noOfLines={1}
                              >
                                {notification.title}
                              </Text>

                              {!notification.is_read && (
                                <Box
                                  w="7px"
                                  h="7px"
                                  borderRadius="full"
                                  bg="brand.500"
                                  flexShrink={0}
                                />
                              )}
                            </HStack>

                            <Text fontSize="xs" color="gray.500" mb={2}>
                              From:{" "}
                              <Text
                                as="span"
                                fontWeight="600"
                                color="gray.700"
                              >
                                {getSenderName(
                                  notification.sender,
                                  notification.notification_type
                                )}
                              </Text>
                            </Text>
                          </Box>

                          <Badge
                            colorScheme={colorScheme}
                            fontSize="9px"
                            px={2}
                            borderRadius="md"
                            textTransform="capitalize"
                            flexShrink={0}
                          >
                            {notification.notification_type.replace(
                              "_",
                              " "
                            )}
                          </Badge>
                        </Flex>

                        <Text
                          fontSize="xs"
                          lineHeight="1.6"
                          color="gray.600"
                          noOfLines={3}
                        >
                          {notification.message}
                        </Text>

                        <Flex
                          mt={2}
                          align="center"
                          justify="space-between"
                          gap={2}
                        >
                          <Text fontSize="10px" color="gray.400">
                            {formatNotificationDate(notification.created_at)}
                          </Text>

                          {!notification.is_read && (
                            <Button
                              size="xs"
                              variant="ghost"
                              color="brand.500"
                              onClick={() =>
                                handleMarkAsRead(notification.id)
                              }
                              isLoading={processingId === notification.id}
                              _hover={{ bg: "brand.50" }}
                            >
                              Mark as read
                            </Button>
                          )}
                        </Flex>
                      </Box>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter
          bg="white"
          borderTop="1px solid"
          borderColor="gray.200"
          justifyContent="center"
        >
          <Button
            size="sm"
            variant="ghost"
            color="brand.500"
            width="100%"
            onClick={fetchNotifications}
            isLoading={isLoading}
            _hover={{ bg: "brand.50" }}
          >
            Refresh Notifications
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
