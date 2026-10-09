
import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Select,
} from "@chakra-ui/react";

import {
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

import type { RoleType } from "../../../api/UserManagement/roleApi";

interface RoleToolbarProps {
  search: string;
  roleType: RoleType | "";
  onSearchChange: (value: string) => void;
  onRoleTypeChange: (value: RoleType | "") => void;
  onAddRole: () => void;
}

export default function RoleToolbar({
  search,
  roleType,
  onSearchChange,
  onRoleTypeChange,
  onAddRole,
}: RoleToolbarProps) {
  return (
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
        <Flex
          direction={{ base: "column", md: "row" }}
          flex="1"
          gap={4}
        >
          {/* Search */}
          <FormControl maxW={{ base: "100%", md: "360px" }}>
            <Flex align="center" position="relative">
              <Box
                position="absolute"
                left={3}
                zIndex={1}
                color="gray.400"
                pointerEvents="none"
              >
                <MagnifyingGlassIcon
                  width={17}
                  height={17}
                />
              </Box>

              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search roles..."
                size="sm"
                pl={9}
                bg="white"
                borderRadius="md"
                _hover={{
                  borderColor: "gray.400",
                }}
                _focus={{
                  borderColor: "brand.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                }}
              />
            </Flex>
          </FormControl>

          {/* Role Type Filter */}
          <Select
            value={roleType}
            onChange={(e) =>
              onRoleTypeChange(e.target.value as RoleType | "")
            }
            placeholder="All role types"
            size="sm"
            maxW={{ base: "100%", md: "200px" }}
            bg="white"
            borderColor="gray.300"
            borderRadius="md"
            _hover={{
              borderColor: "gray.400",
            }}
            _focus={{
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
            }}
          >
            <option value="system">System</option>
            <option value="staffs">Staffs</option>
            <option value="customers">Customers</option>
          </Select>
        </Flex>

        {/* Add Role */}
        <Button
          size="sm"
          colorScheme="brand"
          borderRadius="md"
          leftIcon={
            <PlusIcon
              width={16}
              height={16}
            />
          }
          onClick={onAddRole}
          flexShrink={0}
        >
          Add Role
        </Button>
      </Flex>
    </Box>
  );
}

