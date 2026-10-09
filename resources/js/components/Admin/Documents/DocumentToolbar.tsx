import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Box,
} from "@chakra-ui/react";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import type {
  FinancingDocument,
} from "../../../api/FinancingManagement/documentApi";

interface DocumentToolbarProps {
  searchTerm: string;
  statusFilter:
  | FinancingDocument["verification_status"]
  | "";

  onSearchChange: (value: string) => void;

  onStatusChange: (
    value:
      | FinancingDocument["verification_status"]
      | ""
  ) => void;
}

export default function DocumentToolbar({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: DocumentToolbarProps) {
  return (
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
        {/* SEARCH + STATUS */}

        <Flex
          direction={{
            base: "column",
            md: "row",
          }}
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
                width={16}
                height={16}
                color="currentColor"
              />
            </InputLeftElement>

            <Input
              size="sm"
              placeholder="Search document, reservation ID..."
              value={searchTerm}
              onChange={(event) =>
                onSearchChange(event.target.value)
              }
              bg="white"
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
          </InputGroup>

          {/* STATUS FILTER */}

          <Select
            size="sm"
            placeholder="All Status"
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(
                event.target.value as
                | FinancingDocument["verification_status"]
                | ""
              )
            }
            w={{
              base: "100%",
              md: "220px",
            }}
            bg="white"
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
            <option value="pending">
              Pending
            </option>

            <option value="verified">
              Verified
            </option>

            <option value="rejected">
              Rejected
            </option>
          </Select>
        </Flex>
      </Flex>
    </Box>
  );
}