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
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
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
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";

import {
  createStaff,
  type CreateStaffData,
} from "../../../api/UserManagement/staffApi";

import {
  getRoles,
  type Role,
} from "../../../api/UserManagement/roleApi";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

type CreateStaffForm = Omit<CreateStaffData, "role_id"> & {
  role_id: number | "";
};

const initialForm: CreateStaffForm = {
  role_id: "",

  username: "",
  email: "",

  password: "",
  password_confirmation: "",

  first_name: "",
  middle_name: "",
  last_name: "",
  suffix: "",

  address: "",
  mobile_number: "",

  hire_date: "",
  work_start_hour: "",
  work_end_hour: "",
};

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

export default function AdminAddStaffModal({
  isOpen,
  onClose,
  onAdded,
}: AddStaffModalProps) {
  const toast = useToast();

  const [loading, setLoading] = useState(false);

  const [roles, setRoles] = useState<Role[]>([]);

  const [staffForm, setStaffForm] =
    useState<CreateStaffForm>(initialForm);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // Load Staff Roles

  useEffect(() => {
    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);

  const loadRoles = async () => {
    try {
      const data = await getRoles();

      const staffRoles = data.filter(
        (role) => role.role_type === "staffs"
      );

      setRoles(staffRoles);
    } catch (error) {
      console.error(
        "Failed to load staff roles:",
        error
      );

      toast({
        title: "Error",
        description:
          "Unable to load staff positions.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  // Handle Input

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setStaffForm((prev) => ({
      ...prev,

      [name]:
        name === "role_id"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  // Reset Form

  const resetForm = () => {
    setStaffForm(initialForm);

    setShowPassword(false);

    setShowConfirmPassword(false);
  };

  // Close

  const handleClose = () => {
    if (loading) return;

    resetForm();

    onClose();
  };

  // Save Staff

  const handleSave = async () => {
    if (staffForm.role_id === "") {
      toast({
        title: "Required",
        description:
          "Please select a staff position.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    if (
      !staffForm.password ||
      !staffForm.password_confirmation
    ) {
      toast({
        title: "Required",
        description:
          "Please enter the password and confirm password.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    if (
      staffForm.password !==
      staffForm.password_confirmation
    ) {
      toast({
        title: "Password mismatch",
        description:
          "Password and confirm password do not match.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    try {
      setLoading(true);

      const data: CreateStaffData = {
        ...staffForm,
        role_id: staffForm.role_id as number,
      };

      await createStaff(data);

      toast({
        title: "Success",
        description:
          "Staff created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      resetForm();

      onClose();

      onAdded();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Create staff error:",
          error.response?.data
        );

        const errors =
          error.response?.data?.errors;

        let description =
          error.response?.data?.message ??
          "Unable to create staff.";

        if (errors) {
          description = Object.values(errors)
            .flat()
            .join(" ");
        }

        toast({
          title: "Unable to create staff",
          description,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      } else {
        console.error(error);

        toast({
          title: "Error",
          description:
            "Something went wrong while creating the staff.",
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

  // UI

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
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
          borderBottom="1px solid"
          borderColor="gray.200"
          bg="white"
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
              <UserPlusIcon
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
                Add Staff
              </Text>

              <Text
                fontSize="xs"
                fontWeight="400"
                color="gray.500"
                mt={0.5}
              >
                Register a new staff member in the system.
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
                description="Enter the personal information of the staff member."
              />

              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                }}
                gap={4}
              >
                {/* Position */}

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Position
                    </FormLabel>

                    <Select
                      name="role_id"
                      value={staffForm.role_id}
                      onChange={handleChange}
                      placeholder="Select Position"
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
                      {roles.map((role) => (
                        <option
                          key={role.id}
                          value={role.id}
                        >
                          {role.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </GridItem>

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
                      value={staffForm.middle_name ?? ""}
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

                {/* Suffix */}

                <GridItem>
                  <FormControl>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Suffix
                    </FormLabel>

                    <Input
                      name="suffix"
                      value={staffForm.suffix ?? ""}
                      onChange={handleChange}
                      placeholder="Enter suffix"
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
              </Grid>
            </Box>

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
                  <LockClosedIcon
                    width={18}
                    height={18}
                  />
                }
                title="Account Information"
                description="Create the login credentials for the staff account."
              />

              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                }}
                gap={4}
              >
                {/* Email */}

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Email Address
                    </FormLabel>

                    <Input
                      type="email"
                      name="email"
                      value={staffForm.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
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

                {/* Username */}

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Username
                    </FormLabel>

                    <Input
                      name="username"
                      value={staffForm.username}
                      onChange={handleChange}
                      placeholder="Enter username"
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

                {/* Password */}

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Password
                    </FormLabel>

                    <InputGroup>
                      <Input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        value={staffForm.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        size="sm"
                        bg="white"
                        borderColor="gray.300"
                        rounded="md"
                        pr="40px"
                        _hover={{
                          borderColor: "gray.400",
                        }}
                        _focus={{
                          borderColor: "brand.500",
                          boxShadow:
                            "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                      />

                      <InputRightElement h="100%">
                        <IconButton
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          icon={
                            showPassword ? (
                              <EyeSlashIcon
                                width={17}
                                height={17}
                              />
                            ) : (
                              <EyeIcon
                                width={17}
                                height={17}
                              />
                            )
                          }
                          size="sm"
                          variant="ghost"
                          color="gray.500"
                          onClick={() =>
                            setShowPassword(
                              (prev) => !prev
                            )
                          }
                          _hover={{
                            bg: "gray.100",
                            color: "gray.700",
                          }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                </GridItem>

                {/* Confirm Password */}

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Confirm Password
                    </FormLabel>

                    <InputGroup>
                      <Input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        name="password_confirmation"
                        value={
                          staffForm.password_confirmation
                        }
                        onChange={handleChange}
                        placeholder="Confirm password"
                        size="sm"
                        bg="white"
                        borderColor="gray.300"
                        rounded="md"
                        pr="40px"
                        _hover={{
                          borderColor: "gray.400",
                        }}
                        _focus={{
                          borderColor: "brand.500",
                          boxShadow:
                            "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                      />

                      <InputRightElement h="100%">
                        <IconButton
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          icon={
                            showConfirmPassword ? (
                              <EyeSlashIcon
                                width={17}
                                height={17}
                              />
                            ) : (
                              <EyeIcon
                                width={17}
                                height={17}
                              />
                            )
                          }
                          size="sm"
                          variant="ghost"
                          color="gray.500"
                          onClick={() =>
                            setShowConfirmPassword(
                              (prev) => !prev
                            )
                          }
                          _hover={{
                            bg: "gray.100",
                            color: "gray.700",
                          }}
                        />
                      </InputRightElement>
                    </InputGroup>
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
                  <BriefcaseIcon
                    width={18}
                    height={18}
                  />
                }
                title="Work Schedule"
                description="Set the regular working hours for this staff member."
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
            onClick={handleClose}
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
              <UserPlusIcon
                width={16}
                height={16}
              />
            }
            onClick={handleSave}
            isLoading={loading}
            loadingText="Saving..."
          >
            Save Staff
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

