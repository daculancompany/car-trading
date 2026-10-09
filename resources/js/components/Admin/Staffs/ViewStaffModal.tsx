import type { ReactNode } from "react";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Heading,
  Badge,
  Grid,
  GridItem,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";

import {
  CalendarDaysIcon,
  ClockIcon,
  IdentificationIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/solid";

import type { Staff } from "../../../api/UserManagement/staffApi";

interface ViewStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
}

// Section Header

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

const SectionHeader = ({
  icon,
  title,
  description,
}: SectionHeaderProps) => (
  <HStack
    spacing={3}
    mb={4}
    align="flex-start"
  >
    <Box
      w="34px"
      h="34px"
      rounded="md"
      bg="brand.50"
      color="brand.500"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      {icon}
    </Box>

    <Box>
      <Heading
        size="xs"
        color="gray.800"
      >
        {title}
      </Heading>

      {description && (
        <Text
          fontSize="xs"
          color="gray.500"
          mt={0.5}
        >
          {description}
        </Text>
      )}
    </Box>
  </HStack>
);

// Information Row

interface InfoRowProps {
  label: string;
  value: ReactNode;
}

const InfoRow = ({
  label,
  value,
}: InfoRowProps) => (
  <Grid
    templateColumns={{
      base: "1fr",
      sm: "150px 1fr",
    }}
    gap={{ base: 1, sm: 4 }}
    py={2}
    borderBottom="1px solid"
    borderColor="gray.100"
    _last={{
      borderBottom: "none",
    }}
  >
    <Text
      fontSize="sm"
      fontWeight="600"
      color="gray.600"
    >
      {label}
    </Text>

    <Text
      fontSize="sm"
      color="gray.800"
      wordBreak="break-word"
    >
      {value}
    </Text>
  </Grid>
);

// Component

export default function AdminViewStaffModal({
  isOpen,
  onClose,
  staff,
}: ViewStaffModalProps) {
  if (!staff) return null;

  // Format Time

  const formatTime = (time: string) => {
    return new Date(
      `1970-01-01T${time}`
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format Date

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-PH",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  // Full Name

  const fullName = [
    staff.first_name,
    staff.middle_name,
    staff.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  // Status Color

  const getStatusColor = () => {
    switch (staff.status) {
      case "active":
        return "green";

      case "inactive":
        return "orange";

      case "resigned":
        return "yellow";

      case "terminated":
        return "red";

      default:
        return "gray";
    }
  };

  // UI

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.500" />

      <ModalContent
        rounded="lg"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.200"
        shadow="xl"
      >
        {/* Header */}

        <ModalHeader
          px={{ base: 5, md: 6 }}
          py={4}
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          <HStack spacing={3}>
            <Box
              w="38px"
              h="38px"
              rounded="md"
              bg="brand.50"
              color="brand.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <IdentificationIcon
                width={20}
                height={20}
              />
            </Box>

            <Box>
              <Text
                fontSize="md"
                fontWeight="700"
                color="gray.800"
              >
                View Staff Information
              </Text>

              <Text
                fontSize="xs"
                fontWeight="400"
                color="gray.500"
                mt={0.5}
              >
                View account, personal, and employment information.
              </Text>
            </Box>
          </HStack>
        </ModalHeader>

        <ModalCloseButton
          top={3}
          right={3}
          size="sm"
          color="gray.500"
          _hover={{
            bg: "gray.100",
            color: "gray.700",
          }}
        />

        {/* Body */}

        <ModalBody
          bg="gray.50"
          px={{ base: 4, md: 6 }}
          py={5}
        >
          <Stack spacing={5}>

            {/* Account Information */}

            <Box
              bg="white"
              p={{ base: 4, md: 5 }}
              rounded="lg"
              border="1px solid"
              borderColor="gray.200"
              shadow="sm"
            >
              <SectionHeader
                icon={
                  <IdentificationIcon
                    width={18}
                    height={18}
                  />
                }
                title="Account Information"
                description="Staff login and assigned system role."
              />

              <Stack spacing={0}>
                <InfoRow
                  label="Position"
                  value={staff.user.role.name}
                />

                <InfoRow
                  label="Email"
                  value={staff.user.email}
                />

                <InfoRow
                  label="Username"
                  value={staff.user.username}
                />
              </Stack>
            </Box>

            {/* Staff Information */}

            <Box
              bg="white"
              p={{ base: 4, md: 5 }}
              rounded="lg"
              border="1px solid"
              borderColor="gray.200"
              shadow="sm"
            >
              <SectionHeader
                icon={
                  <UserIcon
                    width={18}
                    height={18}
                  />
                }
                title="Staff Information"
                description="Personal and employment information."
              />

              <Stack spacing={0}>
                <InfoRow
                  label="First Name"
                  value={staff.first_name}
                />

                <InfoRow
                  label="Middle Name"
                  value={staff.middle_name || "-"}
                />

                <InfoRow
                  label="Last Name"
                  value={staff.last_name}
                />

                <InfoRow
                  label="Complete Name"
                  value={fullName}
                />

                <InfoRow
                  label="Address"
                  value={
                    <HStack
                      spacing={2}
                      align="flex-start"
                    >
                      <MapPinIcon
                        width={16}
                        height={16}
                        style={{
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      />

                      <Text fontSize="sm">
                        {staff.address}
                      </Text>
                    </HStack>
                  }
                />

                <InfoRow
                  label="Mobile Number"
                  value={
                    <HStack spacing={2}>
                      <PhoneIcon
                        width={16}
                        height={16}
                      />

                      <Text fontSize="sm">
                        {staff.mobile_number}
                      </Text>
                    </HStack>
                  }
                />

                <InfoRow
                  label="Hire Date"
                  value={
                    <HStack spacing={2}>
                      <CalendarDaysIcon
                        width={16}
                        height={16}
                      />

                      <Text fontSize="sm">
                        {formatDate(staff.hire_date)}
                      </Text>
                    </HStack>
                  }
                />

                <InfoRow
                  label="Work Start Hour"
                  value={
                    <HStack spacing={2}>
                      <ClockIcon
                        width={16}
                        height={16}
                      />

                      <Text fontSize="sm">
                        {formatTime(
                          staff.work_start_hour
                        )}
                      </Text>
                    </HStack>
                  }
                />

                <InfoRow
                  label="Work End Hour"
                  value={
                    <HStack spacing={2}>
                      <ClockIcon
                        width={16}
                        height={16}
                      />

                      <Text fontSize="sm">
                        {formatTime(
                          staff.work_end_hour
                        )}
                      </Text>
                    </HStack>
                  }
                />

                <Grid
                  templateColumns={{
                    base: "1fr",
                    sm: "150px 1fr",
                  }}
                  gap={{ base: 1, sm: 4 }}
                  py={2}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="gray.600"
                  >
                    Status
                  </Text>

                  <GridItem>
                    <Badge
                      colorScheme={getStatusColor()}
                      px={2}
                      py={1}
                      rounded="md"
                      fontSize="xs"
                      fontWeight="600"
                      textTransform="capitalize"
                    >
                      {staff.status}
                    </Badge>
                  </GridItem>
                </Grid>
              </Stack>
            </Box>
          </Stack>
        </ModalBody>

        {/* Footer */}

        <ModalFooter
          px={{ base: 4, md: 6 }}
          py={4}
          bg="white"
          borderTop="1px solid"
          borderColor="gray.200"
        >
          <Button
            size="sm"
            variant="ghost"
            color="gray.600"
            onClick={onClose}
            _hover={{
              bg: "gray.100",
              color: "gray.800",
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

