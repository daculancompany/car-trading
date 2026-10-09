import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Text,
} from "@chakra-ui/react";

import type { Role } from "../../../api/UserManagement/roleApi";

interface RolesTableProps {
  roles: Role[];
  loading: boolean;
}

export default function AdminRolesTable({
  roles,
  loading,
}: RolesTableProps) {
  return (
    <Box
      layerStyle="panel"
      overflow="hidden"
    >
      <Box
        px={{ base: 4, md: 6 }}
        py={4}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={3}
        >
          <Box>
            <Heading
              size={{ base: "sm", md: "sm" }}
              color="gray.800"
              fontWeight="700"
            >
              Roles Management
            </Heading>

            <Text
              fontSize="xs"
              color="gray.500"
              mt={1}
            >
              View all system roles and their descriptions.
            </Text>
          </Box>
        </Flex>
      </Box>

      <Box overflowX="auto">
        <Table
          variant="simple"
          size="sm"
          minW="700px"
        >
          <Thead bg="gray.50">
            <Tr>
              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                ID
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Role Name
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Role Type
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Description
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {loading ? (
              <Tr>
                <Td
                  colSpan={4}
                  textAlign="center"
                  py={12}
                >
                  <Text
                    fontSize="sm"
                    color="gray.500"
                  >
                    Loading roles...
                  </Text>
                </Td>
              </Tr>
            ) : roles.length === 0 ? (
              <Tr>
                <Td
                  colSpan={4}
                  textAlign="center"
                  py={12}
                >
                  <Text
                    fontSize="sm"
                    color="gray.500"
                  >
                    No roles found.
                  </Text>
                </Td>
              </Tr>
            ) : (
              roles.map((role) => (
                <Tr
                  key={role.id}
                  _hover={{
                    bg: "gray.50",
                  }}
                  transition="background-color 0.15s ease"
                >
                  <Td
                    fontSize="sm"
                    color="gray.500"
                    fontWeight="500"
                  >
                    {role.id}
                  </Td>

                  <Td>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.800"
                    >
                      {role.name}
                    </Text>
                  </Td>

                  <Td>
                    <Box
                      display="inline-flex"
                      px={2}
                      py={1}
                      borderRadius="md"
                      bg="gray.100"
                    >
                      <Text
                        fontSize="xs"
                        fontWeight="600"
                        color="gray.700"
                      >
                        {role.role_type}
                      </Text>
                    </Box>
                  </Td>

                  <Td>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      lineHeight="1.5"
                    >
                      {role.description || "No description"}
                    </Text>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
