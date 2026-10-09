import { useState } from "react";

import {
  Badge,
  Box,
  Flex,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Heading,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";

import {
  EyeIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

import CustomerTransactionModal from "./CustomerTransactionModal";
import CustomerAvatar from "../../Shared/Customers/CustomerAvatar";
import ArchivedCustomerDialog from "./ArchivedCustomerDialog";
import Pagination from "../../../Reusable/Paginations";

import type { Customer } from "../../../api/UserManagement/customerApi";

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  onReload: () => void;
}

export default function AdminCustomerTable({
  customers,
  loading,
  onReload,
}: CustomerTableProps) {
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [isViewOpen, setIsViewOpen] =
    useState(false);

  // const [isUpdateOpen, setIsUpdateOpen] =
  //   useState(false);

  const [isDeleteOpen, setIsDeleteOpen] =
    useState(false);

  // PAGINATION

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ACTIVE CUSTOMERS ONLY
  // archived: 0 = Active, 1 = Archived

  const activeCustomers = customers.filter(
    (customer) => Number(customer.archived ?? 0) === 0
  );

  const totalItems = activeCustomers.length;
  const totalPages = Math.max(
    Math.ceil(totalItems / itemsPerPage),
    1
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;

  const paginatedCustomers = activeCustomers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Box
      layerStyle="panel"
      overflow="hidden"
    >
      {/* TABLE HEADER */}

      <Flex
        px={{ base: 4, md: 5 }}
        py={4}
        justify="space-between"
        align={{
          base: "flex-start",
          md: "center",
        }}
        direction={{
          base: "column",
          md: "row",
        }}
        gap={3}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Box>
          <Heading
            size="sm"
            fontWeight="700"
            color="dark.900"
          >
            Customer List
          </Heading>

          <Text
            mt={1}
            fontSize="xs"
            color="gray.500"
          >
            View and manage all registered
            customers in the system.
          </Text>
        </Box>
      </Flex>

      {/* TABLE */}

      <Box overflowX="auto">
        <Table
          variant="simple"
          minW="1000px"
        >
          <Thead bg="gray.50">
            <Tr>
              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                No.
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Full Name
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Address
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Mobile Number
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Facebook
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Email
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Status
              </Th>

              <Th
                textAlign="center"
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Actions
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {/* LOADING */}

            {loading ? (
              <Tr>
                <Td
                  colSpan={8}
                  textAlign="center"
                  py={10}
                >
                  <Text
                    fontSize="sm"
                    color="gray.500"
                  >
                    Loading customers...
                  </Text>
                </Td>
              </Tr>
            ) : activeCustomers.length > 0 ? (
              paginatedCustomers.map((customer) => (
                <Tr
                  key={customer.id}
                  _hover={{
                    bg: "gray.50",
                  }}
                  transition="background 0.15s"
                >
                  {/* Customer Number */}
                  <Td
                    fontSize="sm"
                    fontWeight="600"
                    color="dark.900"
                  >
                    {`CST-${String(
                      customer.id
                    ).padStart(2, "0")}`}
                  </Td>

                  {/* Full Name */}
                  <Td>
                    <CustomerAvatar customer={customer} withName />
                  </Td>

                  {/* Address */}
                  <Td
                    fontSize="sm"
                    color="gray.600"
                  >
                    {customer.address || "—"}
                  </Td>

                  {/* Mobile */}
                  <Td
                    fontSize="sm"
                    color="gray.600"
                  >
                    {customer.mobile_number || "—"}
                  </Td>

                  {/* Facebook */}
                  <Td
                    fontSize="sm"
                    color="gray.600"
                  >
                    {customer.facebook || "—"}
                  </Td>

                  {/* Email */}
                  <Td
                    fontSize="sm"
                    color="gray.600"
                  >
                    {customer.user?.email ?? "—"}
                  </Td>

                  {/* Status */}
                  <Td>
                    <Badge
                      colorScheme={
                        customer.is_active
                          ? "green"
                          : "red"
                      }
                      px={2}
                      py={1}
                      rounded="full"
                      fontSize="xs"
                      fontWeight="600"
                    >
                      {customer.is_active
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </Td>

                  {/* Actions */}
                  <Td>
                    <HStack
                      spacing={1}
                      justify="center"
                    >
                      {/* View Transactions */}
                      <Tooltip
                        label="View Transactions"
                        hasArrow
                        placement="top"
                      >
                        <IconButton
                          aria-label="View Transactions"
                          size="sm"
                          variant="ghost"
                          color="gray.600"
                          icon={
                            <EyeIcon
                              width={18}
                              height={18}
                            />
                          }
                          onClick={() => {
                            setSelectedCustomer(
                              customer
                            );
                            setIsViewOpen(true);
                          }}
                          _hover={{
                            bg: "blue.50",
                            color: "blue.500",
                          }}
                        />
                      </Tooltip>

                      {/* Delete */}
                      <Tooltip
                        label="Archive Customer"
                        hasArrow
                        placement="top"
                      >
                        <IconButton
                          aria-label="Archive Customer"
                          size="sm"
                          variant="ghost"
                          color="gray.600"
                          icon={
                            <ArchiveBoxIcon
                              width={18}
                              height={18}
                            />
                          }
                          onClick={() => {
                            setSelectedCustomer(
                              customer
                            );
                            setIsDeleteOpen(true);
                          }}
                          _hover={{
                            bg: "red.50",
                            color: "red.500",
                          }}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td
                  colSpan={8}
                  textAlign="center"
                  py={10}
                >
                  <Text
                    fontSize="sm"
                    color="gray.500"
                  >
                    No customers found.
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Pagination
        currentPage={safeCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        itemLabel="customer"
      />

      {/* MODALS */}

      <CustomerTransactionModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        customer={selectedCustomer}
        onChanged={onReload}
      />

      <ArchivedCustomerDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        customer={selectedCustomer}
        onArchived={onReload}
      />
    </Box>
  );
}

