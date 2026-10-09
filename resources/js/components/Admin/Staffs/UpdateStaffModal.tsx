import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";

import {
  BriefcaseIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  UserIcon,
} from "@heroicons/react/24/solid";

import {
  updateStaff,
  type Staff,
  type UpdateStaffData,
} from "../../../api/UserManagement/staffApi";

interface UpdateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onUpdated?: () => void;
}

type UpdateStaffForm = {
  first_name: string;
  middle_name: string;
  last_name: string;

  address: string;
  mobile_number: string;

  hire_date: string;
  work_start_hour: string;
  work_end_hour: string;

  status:
    | "active"
    | "inactive"
    | "resigned"
    | "terminated";
};

const initialForm: UpdateStaffForm = {
  first_name: "",
  middle_name: "",
  last_name: "",

  address: "",
  mobile_number: "",

  hire_date: "",
  work_start_hour: "",
  work_end_hour: "",

  status: "active",
};

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

export default function AdminUpdateStaffModal({
  isOpen,
  onClose,
  staff,
  onUpdated,
}: UpdateStaffModalProps) {
  const toast = useToast();

  const [loading, setLoading] = useState(false);

  const [staffForm, setStaffForm] =
    useState<UpdateStaffForm>(initialForm);

  // Load Selected Staff

  useEffect(() => {
    if (!staff) {
      setStaffForm(initialForm);
      return;
    }

    setStaffForm({
      first_name: staff.first_name,
      middle_name: staff.middle_name ?? "",
      last_name: staff.last_name,

      address: staff.address,
      mobile_number: staff.mobile_number,

      hire_date: staff.hire_date,

      work_start_hour:
        staff.work_start_hour?.slice(0, 5) || "",

      work_end_hour:
        staff.work_end_hour?.slice(0, 5) || "",

      status: staff.status,
    });
  }, [staff]);

  // Handle Input

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setStaffForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update Staff

  const handleUpdate = async () => {
    if (!staff) {
      return;
    }

    try {
      setLoading(true);

      const data: UpdateStaffData = {
        first_name: staffForm.first_name,
        middle_name: staffForm.middle_name || null,
        last_name: staffForm.last_name,

        address: staffForm.address,
        mobile_number: staffForm.mobile_number,

        hire_date: staffForm.hire_date,
        work_start_hour: staffForm.work_start_hour,
        work_end_hour: staffForm.work_end_hour,

        status: staffForm.status,
      };

      await updateStaff(staff.id, data);

      toast({
        title: "Staff Updated",
        description: `${staff.first_name} ${staff.last_name} has been updated successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      onUpdated?.();
      onClose();
    } catch (error) {
      console.error("Update staff error:", error);

      if (axios.isAxiosError(error)) {
        console.error(
          "Response:",
          error.response?.data
        );

        const errors =
          error.response?.data?.errors;

        let description =
          error.response?.data?.message ??
          "Unable to update staff.";

        // Laravel validation errors
        if (errors) {
          description = Object.values(errors)
            .flat()
            .join(" ");
        }

        toast({
          title: "Unable to update staff",
          description,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      } else {
        toast({
          title: "Error",
          description:
            "Something went wrong while updating the staff.",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
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
              <PencilSquareIcon
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
                Update Staff
              </Text>

              <Text
                fontSize="xs"
                fontWeight="400"
                color="gray.500"
                mt={0.5}
              >
                Update personal information, contact details,
                and work schedule.
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
                description="Update the staff member's personal and contact information."
              />

              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                }}
                gap={4}
              >
                {/* First Name */}

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      First Name
                    </FormLabel>

                    <Input
                      name="first_name"
                      value={staffForm.first_name}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      rounded="md"
                      _hover={{
                        borderColor: "gray.400",
                      }}
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow:
                          "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    />
                  </FormControl>
                </GridItem>

                {/* Middle Name */}

                <GridItem>
                  <FormControl>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Middle Name
                    </FormLabel>

                    <Input
                      name="middle_name"
                      value={staffForm.middle_name}
                      onChange={handleChange}
                      placeholder="Enter middle name"
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      rounded="md"
                      _hover={{
                        borderColor: "gray.400",
                      }}
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow:
                          "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    />
                  </FormControl>
                </GridItem>

                {/* Last Name */}

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Last Name
                    </FormLabel>

                    <Input
                      name="last_name"
                      value={staffForm.last_name}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      rounded="md"
                      _hover={{
                        borderColor: "gray.400",
                      }}
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow:
                          "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    />
                  </FormControl>
                </GridItem>

                {/* Mobile Number */}

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Mobile Number
                    </FormLabel>

                    <Input
                      name="mobile_number"
                      value={staffForm.mobile_number}
                      onChange={handleChange}
                      placeholder="09XXXXXXXXX"
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      rounded="md"
                      _hover={{
                        borderColor: "gray.400",
                      }}
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow:
                          "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    />
                  </FormControl>
                </GridItem>

                {/* Address */}

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Address
                    </FormLabel>

                    <Input
                      name="address"
                      value={staffForm.address}
                      onChange={handleChange}
                      placeholder="Enter complete address"
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      rounded="md"
                      _hover={{
                        borderColor: "gray.400",
                      }}
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow:
                          "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            {/* Employment Information */}

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
                  <BriefcaseIcon
                    width={18}
                    height={18}
                  />
                }
                title="Employment Information"
                description="Update the staff member's hire date and current employment status."
              />

              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                }}
                gap={4}
              >
                {/* Hire Date */}

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Hire Date
                    </FormLabel>

                    <Input
                      type="date"
                      name="hire_date"
                      value={staffForm.hire_date}
                      onChange={handleChange}
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      rounded="md"
                      _hover={{
                        borderColor: "gray.400",
                      }}
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow:
                          "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    />
                  </FormControl>
                </GridItem>

                {/* Status */}

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Status
                    </FormLabel>

                    <Select
                      name="status"
                      value={staffForm.status}
                      onChange={handleChange}
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      rounded="md"
                      _hover={{
                        borderColor: "gray.400",
                      }}
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow:
                          "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    >
                      <option value="active">
                        Active
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>

                      <option value="resigned">
                        Resigned
                      </option>

                      <option value="terminated">
                        Terminated
                      </option>
                    </Select>
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            {/* Work Schedule */}

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
                  <CalendarDaysIcon
                    width={18}
                    height={18}
                  />
                }
                title="Work Schedule"
                description="Update the regular working hours of the staff member."
              />

              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                }}
                gap={4}
              >
                {/* Work Start */}

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Work Start Hour
                    </FormLabel>

                    <Input
                      type="time"
                      name="work_start_hour"
                      value={
                        staffForm.work_start_hour
                      }
                      onChange={handleChange}
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      rounded="md"
                      _hover={{
                        borderColor: "gray.400",
                      }}
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow:
                          "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    />
                  </FormControl>
                </GridItem>

                {/* Work End */}

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Work End Hour
                    </FormLabel>

                    <Input
                      type="time"
                      name="work_end_hour"
                      value={
                        staffForm.work_end_hour
                      }
                      onChange={handleChange}
                      size="sm"
                      bg="white"
                      borderColor="gray.300"
                      rounded="md"
                      _hover={{
                        borderColor: "gray.400",
                      }}
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow:
                          "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    />
                  </FormControl>
                </GridItem>
              </Grid>
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
            mr={3}
            size="sm"
            variant="ghost"
            color="gray.600"
            onClick={onClose}
            isDisabled={loading}
            _hover={{
              bg: "gray.100",
              color: "gray.800",
            }}
          >
            Cancel
          </Button>

          <Button
            size="sm"
            colorScheme="brand"
            leftIcon={
              <PencilSquareIcon
                width={16}
                height={16}
              />
            }
            onClick={handleUpdate}
            isLoading={loading}
            loadingText="Updating..."
          >
            Update Staff
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

