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
  UserPlusIcon,
} from "@heroicons/react/24/solid";

import AddCustomerModal from "./AddCustomerModal";

interface CustomerToolbarProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReload: () => void;
}

export default function AdminCustomerToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onReload,
}: CustomerToolbarProps) {
  const customerModal = useDisclosure();

  return (
    <>
      {/* CUSTOMER TOOLBAR */}

      <Box
        layerStyle="panel"
        px={{ base: 4, md: 5 }}
        py={4}
      >
        <Flex
          direction={{
            base: "column",
            lg: "row",
          }}
          justify="space-between"
          align={{
            base: "stretch",
            lg: "center",
          }}
          gap={4}
        >
          {/* SEARCH + FILTER */}

          <Flex
            direction={{
              base: "column",
              sm: "row",
            }}
            flex="1"
            gap={4}
          >
            {/* Search */}
            <InputGroup flex="1">
              <InputLeftElement
                h="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                pointerEvents="none"
              >
                <MagnifyingGlassIcon
                  width={17}
                  height={17}
                />
              </InputLeftElement>

              <Input
                placeholder="Search name, email, username..."
                value={search}
                onChange={(e) =>
                  onSearchChange(e.target.value)
                }
                bg="white"
                size="sm"
                pl="40px"
              />
            </InputGroup>

            {/* Status */}
            <Select
              placeholder="All Status"
              value={status}
              onChange={(e) =>
                onStatusChange(e.target.value)
              }
              w={{
                base: "100%",
                sm: "180px",
              }}
              bg="white"
              size="sm"
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </Select>
          </Flex>

          {/* ACTIONS */}

          <Flex
            gap={2}
            flexWrap="wrap"
          >
            {/* Add Customer */}
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
              _hover={{
                bg: "brand.600",
              }}
              onClick={customerModal.onOpen}
            >
              Register Customer
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* ADD CUSTOMER MODAL */}

      <AddCustomerModal
        isOpen={customerModal.isOpen}
        onClose={customerModal.onClose}
        onSuccess={onReload}
      />
    </>
  );
}
