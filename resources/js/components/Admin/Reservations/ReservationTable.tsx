import { useEffect, useState } from "react";

import {
    Badge,
    Box,
    Button,
    HStack,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Heading,
    Text,
    Tooltip,
    useDisclosure,
} from "@chakra-ui/react";

import {
    EyeIcon,
    PencilSquareIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";

import {
    type Reservation,
} from "../../../api/ReservationManagement/reservationApi";

import ViewReservationModal from "./ViewReservationModal";
import VerifyReservationModal from "./VerifyReservationModal";
import CreateSaleModal from "../Sales/CreateSaleModal";
import DeleteReservationDialog from "./DeleteReservationDialog";

import Pagination from "../../../Reusable/Paginations";
import CustomerAvatar from "../../Shared/Customers/CustomerAvatar";
import DetailsLink from "../../Shared/Details/DetailsLink";

interface ReservationTableProps {
    reservations: Reservation[];
    loading: boolean;
    onReload: () => void;
}

export default function AdminReservationTable({
    reservations,
    loading,
    onReload,
}: ReservationTableProps) {
    // PAGINATION

    const ITEMS_PER_PAGE = 10;

    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = reservations.length;

    const totalPages = Math.max(
        Math.ceil(totalItems / ITEMS_PER_PAGE),
        1
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [totalItems]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const startIndex =
        (currentPage - 1) * ITEMS_PER_PAGE;

    const paginatedReservations = reservations.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    // SELECTED RESERVATION

    const [selectedReservation, setSelectedReservation] =
        useState<Reservation | null>(null);

    // SALE MODAL

    const [saleOpen, setSaleOpen] = useState(false);

    // VIEW MODAL

    const {
        isOpen: isViewOpen,
        onOpen: onViewOpen,
        onClose: onViewClose,
    } = useDisclosure();

    // VERIFY / UPDATE MODAL

    const {
        isOpen: isUpdateOpen,
        onOpen: onUpdateOpen,
        onClose: onUpdateClose,
    } = useDisclosure();

    // DELETE MODAL

    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onClose: onDeleteClose,
    } = useDisclosure();

    // VIEW

    const handleView = (
        reservation: Reservation
    ) => {
        setSelectedReservation(reservation);
        onViewOpen();
    };

    // UPDATE / VERIFY

    const handleUpdate = (
        reservation: Reservation
    ) => {
        setSelectedReservation(reservation);
        onUpdateOpen();
    };

    // DELETE

    const handleDelete = (
        reservation: Reservation
    ) => {
        setSelectedReservation(reservation);
        onDeleteOpen();
    };

    // STATUS COLOR

    const getStatusColor = (
        status: Reservation["reservation_status"]
    ) => {
        switch (status) {
            case "pending_reservation":
                return "yellow";

            case "pending_documents":
                return "purple";

            case "pending_financing":
                return "cyan";

            case "pending_payment":
                return "orange";

            case "reserved":
                return "blue";

            case "completed":
                return "green";

            case "rejected":

            case "cancelled":
                return "red";

            case "expired":
                return "gray";

            default:
                return "gray";
        }
    };

    // STATUS LABEL

    const getStatusLabel = (
        status: Reservation["reservation_status"]
    ) => {
        return status
            .replace(/_/g, " ")
            .replace(
                /\b\w/g,
                (character) => character.toUpperCase()
            );
    };

    // DOCUMENT REVIEW STATUS

    const getDocumentReview = (
        reservation: Reservation
    ) => {
        if (
            reservation.valid_id_front_status === "resubmit" ||
            reservation.valid_id_back_status === "resubmit"
        ) {
            return {
                label: "Resubmission Required",
                colorScheme: "red",
            } as const;
        }

        if (
            reservation.valid_id_front_status === "approved" &&
            reservation.valid_id_back_status === "approved"
        ) {
            return {
                label: "IDs Complete",
                colorScheme: "green",
            } as const;
        }

        return {
            label: "ID Review Pending",
            colorScheme: "yellow",
        } as const;
    };

    // FINANCING SUBMISSION COUNT

    const getFinancingSubmissionCount = (
        reservation: Reservation
    ): number => {
        if (
            !reservation.financing ||
            typeof reservation.financing !== "object"
        ) {
            return 0;
        }

        const financing = reservation.financing as {
            documents?: unknown;
        };

        return Array.isArray(financing.documents)
            ? financing.documents.length
            : 0;
    };

    // CUSTOMER NAME

    const getCustomerName = (
        reservation: Reservation
    ) => {
        if (!reservation.customer) {
            return "Unknown Customer";
        }

        return [
            reservation.customer.first_name,
            reservation.customer.middle_name,
            reservation.customer.last_name,
        ]
            .filter(Boolean)
            .join(" ");
    };

    // VEHICLE NAME

    const getVehicleName = (
        reservation: Reservation
    ) => {
        if (!reservation.vehicle) {
            return "Unknown Vehicle";
        }

        return [
            reservation.vehicle.brand?.brand,
            reservation.vehicle.model?.model,
            reservation.vehicle.variant?.variant,
        ]
            .filter(Boolean)
            .join(" ");
    };

    // FORMAT DATE

    const formatDate = (
        date?: string | null
    ) => {
        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleDateString(
            "en-PH",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };

    // FORMAT DATE TIME

    const formatDateTime = (
        date?: string | null
    ) => {
        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleString(
            "en-PH",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
            }
        );
    };

    // RESERVATION VERIFIED
    // Flow:
    // Verify Front ID
    // +
    // Verify Back ID
    // ↓
    // Reservation verified
    // ↓
    // Create Sale Modal

    const handleReservationVerified = (
        reservation: Reservation
    ) => {
        setSelectedReservation(reservation);

        onUpdateClose();

        setSaleOpen(true);

        onReload();
    };

    // SALE CREATED

    const handleSaleCreated = () => {
        setSaleOpen(false);

        setSelectedReservation(null);

        onReload();
    };

    // UI

    return (
        <Box
            layerStyle="panel"
            overflow="hidden"
        >
            {/* HEADER */}

            <Box
                px={6}
                py={4}
                borderBottom="1px solid"
                borderColor="gray.200"
            >
                <Heading
                    size="sm"
                    fontWeight="700"
                    color="dark.900"
                >
                    Reservations
                </Heading>

                <Text
                    mt={1}
                    fontSize="xs"
                    color="gray.500"
                >
                    Review customer reservation requests,
                    monitor reservation status, and manage
                    reservation records.
                </Text>
            </Box>

            {/* TABLE */}

            <Box overflowX="auto">
                <Table
                    variant="simple"
                    minW="1100px"
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
                                Customer
                            </Th>

                            <Th
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.600"
                                py={3}
                            >
                                Vehicle
                            </Th>

                            <Th
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.600"
                                py={3}
                            >
                                Reservation Date
                            </Th>

                            <Th
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.600"
                                py={3}
                            >
                                Expires
                            </Th>

                            <Th
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.600"
                                py={3}
                            >
                                Source
                            </Th>

                            <Th
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.600"
                                py={3}
                            >
                                Purchase
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
                                    colSpan={9}
                                    textAlign="center"
                                    py={10}
                                >
                                    <Text
                                        fontSize="sm"
                                        color="gray.500"
                                    >
                                        Loading reservations...
                                    </Text>
                                </Td>
                            </Tr>
                        ) : reservations.length === 0 ? (
                            // EMPTY

                            <Tr>
                                <Td
                                    colSpan={9}
                                    textAlign="center"
                                    py={10}
                                >
                                    <Text
                                        fontSize="sm"
                                        color="gray.500"
                                    >
                                        No reservations found.
                                    </Text>
                                </Td>
                            </Tr>
                        ) : (
                            // RESERVATIONS

                            paginatedReservations.map(
                                (
                                    reservation,
                                    index
                                ) => (
                                    <Tr
                                        key={reservation.id}
                                        _hover={{
                                            bg: "gray.50",
                                        }}
                                        transition="background 0.15s"
                                    >
                                        {/* NUMBER */}

                                        <Td
                                            fontSize="sm"
                                            color="gray.600"
                                        >
                                            {startIndex + index + 1}
                                        </Td>

                                        {/* CUSTOMER */}

                                        <Td>
                                            <CustomerAvatar
                                                customer={reservation.customer}
                                                withName
                                                name={getCustomerName(reservation)}
                                                subtitle={reservation.customer?.mobile_number}
                                            />
                                        </Td>

                                        {/* VEHICLE */}

                                        <Td>
                                            <Text
                                                fontSize="sm"
                                                fontWeight="600"
                                                color="gray.800"
                                            >
                                                <DetailsLink type="vehicle" id={reservation.vehicle?.id ?? reservation.vehicle_id}>
                                                    {getVehicleName(reservation)}
                                                </DetailsLink>
                                            </Text>

                                            <Text
                                                fontSize="xs"
                                                color="gray.500"
                                                mt={1}
                                            >
                                                {reservation
                                                    .vehicle
                                                    ?.stock_no ||
                                                    "No stock no."}

                                                {" • "}

                                                {reservation
                                                    .vehicle
                                                    ?.year_model ||
                                                    "—"}
                                            </Text>
                                        </Td>

                                        {/* RESERVED AT */}

                                        <Td
                                            fontSize="sm"
                                            color="gray.700"
                                        >
                                            {formatDate(
                                                reservation.reserved_at
                                            )}
                                        </Td>

                                        {/* EXPIRES AT */}

                                        <Td>
                                            <Text
                                                fontSize="sm"
                                                color="gray.700"
                                            >
                                                {formatDateTime(
                                                    reservation.expires_at
                                                )}
                                            </Text>
                                        </Td>

                                        {/* SOURCE */}

                                        <Td>
                                            <Badge
                                                px={2}
                                                py={1}
                                                rounded="md"
                                                fontSize="xs"
                                                fontWeight="600"
                                                colorScheme={
                                                    reservation.reservation_source ===
                                                    "online"
                                                        ? "blue"
                                                        : "purple"
                                                }
                                            >
                                                {reservation.reservation_source ===
                                                "online"
                                                    ? "Online"
                                                    : "Walk-in"}
                                            </Badge>
                                        </Td>

                                        {/* PURCHASE OPTION */}

                                        <Td>
                                            <Text
                                                fontSize="sm"
                                                color="gray.700"
                                                textTransform="capitalize"
                                            >
                                                {
                                                    reservation.purchase_option
                                                }
                                            </Text>
                                        </Td>

                                        {/* STATUS */}

                                        <Td>
                                            <Box>
                                                <Badge
                                                    px={2}
                                                    py={1}
                                                    rounded="md"
                                                    fontSize="xs"
                                                    fontWeight="600"
                                                    colorScheme={getStatusColor(
                                                        reservation.reservation_status
                                                    )}
                                                >
                                                    {getStatusLabel(
                                                        reservation.reservation_status
                                                    )}
                                                </Badge>

                                                <Box mt={2}>
                                                    <Badge
                                                        px={2}
                                                        py={1}
                                                        rounded="md"
                                                        fontSize="10px"
                                                        fontWeight="700"
                                                        colorScheme={
                                                            getDocumentReview(
                                                                reservation
                                                            )
                                                                .colorScheme
                                                        }
                                                        textTransform="none"
                                                    >
                                                        {
                                                            getDocumentReview(
                                                                reservation
                                                            ).label
                                                        }
                                                    </Badge>
                                                </Box>

                                                {reservation.purchase_option ===
                                                    "financing" &&
                                                    getFinancingSubmissionCount(
                                                        reservation
                                                    ) > 0 && (
                                                        <Box mt={2}>
                                                            <Badge
                                                                px={2}
                                                                py={1}
                                                                rounded="md"
                                                                fontSize="10px"
                                                                fontWeight="700"
                                                                colorScheme="green"
                                                                textTransform="none"
                                                            >
                                                                Financing
                                                                Requirements
                                                                Submitted
                                                                {" ("}
                                                                {getFinancingSubmissionCount(
                                                                    reservation
                                                                )}
                                                                {")"}
                                                            </Badge>
                                                        </Box>
                                                    )}
                                            </Box>
                                        </Td>

                                        {/* ACTIONS */}

                                        <Td>
                                            <HStack
                                                spacing={1}
                                                justify="center"
                                            >
                                                {/* VIEW */}

                                                <Tooltip
                                                    label="View reservation"
                                                    placement="top"
                                                    hasArrow
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        aria-label="View reservation"
                                                        onClick={() =>
                                                            handleView(
                                                                reservation
                                                            )
                                                        }
                                                        color="blue.500"
                                                        _hover={{
                                                            bg: "blue.50",
                                                            color: "blue.600",
                                                        }}
                                                    >
                                                        <EyeIcon
                                                            width={16}
                                                            height={16}
                                                        />
                                                    </Button>
                                                </Tooltip>

                                                {/* UPDATE / VERIFY */}

                                                <Tooltip
                                                    label="Verify reservation"
                                                    placement="top"
                                                    hasArrow
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        aria-label="Verify reservation"
                                                        onClick={() =>
                                                            handleUpdate(
                                                                reservation
                                                            )
                                                        }
                                                        color="orange.500"
                                                        _hover={{
                                                            bg: "orange.50",
                                                            color: "orange.600",
                                                        }}
                                                    >
                                                        <PencilSquareIcon
                                                            width={16}
                                                            height={16}
                                                        />
                                                    </Button>
                                                </Tooltip>

                                                {/* DELETE */}

                                                <Tooltip
                                                    label="Delete reservation"
                                                    placement="top"
                                                    hasArrow
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        aria-label="Delete reservation"
                                                        onClick={() =>
                                                            handleDelete(
                                                                reservation
                                                            )
                                                        }
                                                        color="red.500"
                                                        _hover={{
                                                            bg: "red.50",
                                                            color: "red.600",
                                                        }}
                                                    >
                                                        <TrashIcon
                                                            width={16}
                                                            height={16}
                                                        />
                                                    </Button>
                                                </Tooltip>
                                            </HStack>
                                        </Td>
                                    </Tr>
                                )
                            )
                        )}
                    </Tbody>
                </Table>
            </Box>

            {/* REUSABLE PAGINATION */}

            {totalItems > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemLabel="reservation"
                />
            )}

            {/* VIEW MODAL */}

            <ViewReservationModal
                isOpen={isViewOpen}
                onClose={() => {
                    onViewClose();
                    setSelectedReservation(null);
                }}
                reservation={selectedReservation}
            />

            {/* VERIFY MODAL */}

            <VerifyReservationModal
                isOpen={isUpdateOpen}
                onClose={() => {
                    onUpdateClose();
                    setSelectedReservation(null);
                }}
                reservation={selectedReservation}
                onVerified={handleReservationVerified}
                onChanged={onReload}
            />

            {/* CREATE SALE MODAL */}

            <CreateSaleModal
                isOpen={saleOpen}
                onClose={() => {
                    setSaleOpen(false);
                }}
                reservation={selectedReservation}
                onCreated={handleSaleCreated}
            />

            {/* DELETE DIALOG */}

            <DeleteReservationDialog
                isOpen={isDeleteOpen}
                onClose={() => {
                    onDeleteClose();
                    setSelectedReservation(null);
                }}
                reservation={selectedReservation}
                onDeleted={onReload}
            />
        </Box>
    );
}