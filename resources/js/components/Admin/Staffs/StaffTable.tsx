import { useState } from "react";

import {
  Box,
  Badge,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Flex,
  HStack,
  Button,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilSquareIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/solid";

import ViewStaffModal from "./ViewStaffModal";
import UpdateStaffModal from "./UpdateStaffModal";
import ArchivedStaffDialog from "./ArchivedStaffDialog";

import type { Staff } from "../../../api/UserManagement/staffApi";

interface StaffTableProps {
  staffs: Staff[];
  loading: boolean;
  onReload: () => void;
}

export default function AdminStaffTable({
  staffs,
  loading,
  onReload,
}: StaffTableProps) {
  const [selectedStaff, setSelectedStaff] =
    useState<Staff | null>(null);

  const [isUpdateOpen, setIsUpdateOpen] =
    useState(false);

  const [isViewOpen, setIsViewOpen] =
    useState(false);

  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // Pagination

  const currentPage = 1;
  const itemsPerPage = 10;

  const totalItems = staffs.length;

  const startItem =
    totalItems === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;

  const endItem = Math.min(
    currentPage * itemsPerPage,
    totalItems
  );

  // Format Time

  const formatTime = (time: string) => {
    return new Date(
      `1970-01-01T${time}`
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Status Color

  const getStatusColor = (
    status: Staff["status"]
  ) => {
    switch (status) {
      case "active":
        return "green";

      case "inactive":
        return "orange";

      case "resigned":
        return "yellow";

      case "terminated":
        return "red";

      default:
        return "gray";
    }
  };

  // Render

  return (
    <Box
      layerStyle="panel"
      overflow="hidden"
    >
      {/* HEADER */}

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
              size="sm"
              color="gray.800"
            >
              Staff Management
            </Heading>

            <Text
              fontSize="xs"
              color="gray.500"
              mt={1}
            >
              Manage staff information, work
              schedules, and account status.
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* TABLE */}

      <Box overflowX="auto">
        <Table
          variant="simple"
          minW="1050px"
        >
          {/* TABLE HEADER */}

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
                Position
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Name
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
                Mobile Number
              </Th>

              <Th
                fontSize="xs"
                fontWeight="700"
                color="gray.600"
                py={3}
              >
                Work Schedule
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

          {/* TABLE BODY */}

          <Tbody>
            {loading ? (
              <Tr>
                <Td
                  colSpan={8}
                  textAlign="center"
                  py={12}
                >
                  <Text
                    fontSize="sm"
                    color="gray.500"
                  >
                    Loading staff members...
                  </Text>
                </Td>
              </Tr>
            ) : staffs.length === 0 ? (
              <Tr>
                <Td
                  colSpan={8}
                  textAlign="center"
                  py={12}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="gray.700"
                  >
                    No staff found.
                  </Text>

                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mt={1}
                  >
                    Staff members matching your
                    search or filter will appear here.
                  </Text>
                </Td>
              </Tr>
            ) : (
              staffs.map((staff, index) => (
                <Tr
                  key={staff.id}
                  _hover={{
                    bg: "gray.50",
                  }}
                  transition="background-color 0.15s ease"
                >
                  {/* NUMBER */}

                  <Td>
                    <Text
                      fontSize="sm"
                      color="gray.500"
                      whiteSpace="nowrap"
                    >
                      STF
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </Text>
                  </Td>

                  {/* POSITION */}

                  <Td>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.800"
                      whiteSpace="nowrap"
                    >
                      {staff.user.role.name}
                    </Text>
                  </Td>

                  {/* NAME */}

                  <Td>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.800"
                      whiteSpace="nowrap"
                    >
                      {[
                        staff.first_name,
                        staff.middle_name,
                        staff.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </Text>
                  </Td>

                  {/* EMAIL */}

                  <Td>
                    <Text
                      fontSize="sm"
                      color="gray.700"
                      whiteSpace="nowrap"
                    >
                      {staff.user.email}
                    </Text>
                  </Td>

                  {/* MOBILE */}

                  <Td>
                    <Text
                      fontSize="sm"
                      color="gray.700"
                      whiteSpace="nowrap"
                    >
                      {staff.mobile_number}
                    </Text>
                  </Td>

                  {/* WORK SCHEDULE */}

                  <Td>
                    <Text
                      fontSize="sm"
                      color="gray.700"
                      whiteSpace="nowrap"
                    >
                      {formatTime(
                        staff.work_start_hour
                      )}{" "}
                      -{" "}
                      {formatTime(
                        staff.work_end_hour
                      )}
                    </Text>
                  </Td>

                  {/* STATUS */}

                  <Td>
                    <Badge
                      colorScheme={getStatusColor(
                        staff.status
                      )}
                      px={2}
                      py={1}
                      rounded="md"
                      fontSize="xs"
                      fontWeight="600"
                      textTransform="capitalize"
                    >
                      {staff.status}
                    </Badge>
                  </Td>

                  {/* ACTIONS */}

                  <Td>
                    <HStack
                      justify="center"
                      spacing={1}
                    >
                      {/* VIEW */}

                      <Tooltip
                        label="View Staff"
                        hasArrow
                      >
                        <IconButton
                          aria-label="View Staff"
                          title="View Staff"
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          icon={
                            <EyeIcon
                              width={17}
                              height={17}
                            />
                          }
                          onClick={() => {
                            setSelectedStaff(
                              staff
                            );
                            setIsViewOpen(true);
                          }}
                          _hover={{
                            bg: "blue.50",
                            color: "blue.500",
                          }}
                        />
                      </Tooltip>

                      {/* UPDATE */}

                      <Tooltip
                        label="Update Staff"
                        hasArrow
                      >
                        <IconButton
                          aria-label="Update Staff"
                          title="Update Staff"
                          size="sm"
                          variant="ghost"
                          colorScheme="orange"
                          icon={
                            <PencilSquareIcon
                              width={17}
                              height={17}
                            />
                          }
                          onClick={() => {
                            setSelectedStaff(
                              staff
                            );
                            setIsUpdateOpen(true);
                          }}
                          _hover={{
                            bg: "orange.50",
                            color: "orange.500",
                          }}
                        />
                      </Tooltip>

                      {/* ARCHIVE */}
                      <Tooltip
                        label="Archive Staff"
                        hasArrow
                      >
                        <IconButton
                          aria-label="Archive Staff"
                          title="Archive Staff"
                          size="sm"
                          variant="ghost"
                          colorScheme="orange"
                          icon={
                            <ArchiveBoxIcon
                              width={17}
                              height={17}
                            />
                          }
                          onClick={() => {
                            setSelectedStaff(staff);
                            setIsArchiveOpen(true);
                          }}
                          _hover={{
                            bg: "orange.50",
                            color: "orange.500",
                          }}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* PAGINATION */}

      <Flex
        px={{ base: 4, md: 6 }}
        py={4}
        borderTop="1px solid"
        borderColor="gray.200"
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        gap={3}
      >
        {/* SHOWING */}

        <Text
          fontSize="xs"
          color="gray.600"
        >
          Showing{" "}
          <Text
            as="span"
            fontWeight="600"
            color="gray.800"
          >
            {startItem}–{endItem}
          </Text>{" "}
          of{" "}
          <Text
            as="span"
            fontWeight="600"
            color="gray.800"
          >
            {totalItems}
          </Text>{" "}
          staff member
          {totalItems !== 1 ? "s" : ""}
        </Text>

        {/* PAGINATION */}

        <HStack spacing={1}>
          <IconButton
            aria-label="Previous page"
            title="Previous page"
            size="sm"
            variant="ghost"
            icon={
              <ChevronLeftIcon
                width={17}
                height={17}
              />
            }
            isDisabled
            _hover={{
              bg: "gray.100",
            }}
          />

          <Button
            size="sm"
            minW="32px"
            px={2}
            bg="brand.500"
            color="white"
            _hover={{
              bg: "brand.600",
            }}
          >
            1
          </Button>

          <IconButton
            aria-label="Next page"
            title="Next page"
            size="sm"
            variant="ghost"
            icon={
              <ChevronRightIcon
                width={17}
                height={17}
              />
            }
            isDisabled
            _hover={{
              bg: "gray.100",
            }}
          />
        </HStack>
      </Flex>

      {/* VIEW STAFF MODAL */}

      <ViewStaffModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        staff={selectedStaff}
      />

      {/* UPDATE STAFF MODAL */}

      <UpdateStaffModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        staff={selectedStaff}
        onUpdated={onReload}
      />

      {/* DELETE STAFF DIALOG */}

      <ArchivedStaffDialog
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        staff={selectedStaff}
        onArchived={onReload}
      />
    </Box>
  );
}

