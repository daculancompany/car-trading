import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useDisclosure,
} from "@chakra-ui/react";

import {
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

import AddStaffModal from "./AddStaffModal";

interface StaffToolbarProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReload: () => void;
}

export default function AdminStaffToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onReload,
}: StaffToolbarProps) {
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  return (
    <>
      <Box
        layerStyle="panel"
        px={{ base: 4, md: 5 }}
        py={4}
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ base: "stretch", lg: "center" }}
          gap={4}
        >
          {/* SEARCH + STATUS */}

          <Flex
            direction={{ base: "column", md: "row" }}
            flex="1"
            gap={3}
          >
            <InputGroup flex="1">
              <InputLeftElement
                pointerEvents="none"
                h="100%"
              >
                <MagnifyingGlassIcon
                  width={17}
                  height={17}
                  color="currentColor"
                  style={{
                    color: "#A0AEC0",
                  }}
                />
              </InputLeftElement>

              <Input
                size="sm"
                placeholder="Search staff..."
                value={search}
                onChange={(e) =>
                  onSearchChange(e.target.value)
                }
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
            </InputGroup>

            <Select
              size="sm"
              value={status}
              onChange={(e) =>
                onStatusChange(e.target.value)
              }
              w={{
                base: "100%",
                md: "220px",
              }}
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
              <option value="">
                All Status
              </option>

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
          </Flex>

          {/* ADD STAFF */}

          <Button
            size="sm"
            colorScheme="brand"
            leftIcon={
              <PlusIcon
                width={16}
                height={16}
              />
            }
            onClick={onAddOpen}
            w={{
              base: "100%",
              lg: "auto",
            }}
            px={4}
          >
            Add Staff
          </Button>
        </Flex>
      </Box>

      {/* ADD STAFF MODAL */}

      <AddStaffModal
        isOpen={isAddOpen}
        onClose={onAddClose}
        onAdded={onReload}
      />
    </>
  );
}
