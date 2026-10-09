
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Box,
  Button,
  Card,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";

import {
  EyeIcon,
  EyeSlashIcon,
  UserPlusIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import {
  registerCustomer,
  type RegisterCustomerData,
} from "../../api/UserManagement/customerApi";
import PhotoPicker from "../../components/Shared/Customers/PhotoPicker";

import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/apiToast";

interface CustomerRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerRegisterModal({
  isOpen,
  onClose,
}: CustomerRegisterModalProps) {
  const navigate = useNavigate();
  const toast = useToast();

  // Password Visibility
  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // Loading
  const [loading, setLoading] =
    useState(false);

  const [photo, setPhoto] = useState<File | null>(null);

  // Form
  const [form, setForm] =
    useState<RegisterCustomerData>({
      username: "",
      email: "",
      password: "",
      password_confirmation: "",

      first_name: "",
      middle_name: "",
      last_name: "",
      suffix: "",

      address: "",

      civil_status: "single",

      employment_type: "employed",

      mobile_number: "",
      facebook: "",
    });

  // Handle Input Change

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Register

  const handleRegister = async () => {
    if (loading) return;

    try {
      setLoading(true);

      await registerCustomer({ ...form, image: photo });

      showSuccessToast(
        toast,
        "Success",
        "Account created successfully.",
      );

      onClose();
      navigate("/login");
    } catch (error: unknown) {
      console.error(
        "Customer registration failed:",
        error,
      );

      if (axios.isAxiosError(error)) {
        showErrorToast(
          toast,
          error,
          "Unable to create account.",
        );
      } else {
        toast({
          title: "Error",
          description:
            "Something went wrong while creating your account.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Password Match

  const passwordsMatch =
    form.password ===
    form.password_confirmation;

  // Field Security Validation

  const EMAIL_REGEX =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const USERNAME_REGEX =
    /^[a-zA-Z0-9_.]{4,20}$/;

  const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const isEmailValid =
    form.email.trim() === "" ||
    EMAIL_REGEX.test(form.email.trim());

  const isUsernameValid =
    form.username.trim() === "" ||
    USERNAME_REGEX.test(form.username.trim());

  const isPasswordValid =
    form.password === "" ||
    PASSWORD_REGEX.test(form.password);

  // Form Validation

  const isFormValid =
    form.first_name.trim() !== "" &&
    form.last_name.trim() !== "" &&
    form.address.trim() !== "" &&
    form.mobile_number.trim() !== "" &&
    form.email.trim() !== "" &&
    EMAIL_REGEX.test(form.email.trim()) &&
    form.username.trim() !== "" &&
    USERNAME_REGEX.test(form.username.trim()) &&
    form.password.trim() !== "" &&
    PASSWORD_REGEX.test(form.password) &&
    form.password_confirmation.trim() !== "" &&
    passwordsMatch;

  // UI

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", md: "4xl" }}
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay bg="blackAlpha.600" />

      <ModalContent
        mx={{ base: 0, sm: 3, md: 4 }}
        my={{ base: 0, md: 6 }}
        maxH={{ base: "100vh", md: "90vh" }}
        borderRadius={{ base: 0, sm: "md" }}
        overflow="hidden"
      >
        <ModalCloseButton
          zIndex={10}
          top={{ base: 3, md: 4 }}
          right={{ base: 3, md: 4 }}
          bg="whiteAlpha.900"
          borderRadius="full"
          _hover={{ bg: "white" }}
        />

        <ModalBody p={0}>
          {/* REGISTER FORM */}

          <Card
            w="100%"
            bg="white"
            border="none"
            borderRadius="0"
            boxShadow="none"
            overflow="hidden"
          >

            <CardBody
              p={{
                base: 4,
                sm: 6,
                md: 8,
              }}
            >

              <VStack
                spacing={{
                  base: 6,
                  md: 7,
                }}
                align="stretch"
              >

                {/* HEADER */}

                <Box>

                  <Flex
                    align="center"
                    gap={3}
                  >

                    <Flex
                      w="42px"
                      h="42px"
                      flexShrink={0}
                      align="center"
                      justify="center"
                      bg="gray.100"
                      color="brand.500"
                      borderRadius="md"
                    >

                      <Icon
                        as={UserPlusIcon}
                        boxSize={6}
                      />

                    </Flex>

                    <Box>

                      <Text
                        fontSize="xs"
                        fontWeight="700"
                        color="brand.500"
                        letterSpacing="0.08em"
                      >
                        CUSTOMER REGISTRATION
                      </Text>

                      <Heading
                        fontSize={{
                          base: "xl",
                          md: "2xl",
                        }}
                        lineHeight="1.2"
                        mt={0.5}
                        color="dark.900"
                      >
                        Create Your Account
                      </Heading>

                    </Box>

                  </Flex>

                  <Text
                    mt={3}
                    color="gray.500"
                    fontSize="sm"
                    lineHeight="1.6"
                  >
                    Register your customer account
                    to explore vehicles, manage
                    reservations, and track your
                    transactions.
                  </Text>

                </Box>

                <Divider borderColor="gray.200" />

                {/* PERSONAL INFORMATION */}

                <Box>

                  <Text
                    fontSize="sm"
                    fontWeight="700"
                    color="gray.700"
                    letterSpacing="0.06em"
                    mb={4}
                  >
                    PERSONAL INFORMATION
                  </Text>

                  <Box mb={5}>
                    <Text fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
                      Profile Photo (optional)
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
                    gap={{
                      base: 4,
                      md: 4,
                    }}
                  >

                    {/* First Name */}

                    <GridItem>

                      <FormControl isRequired>

                        <FormLabel
                          fontSize="sm"
                          fontWeight="500"
                          color="dark.900"
                          mb={1.5}
                        >
                          First Name
                        </FormLabel>

                        <Input
                          name="first_name"
                          value={form.first_name}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          size="md"
                          h="44px"
                          borderColor="gray.200"
                          _hover={{
                            borderColor:
                              "brand.500",
                          }}
                          _focus={{
                            borderColor:
                              "brand.500",
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
                          fontWeight="500"
                          color="dark.900"
                          mb={1.5}
                        >
                          Middle Name
                        </FormLabel>

                        <Input
                          name="middle_name"
                          value={
                            form.middle_name ?? ""
                          }
                          onChange={handleChange}
                          placeholder="Enter middle name"
                          size="md"
                          h="44px"
                          borderColor="gray.200"
                          _hover={{
                            borderColor:
                              "brand.500",
                          }}
                          _focus={{
                            borderColor:
                              "brand.500",
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
                          fontWeight="500"
                          color="dark.900"
                          mb={1.5}
                        >
                          Last Name
                        </FormLabel>

                        <Input
                          name="last_name"
                          value={form.last_name}
                          onChange={handleChange}
                          placeholder="Enter last name"
                          size="md"
                          h="44px"
                          borderColor="gray.200"
                          _hover={{
                            borderColor:
                              "brand.500",
                          }}
                          _focus={{
                            borderColor:
                              "brand.500",
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
                          fontWeight="500"
                          color="dark.900"
                          mb={1.5}
                        >
                          Suffix
                        </FormLabel>

                        <Input
                          name="suffix"
                          value={form.suffix ?? ""}
                          onChange={handleChange}
                          placeholder="e.g. Jr., Sr., III"
                          size="md"
                          h="44px"
                          borderColor="gray.200"
                          _hover={{
                            borderColor: "brand.500",
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
                          fontWeight="500"
                          color="dark.900"
                          mb={1.5}
                        >
                          Mobile Number
                        </FormLabel>

                        <Input
                          name="mobile_number"
                          value={
                            form.mobile_number
                          }
                          onChange={handleChange}
                          placeholder="09XXXXXXXXX"
                          size="md"
                          h="44px"
                          borderColor="gray.200"
                          _hover={{
                            borderColor:
                              "brand.500",
                          }}
                          _focus={{
                            borderColor:
                              "brand.500",
                            boxShadow:
                              "0 0 0 1px var(--chakra-colors-brand-500)",
                          }}
                        />

                      </FormControl>

                    </GridItem>

                    {/* Address */}

                    <GridItem
                      colSpan={{
                        base: 1,
                        md: 2,
                      }}
                    >

                      <FormControl isRequired>

                        <FormLabel
                          fontSize="sm"
                          fontWeight="500"
                          color="dark.900"
                          mb={1.5}
                        >
                          Address
                        </FormLabel>

                        <Input
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          placeholder="Enter complete address"
                          size="md"
                          h="44px"
                          borderColor="gray.200"
                          _hover={{
                            borderColor:
                              "brand.500",
                          }}
                          _focus={{
                            borderColor:
                              "brand.500",
                            boxShadow:
                              "0 0 0 1px var(--chakra-colors-brand-500)",
                          }}
                        />

                      </FormControl>

                    </GridItem>

                    {/* Civil Status */}

                    <GridItem>

                      <FormControl isRequired>

                        <FormLabel
                          fontSize="sm"
                          fontWeight="500"
                          color="dark.900"
                          mb={1.5}
                        >
                          Civil Status
                        </FormLabel>

                        <Select
                          name="civil_status"
                          value={
                            form.civil_status
                          }
                          onChange={handleChange}
                          size="md"
                          h="44px"
                          borderColor="gray.200"
                          _hover={{
                            borderColor:
                              "brand.500",
                          }}
                          _focus={{
                            borderColor:
                              "brand.500",
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

                    </GridItem>

                    {/* Employment Type */}

                    <GridItem>

                      <FormControl isRequired>

                        <FormLabel
                          fontSize="sm"
                          fontWeight="500"
                          color="dark.900"
                          mb={1.5}
                        >
                          Employment Type
                        </FormLabel>

                        <Select
                          name="employment_type"
                          value={
                            form.employment_type
                          }
                          onChange={handleChange}
                          size="md"
                          h="44px"
                          borderColor="gray.200"
                          _hover={{
                            borderColor:
                              "brand.500",
                          }}
                          _focus={{
                            borderColor:
                              "brand.500",
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

                    </GridItem>

                    {/* Facebook */}

                    <GridItem>

                      <FormControl>

                        <FormLabel
                          fontSize="sm"
                          fontWeight="500"
                          color="dark.900"
                          mb={1.5}
                        >
                          Facebook
                        </FormLabel>

                        <Input
                          name="facebook"
                          value={
                            form.facebook ?? ""
                          }
                          onChange={handleChange}
                          placeholder="Facebook profile"
                          size="md"
                          h="44px"
                          borderColor="gray.200"
                          _hover={{
                            borderColor:
                              "brand.500",
                          }}
                          _focus={{
                            borderColor:
                              "brand.500",
                            boxShadow:
                              "0 0 0 1px var(--chakra-colors-brand-500)",
                          }}
                        />

                      </FormControl>

                    </GridItem>

                  </Grid>

                </Box>

                {/* ACCOUNT INFORMATION */}

                <Box>

                  <Divider mb={6} borderColor="gray.200" />

                  <Text
                    fontSize="sm"
                    fontWeight="700"
                    color="gray.700"
                    letterSpacing="0.06em"
                    mb={4}
                  >
                    ACCOUNT INFORMATION
                  </Text>

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
                          fontWeight="500"
                          color="dark.900"
                          mb={1.5}
                        >
                          Email Address
                        </FormLabel>

                        <Input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="example@email.com"
                          size="md"
                          h="44px"
                          borderColor={
                            isEmailValid
                              ? "gray.300"
                              : "red.400"
                          }
                          _hover={{
                            borderColor:
                              "brand.500",
                          }}
                          _focus={{
                            borderColor:
                              "brand.500",
                            boxShadow:
                              "0 0 0 1px var(--chakra-colors-brand-500)",
                          }}
                        />

                        {!isEmailValid && (
                          <Text
                            color="red.500"
                            fontSize="xs"
                            mt={1}
                          >
                            Enter a valid email address.
                          </Text>
                        )}

                      </FormControl>

                    </GridItem>

                    {/* Username */}

                    <GridItem>

                      <FormControl isRequired>

                        <FormLabel
                          fontSize="sm"
                          fontWeight="500"
                          color="dark.900"
                          mb={1.5}
                        >
                          Username
                        </FormLabel>

                        <Input
                          name="username"
                          value={
                            form.username
                          }
                          onChange={handleChange}
                          placeholder="Enter username"
                          size="md"
                          h="44px"
                          borderColor={
                            isUsernameValid
                              ? "gray.300"
                              : "red.400"
                          }
                          _hover={{
                            borderColor:
                              "brand.500",
                          }}
                          _focus={{
                            borderColor:
                              "brand.500",
                            boxShadow:
                              "0 0 0 1px var(--chakra-colors-brand-500)",
                          }}
                        />

                        {!isUsernameValid && (
                          <Text
                            color="red.500"
                            fontSize="xs"
                            mt={1}
                          >
                            4-20 characters: letters, numbers, "." or "_" only.
                          </Text>
                        )}

                      </FormControl>

                    </GridItem>

                    {/* Password */}

                    <GridItem>

                      <FormControl isRequired>

                        <FormLabel
                          fontSize="sm"
                          fontWeight="500"
                          color="dark.900"
                          mb={1.5}
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
                            value={
                              form.password
                            }
                            onChange={handleChange}
                            placeholder="Enter password"
                            size="md"
                            h="44px"
                            pr="3rem"
                            borderColor={
                              isPasswordValid
                                ? "gray.300"
                                : "red.400"
                            }
                            _hover={{
                              borderColor:
                                "brand.500",
                            }}
                            _focus={{
                              borderColor:
                                "brand.500",
                              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                            }}
                          />

                          <InputRightElement
                            h="44px"
                            right={1}
                          >

                            <IconButton
                              aria-label={
                                showPassword
                                  ? "Hide Password"
                                  : "Show Password"
                              }
                              variant="ghost"
                              size="sm"
                              icon={
                                <Icon
                                  as={
                                    showPassword
                                      ? EyeSlashIcon
                                      : EyeIcon
                                  }
                                  boxSize={5}
                                />
                              }
                              onClick={() =>
                                setShowPassword(
                                  (prev) =>
                                    !prev,
                                )
                              }
                            />

                          </InputRightElement>

                        </InputGroup>

                        <Text
                          color={
                            !isPasswordValid &&
                              form.password !== ""
                              ? "red.500"
                              : "gray.500"
                          }
                          fontSize="xs"
                          mt={1}
                        >
                          Min 8 characters with uppercase,
                          lowercase, number, and special
                          character.
                        </Text>

                      </FormControl>

                    </GridItem>

                    {/* Confirm Password */}

                    <GridItem>

                      <FormControl isRequired>

                        <FormLabel
                          fontSize="sm"
                          fontWeight="500"
                          color="dark.900"
                          mb={1.5}
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
                            size="md"
                            h="44px"
                            pr="3rem"
                            borderColor="gray.200"
                            _hover={{
                              borderColor:
                                "brand.500",
                            }}
                            _focus={{
                              borderColor:
                                "brand.500",
                              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                            }}
                          />

                          <InputRightElement
                            h="44px"
                            right={1}
                          >

                            <IconButton
                              aria-label={
                                showConfirmPassword
                                  ? "Hide Password"
                                  : "Show Password"
                              }
                              variant="ghost"
                              size="sm"
                              icon={
                                <Icon
                                  as={
                                    showConfirmPassword
                                      ? EyeSlashIcon
                                      : EyeIcon
                                  }
                                  boxSize={5}
                                />
                              }
                              onClick={() =>
                                setShowConfirmPassword(
                                  (prev) =>
                                    !prev,
                                )
                              }
                            />

                          </InputRightElement>

                        </InputGroup>

                      </FormControl>

                    </GridItem>

                    {/* Password Warning */}

                    {form.password_confirmation &&
                      !passwordsMatch && (
                        <GridItem
                          colSpan={{
                            base: 1,
                            md: 2,
                          }}
                        >

                          <Text
                            color="red.500"
                            fontSize="xs"
                            mt={-1}
                          >
                            Passwords do not match.
                          </Text>

                        </GridItem>
                      )}

                  </Grid>

                </Box>

                {/* SECURITY NOTICE */}

                <Flex
                  align="flex-start"
                  gap={3}
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={3}
                >

                  <Icon
                    as={ShieldCheckIcon}
                    boxSize={6}
                    color="gray.500"
                    mt={0.5}
                    flexShrink={0}
                  />

                  <Text
                    fontSize="xs"
                    color="gray.600"
                    lineHeight="1.5"
                  >
                    Your customer account information
                    is protected. Please provide
                    accurate information and keep
                    your login credentials confidential.
                  </Text>

                </Flex>

                {/* CREATE ACCOUNT */}

                <Button
                  colorScheme="brand"
                  size="md"
                  h="44px"
                  borderRadius="md"
                  fontWeight="600"
                  isLoading={loading}
                  loadingText="Creating Account..."
                  onClick={handleRegister}
                  isDisabled={!isFormValid}
                >
                  Create Customer Account
                </Button>

                {/* LOGIN */}

                <Text
                  textAlign="center"
                  fontSize="sm"
                  color="gray.500"
                >
                  Already have an account?{" "}

                  <Text
                    as={Link}
                    to="/login"
                    color="brand.500"
                    fontWeight="700"
                    display="inline"
                    _hover={{
                      textDecoration:
                        "underline",
                    }}
                  >
                    Sign In
                  </Text>
                </Text>
              </VStack>
            </CardBody>

          </Card>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

