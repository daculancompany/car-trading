import {
    Badge,
    Box,
    Grid,
    GridItem,
    HStack,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
} from "@chakra-ui/react";

import {
    CalendarDaysIcon,
    IdentificationIcon,
    TruckIcon,
    UserIcon,
} from "@heroicons/react/24/solid";

import type { ReactNode } from "react";

import ReservationStepper from "../../Shared/Reservations/ReservationStepper";
import ReservationTimeline from "../../Shared/Reservations/ReservationTimeline";
import type { Reservation } from "../../../api/ReservationManagement/reservationApi";
import CustomerAvatar from "../../Shared/Customers/CustomerAvatar";
import DetailsLink from "../../Shared/Details/DetailsLink";

interface ViewReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: Reservation | null;
}

// Status Color

const getStatusColor = (
    status: Reservation["reservation_status"],
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

        case "cancelled":
            return "red";

        case "expired":
            return "gray";

        default:
            return "gray";
    }
};

// Status Label

const getStatusLabel = (
    status: Reservation["reservation_status"],
) => {
    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (character) =>
            character.toUpperCase(),
        );
};

// Date Formatter

const formatDateTime = (
    date?: string | null,
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
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    );
};

// Information Row

const InfoRow = ({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) => {
    return (
        <HStack
            align="start"
            spacing={3}
            py={1.5}
        >
            <Text
                minW={{
                    base: "120px",
                    md: "135px",
                }}
                fontSize="sm"
                fontWeight="600"
                color="gray.600"
            >
                {label}
            </Text>

            <Text
                flex="1"
                fontSize="sm"
                color="gray.800"
                wordBreak="break-word"
            >
                {value || "—"}
            </Text>
        </HStack>
    );
};

// Section Header

const SectionHeader = ({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description?: string;
}) => {
    return (
        <HStack
            spacing={3}
            mb={4}
            align="start"
        >
            <Box
                w="34px"
                h="34px"
                rounded="md"
                bg="brand.50"
                color="brand.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
            >
                {icon}
            </Box>

            <Box>
                <Text
                    fontSize="sm"
                    fontWeight="700"
                    color="gray.800"
                >
                    {title}
                </Text>

                {description && (
                    <Text
                        fontSize="xs"
                        color="gray.500"
                        mt={0.5}
                    >
                        {description}
                    </Text>
                )}
            </Box>
        </HStack>
    );
};

// Admin View Reservation Modal

export default function ViewReservationModal({
    isOpen,
    onClose,
    reservation,
}: ViewReservationModalProps) {
    if (!reservation) {
        return null;
    }

    // Customer

    const customerName = [
        reservation.customer?.first_name,
        reservation.customer?.middle_name,
        reservation.customer?.last_name,
    ]
        .filter(Boolean)
        .join(" ");

    // Vehicle

    const vehicleName = [
        reservation.vehicle?.brand?.brand,
        reservation.vehicle?.model?.model,
    ]
        .filter(Boolean)
        .join(" ");

    // Storage URL

    const getImageUrl = (
        path?: string | null,
    ) => {
        if (!path) {
            return null;
        }

        if (
            path.startsWith("http://") ||
            path.startsWith("https://")
        ) {
            return path;
        }

        return `/storage/${path}`;
    };

    const validIdFrontUrl = getImageUrl(
        reservation.valid_id_front,
    );

    const validIdBackUrl = getImageUrl(
        reservation.valid_id_back,
    );

    // UI

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="6xl"
            isCentered
            scrollBehavior="inside"
        >
            <ModalOverlay bg="blackAlpha.500" />

            <ModalContent
                rounded="lg"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
                shadow="xl"
            >
                {/* HEADER */}

                <ModalHeader
                    px={6}
                    py={4}
                    bg="white"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                >
                    <Text
                        fontSize="md"
                        fontWeight="700"
                        color="gray.800"
                    >
                        Reservation Details
                    </Text>

                    <Text
                        fontSize="xs"
                        fontWeight="400"
                        color="gray.500"
                        mt={1}
                    >
                        Review customer, vehicle, reservation,
                        and identification details.
                    </Text>
                </ModalHeader>

                <ModalCloseButton
                    top={4}
                    right={4}
                    size="sm"
                    rounded="md"
                    color="gray.500"
                    _hover={{
                        bg: "gray.100",
                        color: "gray.700",
                    }}
                />

                {/* BODY */}

                <ModalBody
                    px={{
                        base: 4,
                        md: 6,
                    }}
                    py={6}
                    bg="gray.50"
                >
                    <Stack spacing={5}>

                        {/* CUSTOMER + VEHICLE */}
                        <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" px={{ base: 4, md: 6 }} py={4}>
                            <Text fontSize="sm" fontWeight="700" color="gray.800" mb={3}>
                                Reservation progress
                            </Text>
                            <ReservationStepper reservation={reservation} />
                        </Box>


                        <Grid
                            templateColumns={{
                                base: "1fr",
                                lg: "1fr 1fr",
                            }}
                            gap={5}
                        >
                            {/* CUSTOMER */}

                            <GridItem>
                                <Box
                                    bg="white"
                                    rounded="lg"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    p={5}
                                    shadow="sm"
                                    h="100%"
                                >
                                    <SectionHeader
                                        icon={
                                            <UserIcon
                                                width={18}
                                                height={18}
                                            />
                                        }
                                        title="Customer Information"
                                        description="Customer details associated with this reservation."
                                    />

                                    <Box mb={3}>
                                        <CustomerAvatar
                                            customer={reservation.customer}
                                            size="lg"
                                            withName
                                            name={customerName || "Unknown Customer"}
                                        />
                                    </Box>

                                    <Stack spacing={0}>
                                        <InfoRow
                                            label="Name"
                                            value={
                                                customerName ||
                                                "Unknown Customer"
                                            }
                                        />

                                        <InfoRow
                                            label="Mobile"
                                            value={
                                                reservation
                                                    .customer
                                                    ?.mobile_number
                                            }
                                        />

                                        <InfoRow
                                            label="Address"
                                            value={
                                                reservation
                                                    .customer
                                                    ?.address
                                            }
                                        />

                                        {reservation.customer
                                            ?.user?.email && (
                                                <InfoRow
                                                    label="Email"
                                                    value={
                                                        reservation
                                                            .customer
                                                            .user
                                                            .email
                                                    }
                                                />
                                            )}

                                        {reservation.customer
                                            ?.user
                                            ?.username && (
                                                <InfoRow
                                                    label="Username"
                                                    value={
                                                        reservation
                                                            .customer
                                                            .user
                                                            .username
                                                    }
                                                />
                                            )}
                                    </Stack>
                                </Box>
                            </GridItem>

                            {/* VEHICLE */}

                            <GridItem>
                                <Box
                                    bg="white"
                                    rounded="lg"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    p={5}
                                    shadow="sm"
                                    h="100%"
                                >
                                    <SectionHeader
                                        icon={
                                            <TruckIcon
                                                width={18}
                                                height={18}
                                            />
                                        }
                                        title="Vehicle Information"
                                        description="Vehicle details associated with this reservation."
                                    />

                                    <Stack spacing={0}>
                                        <InfoRow
                                            label="Vehicle"
                                            value={
                                                <DetailsLink type="vehicle" id={reservation.vehicle?.id ?? reservation.vehicle_id}>
                                                    {vehicleName || "Unknown Vehicle"}
                                                </DetailsLink>
                                            }
                                        />

                                        <InfoRow
                                            label="Variant"
                                            value={
                                                reservation
                                                    .vehicle
                                                    ?.variant
                                                    ?.variant
                                            }
                                        />

                                        <InfoRow
                                            label="Stock No."
                                            value={
                                                reservation
                                                    .vehicle
                                                    ?.stock_no
                                            }
                                        />

                                        <InfoRow
                                            label="Year"
                                            value={
                                                reservation
                                                    .vehicle
                                                    ?.year_model
                                            }
                                        />

                                        <InfoRow
                                            label="Color"
                                            value={
                                                reservation
                                                    .vehicle
                                                    ?.color
                                            }
                                        />

                                        {reservation.vehicle
                                            ?.selling_price !=
                                            null && (
                                                <InfoRow
                                                    label="Selling Price"
                                                    value={`₱${Number(
                                                        reservation
                                                            .vehicle
                                                            .selling_price,
                                                    ).toLocaleString()}`}
                                                />
                                            )}

                                        {reservation.vehicle
                                            ?.reservation_price !=
                                            null && (
                                                <InfoRow
                                                    label="Reservation Fee"
                                                    value={`₱${Number(
                                                        reservation
                                                            .vehicle
                                                            .reservation_price,
                                                    ).toLocaleString()}`}
                                                />
                                            )}
                                    </Stack>
                                </Box>
                            </GridItem>
                        </Grid>

                        {/* RESERVATION + VALID ID */}

                        <Grid
                            templateColumns={{
                                base: "1fr",
                                lg: "1fr 1fr",
                            }}
                            gap={5}
                        >
                            {/* RESERVATION DETAILS */}

                            <GridItem>
                                <Box
                                    bg="white"
                                    rounded="lg"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    p={5}
                                    shadow="sm"
                                    h="100%"
                                >
                                    <SectionHeader
                                        icon={
                                            <CalendarDaysIcon
                                                width={18}
                                                height={18}
                                            />
                                        }
                                        title="Reservation Details"
                                        description="Reservation dates, source, purchase option, and status."
                                    />

                                    <Stack spacing={0}>
                                        <InfoRow
                                            label="Reservation Date"
                                            value={formatDateTime(
                                                reservation.reserved_at,
                                            )}
                                        />

                                        <InfoRow
                                            label="Expiration Date"
                                            value={formatDateTime(
                                                reservation.expires_at,
                                            )}
                                        />

                                        <InfoRow
                                            label="Source"
                                            value={
                                                <Text textTransform="capitalize">
                                                    {reservation
                                                        .reservation_source ||
                                                        "—"}
                                                </Text>
                                            }
                                        />

                                        <InfoRow
                                            label="Purchase Option"
                                            value={
                                                <Text textTransform="capitalize">
                                                    {reservation
                                                        .purchase_option ||
                                                        "—"}
                                                </Text>
                                            }
                                        />

                                        <InfoRow
                                            label="Reserved By"
                                            value={
                                                reservation
                                                    .reservedBy
                                                    ? reservation
                                                        .reservedBy
                                                        .username
                                                    : "Online Customer"
                                            }
                                        />

                                        <HStack
                                            align="center"
                                            spacing={3}
                                            py={1.5}
                                        >
                                            <Text
                                                minW={{
                                                    base: "120px",
                                                    md: "135px",
                                                }}
                                                fontSize="sm"
                                                fontWeight="600"
                                                color="gray.600"
                                            >
                                                Status
                                            </Text>

                                            <Badge
                                                colorScheme={getStatusColor(
                                                    reservation.reservation_status,
                                                )}
                                                px={2.5}
                                                py={1}
                                                rounded="md"
                                                fontSize="xs"
                                                fontWeight="600"
                                            >
                                                {getStatusLabel(
                                                    reservation.reservation_status,
                                                )}
                                            </Badge>
                                        </HStack>

                                        <Box
                                            mt={3}
                                            pt={4}
                                            borderTop="1px solid"
                                            borderColor="gray.100"
                                        >
                                            <Text
                                                fontSize="sm"
                                                fontWeight="600"
                                                color="gray.600"
                                                mb={2}
                                            >
                                                Remarks
                                            </Text>

                                            <Box
                                                px={3}
                                                py={3}
                                                rounded="md"
                                                bg="gray.50"
                                                border="1px solid"
                                                borderColor="gray.200"
                                            >
                                                <Text
                                                    fontSize="sm"
                                                    color="gray.700"
                                                    lineHeight="1.6"
                                                >
                                                    {reservation
                                                        .remarks ||
                                                        "No remarks provided."}
                                                </Text>
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Box>
                            </GridItem>

                            {/* VALID ID */}

                            <GridItem>
                                <Box
                                    bg="white"
                                    rounded="lg"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    p={5}
                                    shadow="sm"
                                    h="100%"
                                >
                                    <SectionHeader
                                        icon={
                                            <IdentificationIcon
                                                width={18}
                                                height={18}
                                            />
                                        }
                                        title="Valid ID"
                                        description="Identification document submitted with the reservation."
                                    />

                                    {/* ID TYPE */}

                                    <Box
                                        mb={5}
                                        px={3}
                                        py={2.5}
                                        rounded="md"
                                        bg="gray.50"
                                        border="1px solid"
                                        borderColor="gray.200"
                                    >
                                        <Text
                                            fontSize="xs"
                                            fontWeight="600"
                                            color="gray.500"
                                            mb={0.5}
                                        >
                                            ID Type
                                        </Text>

                                        <Text
                                            fontSize="sm"
                                            fontWeight="600"
                                            color="gray.800"
                                        >
                                            {reservation
                                                .valid_id_type ||
                                                "—"}
                                        </Text>
                                    </Box>

                                    {/* FRONT */}

                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.700"
                                        mb={2}
                                    >
                                        ID Front
                                    </Text>

                                    <Box
                                        border="1px solid"
                                        borderColor="gray.200"
                                        rounded="md"
                                        overflow="hidden"
                                        minH="180px"
                                        bg="gray.50"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        mb={5}
                                    >
                                        {validIdFrontUrl ? (
                                            <Image
                                                src={
                                                    validIdFrontUrl
                                                }
                                                alt="Valid ID Front"
                                                w="100%"
                                                maxH="260px"
                                                objectFit="contain"
                                            />
                                        ) : (
                                            <Text
                                                fontSize="sm"
                                                color="gray.500"
                                                textAlign="center"
                                                py={10}
                                            >
                                                No front ID uploaded.
                                            </Text>
                                        )}
                                    </Box>

                                    {/* BACK */}

                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.700"
                                        mb={2}
                                    >
                                        ID Back
                                    </Text>

                                    <Box
                                        border="1px solid"
                                        borderColor="gray.200"
                                        rounded="md"
                                        overflow="hidden"
                                        minH="180px"
                                        bg="gray.50"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        {validIdBackUrl ? (
                                            <Image
                                                src={
                                                    validIdBackUrl
                                                }
                                                alt="Valid ID Back"
                                                w="100%"
                                                maxH="260px"
                                                objectFit="contain"
                                            />
                                        ) : (
                                            <Text
                                                fontSize="sm"
                                                color="gray.500"
                                                textAlign="center"
                                                py={10}
                                            >
                                                No back ID uploaded.
                                            </Text>
                                        )}
                                    </Box>
                                </Box>
                            </GridItem>
                        </Grid>
                        <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" px={{ base: 4, md: 6 }} py={4}>
                            <Text fontSize="sm" fontWeight="700" color="gray.800" mb={3}>
                                Timeline
                            </Text>
                            <ReservationTimeline reservation={reservation} />
                        </Box>
                    </Stack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

