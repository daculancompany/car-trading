import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from "@chakra-ui/react";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface ReleaseToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

export default function ReleaseToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}: ReleaseToolbarProps) {
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
          gap={3}
        >
          {/* SEARCH */}

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
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search release, invoice, customer, or vehicle..."
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

          {/* STATUS FILTER */}

          <Select
            size="sm"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
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
            <option value="">All Status</option>

            <option value="pending">
              Pending
            </option>

            <option value="released">
              Released
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </Select>
        </Flex>
      </Flex>
    </Box>
  );
}

