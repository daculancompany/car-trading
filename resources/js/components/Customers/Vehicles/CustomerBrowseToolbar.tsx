import {
  Box,
  Flex,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";

import {
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface CustomerBrowseToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  brand: string;
  setBrand: (value: string) => void;
  brands: string[];
}

export default function CustomerBrowseToolbar({
  search,
  setSearch,
  brand,
  setBrand,
  brands,
}: CustomerBrowseToolbarProps) {
  return (
    <VStack
      align="stretch"
      spacing={{
        base: 3,
        sm: 5,
        md: 6,
      }}
      w="full"
    >
      {/* PAGE HEADER */}

      <Box w="full">
        <Flex
          align="flex-start"
          gap={{
            base: 2,
            sm: 3,
          }}
          w="full"
        >
          {/* Accent Line */}

          <Box
            w="3px"
            minH={{
              base: "38px",
              sm: "46px",
              md: "50px",
            }}
            bg="brand.500"
            borderRadius="full"
            flexShrink={0}
          />

          {/* Header Content */}

          <Box
            flex="1"
            minW={0}
          >
            <Heading
              size={{
                base: "sm",
                sm: "md",
              }}
              color="dark.800"
              fontWeight="600"
              letterSpacing="-0.01em"
              lineHeight="1.25"
            >
              Cars for sale
            </Heading>

            <Text
              color="gray.600"
              fontSize={{
                base: "xs",
                sm: "sm",
              }}
              mt={{
                base: 1,
                sm: 1,
              }}
              maxW="850px"
              lineHeight="1.5"
            >
              Second-hand units on our lot in Opol, Cagayan de Oro. Prices shown are cash prices. Reserve online to hold a unit for 7 days.
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* SEARCH & FILTERS */}

      <Box
        bg="white"
        borderRadius={{
          base: "md",
          sm: "lg",
        }}
        p={{
          base: 2,
          sm: 4,
          md: 3,
        }}
        boxShadow="sm"
        w="full"
      >
        <Flex
          direction="row"
          align="center"
          gap={{
            base: 1.5,
            sm: 2,
            md: 3,
          }}
          w="full"
        >
          {/* SEARCH */}

          <InputGroup
            flex="1"
            minW={0}
          >
            <InputLeftElement
              pointerEvents="none"
              h={{
                base: "36px",
                sm: "40px",
                md: "40px",
              }}
              left={{
                base: 1,
                sm: 0,
              }}
            >
              <Icon
                as={MagnifyingGlassIcon}
                boxSize={{
                  base: 4,
                  sm: 5,
                }}
                color="brand.500"
              />
            </InputLeftElement>

            <Input
              placeholder="Search..."
              bg="white"
              h={{
                base: "36px",
                sm: "40px",
                md: "40px",
              }}
              w="full"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              borderColor="gray.300"
              borderRadius="lg"
              fontSize={{
                base: "xs",
                sm: "sm",
              }}
              px={{
                base: 8,
                sm: 10,
              }}
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
            gap={{
              base: 1,
              sm: 2,
            }}
            w={{
              base: "42%",
              sm: "220px",
              md: "240px",
              lg: "260px",
            }}
            flexShrink={0}
          >
            <Icon
              as={FunnelIcon}
              boxSize={{
                base: 4,
                sm: 5,
              }}
              color="brand.500"
              flexShrink={0}
            />

            <Select
              bg="white"
              h={{
                base: "36px",
                sm: "40px",
                md: "40px",
              }}
              w="full"
              value={brand}
              onChange={(e) =>
                setBrand(e.target.value)
              }
              borderColor="gray.300"
              borderRadius="lg"
              fontSize={{
                base: "xs",
                sm: "sm",
              }}
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

              {brands.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </Select>
          </Flex>
        </Flex>
      </Box>
    </VStack>
  );
}
