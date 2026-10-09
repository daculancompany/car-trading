import { useEffect, useState, type ReactNode } from "react";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
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
  Textarea,
  useToast,
} from "@chakra-ui/react";

import {
  IdentificationIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

import axios from "axios";

import {
  createRole,
  type CreateRoleData,
  type RoleType,
} from "../../../api/UserManagement/roleApi";

// Props

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Section Header

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <HStack spacing={3} mb={4}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="34px"
        h="34px"
        borderRadius="md"
        bg="brand.50"
        color="brand.500"
        flexShrink={0}
      >
        {icon}
      </Box>

      <Box>
        <Heading
          size="xs"
          color="gray.800"
          fontWeight="700"
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
}

// Component

export default function AddRoleModal({
  isOpen,
  onClose,
  onSuccess,
}: AddRoleModalProps) {
  const toast = useToast();

  const [formData, setFormData] = useState<CreateRoleData>({
    name: "",
    role_type: "system",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  // Reset Form

  const resetForm = () => {
    setFormData({
      name: "",
      role_type: "system",
      description: "",
    });
  };

  // Reset when modal closes

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Handle Change

  const handleChange = (
    field: keyof CreateRoleData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Create Role

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Role name is required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });

      return;
    }

    if (!formData.role_type) {
      toast({
        title: "Role type is required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });

      return;
    }

    try {
      setLoading(true);

      const payload: CreateRoleData = {
        name: formData.name.trim(),
        role_type: formData.role_type,
        description:
          formData.description?.trim() || null,
      };

      await createRole(payload);

      toast({
        title: "Role created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      resetForm();

      onClose();

      onSuccess();
    } catch (error) {
      console.error("Failed to create role:", error);

      if (axios.isAxiosError(error)) {
        const validationErrors =
          error.response?.data?.errors;

        if (validationErrors) {
          const messages = Object.values(
            validationErrors,
          )
            .flat()
            .join("\n");

          toast({
            title: "Validation error.",
            description: messages,
            status: "error",
            duration: 5000,
            isClosable: true,
          });

          return;
        }

        toast({
          title: "Failed to create role.",
          description:
            error.response?.data?.message ||
            "An unexpected error occurred.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });

        return;
      }

      toast({
        title: "Failed to create role.",
        description: "An unexpected error occurred.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Render

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
        border="1px solid"
        borderColor="gray.200"
        borderRadius="lg"
        boxShadow="xl"
        overflow="hidden"
      >
        {/* Header */}
        <ModalHeader
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
          px={6}
          py={4}
        >
          <HStack spacing={3}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="36px"
              h="36px"
              borderRadius="md"
              bg="brand.50"
              color="brand.500"
              flexShrink={0}
            >
              <IdentificationIcon
                width={20}
                height={20}
              />
            </Box>

            <Box>
              <Heading
                size="sm"
                color="gray.800"
                fontWeight="700"
              >
                Add New Role
              </Heading>

              <Text
                fontSize="xs"
                color="gray.500"
                fontWeight="400"
                mt={0.5}
              >
                Create a new system role and define its
                access category.
              </Text>
            </Box>
          </HStack>

          <ModalCloseButton
            top={4}
            right={4}
            borderRadius="md"
            _hover={{
              bg: "gray.100",
            }}
          />
        </ModalHeader>

        {/* Body */}
        <ModalBody
          bg="gray.50"
          px={{ base: 4, md: 6 }}
          py={5}
        >
          <Box
            bg="white"
            p={5}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            boxShadow="sm"
          >
            <SectionHeader
              icon={
                <IdentificationIcon
                  width={18}
                  height={18}
                />
              }
              title="Role Information"
              description="Enter the details for the new role."
            />

            <Stack spacing={4}>
              {/* Role Name */}
              <FormControl isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="600"
                  color="gray.700"
                  mb={1.5}
                >
                  Role Name
                </FormLabel>

                <Input
                  value={formData.name}
                  onChange={(e) =>
                    handleChange("name", e.target.value)
                  }
                  placeholder="Enter role name"
                  size="sm"
                  bg="white"
                  borderColor="gray.300"
                  borderRadius="md"
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

              {/* Role Type */}
              <FormControl isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="600"
                  color="gray.700"
                  mb={1.5}
                >
                  Role Type
                </FormLabel>

                <Select
                  value={formData.role_type}
                  onChange={(e) =>
                    handleChange(
                      "role_type",
                      e.target.value as RoleType,
                    )
                  }
                  size="sm"
                  bg="white"
                  borderColor="gray.300"
                  borderRadius="md"
                  _hover={{
                    borderColor: "gray.400",
                  }}
                  _focus={{
                    borderColor: "brand.500",
                    boxShadow:
                      "0 0 0 1px var(--chakra-colors-brand-500)",
                  }}
                >
                  <option value="system">
                    System
                  </option>

                  <option value="staffs">
                    Staffs
                  </option>

                  <option value="customers">
                    Customers
                  </option>
                </Select>
              </FormControl>

              {/* Description */}
              <FormControl>
                <FormLabel
                  fontSize="sm"
                  fontWeight="600"
                  color="gray.700"
                  mb={1.5}
                >
                  Description
                </FormLabel>

                <Textarea
                  value={formData.description ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "description",
                      e.target.value,
                    )
                  }
                  placeholder="Enter role description"
                  size="sm"
                  rows={4}
                  resize="vertical"
                  bg="white"
                  borderColor="gray.300"
                  borderRadius="md"
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
            </Stack>
          </Box>
        </ModalBody>

        {/* Footer */}
        <ModalFooter
          bg="white"
          borderTop="1px solid"
          borderColor="gray.200"
          px={6}
          py={4}
          gap={2}
        >
          <Button
            variant="ghost"
            size="sm"
            borderRadius="md"
            onClick={onClose}
            isDisabled={loading}
            _hover={{
              bg: "gray.100",
            }}
          >
            Cancel
          </Button>

          <Button
            colorScheme="brand"
            size="sm"
            borderRadius="md"
            leftIcon={
              <PlusIcon
                width={16}
                height={16}
              />
            }
            onClick={handleCreate}
            isLoading={loading}
            loadingText="Creating..."
          >
            Add Role
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

