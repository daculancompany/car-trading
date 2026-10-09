import { useState } from "react";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Grid,
  GridItem,
  InputGroup,
  InputRightElement,
  IconButton,
  Select,
  useToast,
  Box,
  Text,
} from "@chakra-ui/react";

import {
  EyeIcon,
  EyeSlashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";

import {
  showSuccessToast,
  showErrorToast,
} from "../../../utils/apiToast";

import {
  registerCustomer,
  type RegisterCustomerData,
} from "../../../api/UserManagement/customerApi";
import PhotoPicker from "../../Shared/Customers/PhotoPicker";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const initialForm: RegisterCustomerData = {
  first_name: "",
  middle_name: "",
  last_name: "",
  address: "",
  civil_status: "single",
  employment_type: "employed",
  mobile_number: "",
  facebook: "",
  email: "",
  username: "",
  password: "",
  password_confirmation: "",
};

export default function AdminAddCustomerModal({
  isOpen,
  onClose,
  onSuccess,
}: AddCustomerModalProps) {
  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [photo, setPhoto] = useState<File | null>(null);

  const toast = useToast();

  const [form, setForm] =
    useState<RegisterCustomerData>(initialForm);

  // HANDLE INPUT CHANGE

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // RESET FORM

  const resetForm = () => {
    setForm(initialForm);
    setPhoto(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // CLOSE MODAL

  const handleClose = () => {
    if (loading) return;

    resetForm();
    onClose();
  };

  // SUBMIT

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await registerCustomer({ ...form, image: photo });

      showSuccessToast(
        toast,
        "Success",
        "Customer added successfully."
      );

      resetForm();

      onSuccess();
      onClose();
    } catch (error) {
      console.error(
        "Create customer error:",
        error
      );

      showErrorToast(
        toast,
        error,
        "Unable to create customer."
      );
    } finally {
      setLoading(false);
    }
  };

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
        {/* MODAL HEADER */}

        <ModalHeader
          px={{ base: 5, md: 6 }}
          py={4}
          borderBottom="1px solid"
          borderColor="gray.200"
          bg="white"
        >
          <Box>
            <Text
              fontSize="md"
              fontWeight="700"
              color="dark.900"
            >
              Add Customer
            </Text>

            <Text
              mt={1}
              fontSize="xs"
              fontWeight="400"
              color="gray.500"
            >
              Register a new customer in the system.
            </Text>
          </Box>
        </ModalHeader>

        <ModalCloseButton
          top={4}
          right={4}
          rounded="md"
          color="gray.500"
          _hover={{
            bg: "gray.100",
            color: "gray.700",
          }}
        />

        {/* MODAL BODY */}

        <ModalBody
          px={{ base: 5, md: 6 }}
          py={5}
          bg="gray.50"
        >
          <Box mb={5}>
            <Text fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
              Photo
            </Text>
            <PhotoPicker
              name={[form.first_name, form.last_name].filter(Boolean).join(" ")}
              value={photo}
              onChange={setPhoto}
            />
          </Box>

          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
            }}
            gap={5}
          >
            {/* FIRST NAME */}

            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
                mb={2}
              >
                First Name
              </FormLabel>

              <Input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                bg="white"
                size="sm"
                rounded="md"
                borderColor="gray.300"
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

            {/* MIDDLE NAME */}

            <FormControl>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
                mb={2}
              >
                Middle Name
              </FormLabel>

              <Input
                name="middle_name"
                value={form.middle_name ?? ""}
                onChange={handleChange}
                placeholder="Enter middle name"
                bg="white"
                size="sm"
                rounded="md"
                borderColor="gray.300"
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

            {/* LAST NAME */}

            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
                mb={2}
              >
                Last Name
              </FormLabel>

              <Input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
                bg="white"
                size="sm"
                rounded="md"
                borderColor="gray.300"
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

            {/* MOBILE NUMBER */}

            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
                mb={2}
              >
                Mobile Number
              </FormLabel>

              <Input
                name="mobile_number"
                value={form.mobile_number}
                onChange={handleChange}
                placeholder="Enter mobile number"
                bg="white"
                size="sm"
                rounded="md"
                borderColor="gray.300"
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

            {/* CIVIL STATUS */}

            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
                mb={2}
              >
                Civil Status
              </FormLabel>

              <Select
                name="civil_status"
                value={form.civil_status}
                onChange={handleChange}
                bg="white"
                size="sm"
                rounded="md"
                borderColor="gray.300"
                _hover={{
                  borderColor: "gray.400",
                }}
                _focus={{
                  borderColor: "brand.500",
                  boxShadow:
                    "0 0 0 1px var(--chakra-colors-brand-500)",
                }}
              >
                <option value="single">
                  Single
                </option>

                <option value="married">
                  Married
                </option>

                <option value="widowed">
                  Widowed
                </option>

                <option value="separated">
                  Separated
                </option>
              </Select>
            </FormControl>

            {/* EMPLOYMENT TYPE */}

            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
                mb={2}
              >
                Employment Type
              </FormLabel>

              <Select
                name="employment_type"
                value={form.employment_type}
                onChange={handleChange}
                bg="white"
                size="sm"
                rounded="md"
                borderColor="gray.300"
                _hover={{
                  borderColor: "gray.400",
                }}
                _focus={{
                  borderColor: "brand.500",
                  boxShadow:
                    "0 0 0 1px var(--chakra-colors-brand-500)",
                }}
              >
                <option value="employed">
                  Employed
                </option>

                <option value="self_employed">
                  Self-Employed
                </option>
              </Select>
            </FormControl>

            {/* FACEBOOK */}

            <FormControl>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
                mb={2}
              >
                Facebook
              </FormLabel>

              <Input
                name="facebook"
                value={form.facebook}
                onChange={handleChange}
                placeholder="Facebook profile"
                bg="white"
                size="sm"
                rounded="md"
                borderColor="gray.300"
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

            {/* ADDRESS */}

            <GridItem colSpan={{ base: 1, md: 2 }}>
              <FormControl isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="600"
                  color="gray.700"
                  mb={2}
                >
                  Address
                </FormLabel>

                <Input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  bg="white"
                  size="sm"
                  rounded="md"
                  borderColor="gray.300"
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

            {/* EMAIL */}

            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
                mb={2}
              >
                Email
              </FormLabel>

              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                bg="white"
                size="sm"
                rounded="md"
                borderColor="gray.300"
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

            {/* USERNAME */}

            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
                mb={2}
              >
                Username
              </FormLabel>

              <Input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                bg="white"
                size="sm"
                rounded="md"
                borderColor="gray.300"
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

            {/* PASSWORD */}

            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
                mb={2}
              >
                Password
              </FormLabel>

              <InputGroup>
                <Input
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  bg="white"
                  size="sm"
                  rounded="md"
                  borderColor="gray.300"
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
                    variant="ghost"
                    size="sm"
                    color="gray.500"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
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

            {/* CONFIRM PASSWORD */}

            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
                mb={2}
              >
                Confirm Password
              </FormLabel>

              <InputGroup>
                <Input
                  name="password_confirmation"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    form.password_confirmation
                  }
                  onChange={handleChange}
                  placeholder="Confirm password"
                  bg="white"
                  size="sm"
                  rounded="md"
                  borderColor="gray.300"
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
                    variant="ghost"
                    size="sm"
                    color="gray.500"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
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
          </Grid>
        </ModalBody>

        {/* MODAL FOOTER */}

        <ModalFooter
          px={{ base: 5, md: 6 }}
          py={4}
          borderTop="1px solid"
          borderColor="gray.200"
          bg="white"
        >
          <Button
            size="sm"
            variant="ghost"
            mr={2}
            onClick={handleClose}
            isDisabled={loading}
            color="gray.600"
            _hover={{
              bg: "gray.100",
              color: "gray.800",
            }}
          >
            Cancel
          </Button>

          <Button
            size="sm"
            leftIcon={
              <UserPlusIcon
                width={16}
                height={16}
              />
            }
            bg="brand.500"
            color="white"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Saving..."
            _hover={{
              bg: "brand.600",
            }}
          >
            Save Customer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

