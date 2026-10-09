import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from "@chakra-ui/react";

import {
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface VehicleToolbarProps {
  search: string;
  brandFilter: string;
  brands: string[];

  onSearchChange: (value: string) => void;
  onBrandChange: (value: string) => void;
}

export default function CustomerVehicleToolbar({
  search,
  brandFilter,
  brands,
  onSearchChange,
  onBrandChange,
}: VehicleToolbarProps) {
  return (
    <Box
      layerStyle="panel"
      px={{ base: 4, md: 5 }}
      py={4}
      mb={0}
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
        {/* SEARCH */}

        <InputGroup
          flex="1"
          minW={{
            base: "100%",
            md: "300px",
          }}
        >
          <InputLeftElement
            pointerEvents="none"
            h="40px"
          >
            <MagnifyingGlassIcon
              width={18}
              height={18}
            />
          </InputLeftElement>

          <Input
            placeholder="Search by brand, model, variant, or year..."
            bg="white"
            h="40px"
            value={search}
            onChange={(e) =>
              onSearchChange(e.target.value)
            }
            borderColor="gray.300"
            borderRadius="lg"
            fontSize="sm"
            pl="40px"
            _hover={{
              borderColor: "brand.400",
            }}
            _focus={{
              borderColor: "brand.500",
              boxShadow:
                "0 0 0 1px var(--chakra-colors-brand-500)",
            }}
          />
        </InputGroup>

        {/* BRAND FILTER */}

        <Flex
          align="center"
          gap={2}
          w={{
            base: "100%",
            md: "220px",
          }}
        >

          <Select
            bg="white"
            h="40px"
            w="full"
            value={brandFilter}
            onChange={(e) =>
              onBrandChange(e.target.value)
            }
            borderColor="gray.300"
            borderRadius="lg"
            fontSize="sm"
            _hover={{
              borderColor: "brand.400",
            }}
            _focus={{
              borderColor: "brand.500",
              boxShadow:
                "0 0 0 1px var(--chakra-colors-brand-500)",
            }}
          >
            <option value="">
              All Brands
            </option>

            {brands.map((brand) => (
              <option
                key={brand}
                value={brand}
              >
                {brand}
              </option>
            ))}
          </Select>
        </Flex>
      </Flex>
    </Box>
  );
}