import { useEffect, useState } from "react";

import {
  Badge,
  Box,
  Flex,
  Heading,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

import type { VehicleRelease } from "../../../api/VehicleManagement/releaseApi";

import ReleaseActions from "./ReleaseActions";
import Pagination from "../../../Reusable/Paginations";
import CustomerAvatar from "../../Shared/Customers/CustomerAvatar";
import DetailsLink from "../../Shared/Details/DetailsLink";

interface ReleaseTableProps {
  releases: VehicleRelease[];
  loading: boolean;
  onRefresh: () => void;
}

export default function ReleaseTable({
  releases,
  loading,
  onRefresh,
}: ReleaseTableProps) {
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReleases = releases.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [releases.length]);

  // CUSTOMER NAME

  const getCustomerName = (
    release: VehicleRelease
  ) => {
    const customer =
      release.sale?.reservation?.customer;

    if (!customer) {
      return "N/A";
    }

    return [
      customer.first_name,
      customer.middle_name,
      customer.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  };

  // VEHICLE NAME

  const getVehicleName = (
    release: VehicleRelease
  ) => {
    const vehicle =
      release.sale?.reservation?.vehicle;

    if (!vehicle) {
      return "N/A";
    }

    return [
      vehicle.brand?.brand,
      vehicle.model?.model,
      vehicle.variant?.variant,
    ]
      .filter(Boolean)
      .join(" ");
  };

  // DOCUMENT STATUS
  //
  // CR and OR belong to the vehicle.
  //
  // Receipt and Deed of Sale are generated dynamically.
  //
  // Therefore the release requirement is only:
  //
  // CR + OR
  //
  // Sale completion is already checked by backend.

  const getDocumentStatus = (
    release: VehicleRelease
  ) => {
    const vehicle =
      release.sale?.reservation?.vehicle;

    const documents =
      vehicle?.vehicleDocuments;

    const hasCR = Boolean(
      documents?.vehicle_cr_path
    );

    const hasOR = Boolean(
      documents?.vehicle_or_path
    );

    return {
      hasCR,
      hasOR,
      complete: hasCR && hasOR,
    };
  };

  // STATUS BADGE

  const getStatusBadge = (
    status: VehicleRelease["status"]
  ) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            colorScheme="orange"
            px={2}
            py={1}
            rounded="md"
            fontSize="xs"
            fontWeight="600"
            textTransform="capitalize"
          >
            Pending
          </Badge>
        );

      case "released":
        return (
          <Badge
            colorScheme="green"
            px={2}
            py={1}
            rounded="md"
            fontSize="xs"
            fontWeight="600"
            textTransform="capitalize"
          >
            Released
          </Badge>
        );

      case "cancelled":
        return (
          <Badge
            colorScheme="red"
            px={2}
            py={1}
            rounded="md"
            fontSize="xs"
            fontWeight="600"
            textTransform="capitalize"
          >
            Cancelled
          </Badge>
        );

      default:
        return (
          <Badge
            px={2}
            py={1}
            rounded="md"
            fontSize="xs"
            fontWeight="600"
            textTransform="capitalize"
          >
            {status}
          </Badge>
        );
    }
  };

  // LOADING

  if (loading) {
    return (
      <Box
        layerStyle="panel"
        overflow="hidden"
      >
        <Flex
          minH="250px"
          align="center"
          justify="center"
          direction="column"
          gap={3}
        >
          <Spinner
            size="md"
            color="brand.500"
          />

          <Text
            fontSize="sm"
            color="gray.500"
          >
            Loading vehicle releases...
          </Text>
        </Flex>
      </Box>
    );
  }

  // TABLE

  return (
    <Box
      width="100%"
      bg="white"
      rounded="lg"
      border="1px solid"
      borderColor="gray.200"
      shadow="sm"
      overflow="hidden"
    >
      {/* HEADER */}

      <Box
        px={{ base: 4, md: 6 }}
        py={4}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Box>
          <Heading
            size="sm"
            color="gray.800"
          >
            Vehicle Releases List
          </Heading>
        </Box>
      </Box>

      {/* TABLE */}

      <Box overflowX="auto">
        <Table
          variant="simple"
          minW="950px"
        >
          {/* HEADER */}

          <Thead bg="gray.100">
            <Tr>
              {[
                "No.",
                "Release",
                "Customer",
                "Vehicle",
                "Invoice",
                "Status",
                "Release Date",
                "Actions",
              ].map((header) => (
                <Th
                  key={header}
                  fontSize="xs"
                  fontWeight="800"
                  color="gray.700"
                  py={2}
                  textAlign={
                    header === "Actions" ? "center" : undefined
                  }
                >
                  {header}
                </Th>
              ))}
            </Tr>
          </Thead>

          {/* BODY */}

          <Tbody>
            {paginatedReleases.length === 0 ? (
              <Tr>
                <Td colSpan={8} textAlign="center" py={10}>
                  <Text fontSize="sm" color="gray.500">
                    No vehicle releases found.
                  </Text>
                </Td>
              </Tr>
            ) : (
              paginatedReleases.map((release, index) => {
                const documentStatus = getDocumentStatus(release);

                const vehicle =
                  release.sale?.reservation?.vehicle;

                const releaseInfo = [
                  startIndex + index + 1,
                  release.release_number,
                  getCustomerName(release),
                  getVehicleName(release),
                  release.sale?.invoice_number ?? "N/A",
                  release.release_date
                    ? new Date(
                      release.release_date
                    ).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    : "Not released",
                ];

                return (
                  <Tr
                    key={release.id}
                    _hover={{ bg: "gray.50" }}
                    transition="background 0.15s"
                  >
                    {/* Release Information */}
                    {releaseInfo.map((info, infoIndex) => (
                      <Td
                        key={infoIndex}
                        fontSize="sm"
                        color={
                          infoIndex <= 4
                            ? "gray.800"
                            : "gray.700"
                        }
                        fontWeight={
                          infoIndex <= 4 ? "600" : "400"
                        }
                        py={2}
                        whiteSpace="nowrap"
                      >
                        {infoIndex === 2 ? (
                          <CustomerAvatar customer={release.sale?.reservation?.customer} withName name={String(info)} />
                        ) : infoIndex === 3 ? (
                          <DetailsLink type="vehicle" id={vehicle?.id}>{info}</DetailsLink>
                        ) : (
                          info
                        )}

                        {/* Vehicle Details */}
                        {infoIndex === 3 && (
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            mt={0.5}
                          >
                            {vehicle?.stock_no ?? "No stock number"}
                          </Text>
                        )}
                      </Td>
                    ))}

                    {/* Status */}
                    <Td py={2}>
                      {getStatusBadge(release.status)}
                    </Td>

                    {/* Actions */}
                    <Td py={2}>
                      <Flex
                        justify="center"
                        align="center"
                      >
                        <ReleaseActions
                          release={release}
                          documentStatus={documentStatus}
                          onRefresh={onRefresh}
                        />
                      </Flex>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </Box>

      <Pagination
        currentPage={currentPage}
        totalItems={releases.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        itemLabel="vehicle release"
      />
    </Box>
  );
}

