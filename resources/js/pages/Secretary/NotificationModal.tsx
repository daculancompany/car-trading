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
  Text,
  VStack,
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

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const notifications = [
  {
    id: 1,
    sender: "Maria Santos",
    title: "New Reservation",
    message:
      "A new vehicle reservation has been submitted and requires your attention.",
    notification_type: "reservation",
    is_read: false,
    created_at: "Today, 9:42 AM",
  },
  {
    id: 2,
    sender: "John Doe",
    title: "Payment Received",
    message:
      "A payment has been successfully recorded for the customer's financing account.",
    notification_type: "payment",
    is_read: false,
    created_at: "Today, 8:30 AM",
  },
  {
    id: 3,
    sender: "System",
    title: "Vehicle Updated",
    message:
      "Vehicle inventory information has been updated successfully.",
    notification_type: "vehicle",
    is_read: true,
    created_at: "Yesterday, 4:15 PM",
  },
  {
    id: 4,
    sender: "Service Department",
    title: "Service Request",
    message:
      "A new service request has been submitted for a vehicle.",
    notification_type: "service",
    is_read: true,
    created_at: "Yesterday, 2:20 PM",
  },
  {
    id: 5,
    sender: "System",
    title: "New Message",
    message:
      "You have received a new message from a customer.",
    notification_type: "message",
    is_read: true,
    created_at: "Aug 31, 2026",
  },
];

const getNotificationIcon = (
  type: string
) => {
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

const getNotificationColor = (
  type: string
) => {
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

export default function SecretaryNotificationModal({
  isOpen,
  onClose,
}: NotificationModalProps) {
  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

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
        {/* HEADER */}
        <ModalHeader
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
          py={4}
        >
          <Flex
            align="center"
            justify="space-between"
            pr={8}
          >
            <Box>
              <HStack spacing={2}>
                <Icon
                  as={BellIcon}
                  boxSize={5}
                  color="brand.500"
                />

                <Text
                  fontSize="md"
                  fontWeight="700"
                  color="dark.900"
                >
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

              <Text
                mt={1}
                fontSize="xs"
                fontWeight="400"
                color="gray.500"
              >
                View your latest system notifications.
              </Text>
            </Box>

            <Button
              size="xs"
              variant="ghost"
              color="brand.500"
              leftIcon={
                <CheckIcon
                  width={13}
                  height={13}
                />
              }
              _hover={{
                bg: "brand.50",
              }}
            >
              Mark all as read
            </Button>
          </Flex>
        </ModalHeader>

        <ModalCloseButton
          top={4}
          color="gray.500"
          _hover={{
            bg: "gray.100",
            color: "gray.700",
          }}
        />

        {/* BODY */}
        <ModalBody
          bg="gray.50"
          p={4}
        >
          <VStack
            align="stretch"
            spacing={3}
          >
            {notifications.map(
              (notification) => {
                const NotificationIcon =
                  getNotificationIcon(
                    notification.notification_type
                  );

                const colorScheme =
                  getNotificationColor(
                    notification.notification_type
                  );

                return (
                  <Box
                    key={notification.id}
                    bg="white"
                    border="1px solid"
                    borderColor={
                      notification.is_read
                        ? "gray.200"
                        : "brand.200"
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
                    <Flex
                      align="flex-start"
                      gap={3}
                    >
                      {/* Notification Icon */}
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
                        <Icon
                          as={NotificationIcon}
                          boxSize={5}
                        />
                      </Flex>

                      {/* Content */}
                      <Box
                        flex="1"
                        minW={0}
                      >
                        <Flex
                          align="flex-start"
                          justify="space-between"
                          gap={3}
                        >
                          <Box>
                            <HStack
                              spacing={2}
                              mb={1}
                            >
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

                            <Text
                              fontSize="xs"
                              color="gray.500"
                              mb={2}
                            >
                              From:{" "}
                              <Text
                                as="span"
                                fontWeight="600"
                                color="gray.700"
                              >
                                {notification.sender}
                              </Text>
                            </Text>
                          </Box>

                          <Badge
                            colorScheme={
                              colorScheme
                            }
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
                          noOfLines={2}
                        >
                          {notification.message}
                        </Text>

                        <Text
                          mt={2}
                          fontSize="10px"
                          color="gray.400"
                        >
                          {notification.created_at}
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                );
              }
            )}
          </VStack>
        </ModalBody>

        {/* FOOTER */}
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
            _hover={{
              bg: "brand.50",
            }}
          >
            View All Notifications
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

