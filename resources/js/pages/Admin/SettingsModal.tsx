import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
}: SettingsModalProps) {
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
          <Heading
            size="md"
            color="dark.900"
          >
            Settings
          </Heading>

          <Text
            mt={1}
            fontSize="sm"
            fontWeight="400"
            color="gray.500"
          >
            Manage your account and system preferences.
          </Text>
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
          py={5}
        >
          <VStack
            align="stretch"
            spacing={5}
          >
            {/* ACCOUNT */}
            <Box
              bg="white"
              p={5}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              boxShadow="sm"
            >
              <Heading
                size="sm"
                color="dark.900"
                mb={1}
              >
                Account
              </Heading>

              <Text
                fontSize="xs"
                color="gray.500"
                mb={4}
              >
                Your authenticated account information.
              </Text>

              <VStack
                align="stretch"
                spacing={4}
              >
                <FormControl>
                  <FormLabel
                    fontSize="xs"
                    fontWeight="600"
                    color="gray.700"
                  >
                    Username
                  </FormLabel>

                  <Input
                    value="admin"
                    size="sm"
                    isReadOnly
                    bg="gray.50"
                    borderColor="gray.300"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel
                    fontSize="xs"
                    fontWeight="600"
                    color="gray.700"
                  >
                    Email
                  </FormLabel>

                  <Input
                    value="admin@example.com"
                    size="sm"
                    isReadOnly
                    bg="gray.50"
                    borderColor="gray.300"
                  />
                </FormControl>

                <Flex
                  align="center"
                  justify="space-between"
                >
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Account Role
                    </Text>

                    <Text
                      fontSize="xs"
                      color="gray.500"
                      mt={0.5}
                    >
                      Current access level
                    </Text>
                  </Box>

                  <Badge
                    px={2.5}
                    py={1}
                    borderRadius="md"
                    fontSize="10px"
                    colorScheme="blue"
                  >
                    Administrator
                  </Badge>
                </Flex>
              </VStack>
            </Box>

            {/* APPEARANCE */}
            <Box
              bg="white"
              p={5}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              boxShadow="sm"
            >
              <Heading
                size="sm"
                color="dark.900"
                mb={1}
              >
                Appearance
              </Heading>

              <Text
                fontSize="xs"
                color="gray.500"
                mb={4}
              >
                Customize how the administration panel looks.
              </Text>

              <VStack
                align="stretch"
                spacing={4}
              >
                <FormControl>
                  <FormLabel
                    fontSize="xs"
                    fontWeight="600"
                    color="gray.700"
                  >
                    Theme
                  </FormLabel>

                  <Select
                    defaultValue="light"
                    size="sm"
                    bg="white"
                    borderColor="gray.300"
                  >
                    <option value="light">
                      Light
                    </option>

                    <option value="dark">
                      Dark
                    </option>

                    <option value="system">
                      System Default
                    </option>
                  </Select>
                </FormControl>

                <Flex
                  align="center"
                  justify="space-between"
                >
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Compact Sidebar
                    </Text>

                    <Text
                      fontSize="xs"
                      color="gray.500"
                      mt={0.5}
                    >
                      Use a smaller sidebar by default.
                    </Text>
                  </Box>

                  <Switch
                    colorScheme="brand"
                    defaultChecked={false}
                  />
                </Flex>
              </VStack>
            </Box>

            {/* NOTIFICATIONS */}
            <Box
              bg="white"
              p={5}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              boxShadow="sm"
            >
              <Heading
                size="sm"
                color="dark.900"
                mb={1}
              >
                Notifications
              </Heading>

              <Text
                fontSize="xs"
                color="gray.500"
                mb={4}
              >
                Choose which notifications you want to receive.
              </Text>

              <VStack
                align="stretch"
                spacing={4}
              >
                <Flex
                  align="center"
                  justify="space-between"
                >
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="600"
                      color="gray.700"
                    >
                      System Notifications
                    </Text>

                    <Text
                      fontSize="xs"
                      color="gray.500"
                      mt={0.5}
                    >
                      Receive important system alerts.
                    </Text>
                  </Box>

                  <Switch
                    colorScheme="brand"
                    defaultChecked
                  />
                </Flex>

                <Divider />

                <Flex
                  align="center"
                  justify="space-between"
                >
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="600"
                      color="gray.700"
                    >
                      Message Notifications
                    </Text>

                    <Text
                      fontSize="xs"
                      color="gray.500"
                      mt={0.5}
                    >
                      Receive alerts when new messages arrive.
                    </Text>
                  </Box>

                  <Switch
                    colorScheme="brand"
                    defaultChecked
                  />
                </Flex>
              </VStack>
            </Box>

            {/* SYSTEM */}
            <Box
              bg="white"
              p={5}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              boxShadow="sm"
            >
              <Heading
                size="sm"
                color="dark.900"
                mb={1}
              >
                System
              </Heading>

              <Text
                fontSize="xs"
                color="gray.500"
                mb={4}
              >
                Information about the administration system.
              </Text>

              <VStack
                align="stretch"
                spacing={3}
              >
                <Flex justify="space-between">
                  <Text
                    fontSize="xs"
                    color="gray.500"
                  >
                    Application
                  </Text>

                  <Text
                    fontSize="xs"
                    fontWeight="600"
                    color="gray.700"
                  >
                    AUTO CDO
                  </Text>
                </Flex>

                <Flex justify="space-between">
                  <Text
                    fontSize="xs"
                    color="gray.500"
                  >
                    Version
                  </Text>

                  <Text
                    fontSize="xs"
                    fontWeight="600"
                    color="gray.700"
                  >
                    v1.0.0
                  </Text>
                </Flex>

                <Flex justify="space-between">
                  <Text
                    fontSize="xs"
                    color="gray.500"
                  >
                    Environment
                  </Text>

                  <Badge
                    colorScheme="green"
                    fontSize="10px"
                    px={2}
                    borderRadius="md"
                  >
                    Production
                  </Badge>
                </Flex>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        {/* FOOTER */}
        <ModalFooter
          bg="white"
          borderTop="1px solid"
          borderColor="gray.200"
          gap={2}
        >
          <Button
            size="sm"
            variant="ghost"
            color="gray.600"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            size="sm"
            colorScheme="brand"
            borderRadius="md"
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

