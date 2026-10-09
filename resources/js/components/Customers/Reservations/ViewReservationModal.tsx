import {
    Badge,
    Box,
    Divider,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    Text,
    VStack,
} from "@chakra-ui/react";

import {
    CalendarDaysIcon,
    CheckCircleIcon,
    ClockIcon,
    InformationCircleIcon,
    MapPinIcon,
    PaintBrushIcon,
    TagIcon,
    TruckIcon,
} from "@heroicons/react/24/outline";

import ReservationStepper from "../../Shared/Reservations/ReservationStepper";
import ReservationTimeline from "../../Shared/Reservations/ReservationTimeline";
import type { Reservation } from "../../../api/ReservationManagement/reservationApi";

interface ViewReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: Reservation | null;
}

// Reservation Status Color

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
        case "cancelled":
            return "red";
        case "expired":
            return "gray";
        default:
            return "gray";
    }
};

// Format Text

const formatText = (value?: string | null) => {
    if (!value) return "-";

    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (date?: string | null) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "-";
    }

    return parsedDate.toLocaleString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// Information Row Component

interface InformationRowProps {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
}

const InformationRow = ({
    icon: Icon,
    label,
    value,
}: InformationRowProps) => {
    return (
        <HStack
            align="start"
            spacing={3}
            py={3}
            borderBottom="1px solid"
            borderColor="gray.100"
        >
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="gray.50"
                color="gray.600"
                borderRadius="lg"
                minW="36px"
                h="36px"
            >
                <Icon width={19} height={19} />
            </Box>

            <Box flex="1">
                <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    color="gray.500"
                    mb={1}
                >
                    {label}
                </Text>

                <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.800"
                >
                    {value || "-"}
                </Text>
            </Box>
        </HStack>
    );
};

// Section Header Component

interface SectionHeaderProps {
    icon: React.ElementType;
    title: string;
    subtitle: string;
}

const SectionHeader = ({
    icon: Icon,
    title,
    subtitle,
}: SectionHeaderProps) => {
    return (
        <HStack spacing={3} mb={4}>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="red.50"
                color="red.500"
                borderRadius="lg"
                w="42px"
                h="42px"
            >
                <Icon width={22} height={22} />
            </Box>

            <Box>
                <Text
                    fontSize="md"
                    fontWeight="bold"
                    color="gray.800"
                >
                    {title}
                </Text>

                <Text
                    fontSize="xs"
                    color="gray.500"
                >
                    {subtitle}
                </Text>
            </Box>
        </HStack>
    );
};

// Customer View Reservation Modal

export default function CustomerViewReservationModal({
    isOpen,
    onClose,
    reservation,
}: ViewReservationModalProps) {
    if (!reservation) {
        return null;
    }

    const vehicleName = [
        reservation.vehicle?.brand?.brand,
        reservation.vehicle?.model?.model,
        reservation.vehicle?.variant?.variant,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="4xl"
            scrollBehavior="inside"
            isCentered
        >
            <ModalOverlay bg="blackAlpha.600" />

            <ModalContent
                borderRadius="2xl"
                overflow="hidden"
                mx={4}
            >
                {/* MODAL HEADER */}

                <ModalHeader
                    bg="gray.50"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    py={5}
                    pr={12}
                >
                    <HStack spacing={3}>
                        <Box
                            bg="red.500"
                            color="white"
                            borderRadius="lg"
                            w="42px"
                            h="42px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <TruckIcon
                                width={23}
                                height={23}
                            />
                        </Box>

                        <Box>
                            <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="gray.800"
                            >
                                Reservation Details
                            </Text>

                            <Text
                                fontSize="xs"
                                fontWeight="normal"
                                color="gray.500"
                            >
                                Vehicle and reservation information
                            </Text>
                        </Box>
                    </HStack>
                </ModalHeader>

                <ModalCloseButton
                    top={5}
                    right={4}
                    borderRadius="full"
                />

                <ModalBody
                    bg="white"
                    p={{ base: 4, md: 6 }}
                >
                    <VStack
                        spacing={6}
                        align="stretch"
                    >
                        <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" px={{ base: 4, md: 6 }} py={4}>
                            <Text fontSize="sm" fontWeight="700" color="gray.800" mb={3}>
                                Reservation progress
                            </Text>
                            <ReservationStepper reservation={reservation} customerView />
                        </Box>

                        {/* VEHICLE INFORMATION */}

                        <Box
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="xl"
                            overflow="hidden"
                        >
                            <Box
                                bg="gray.50"
                                px={5}
                                py={4}
                                borderBottom="1px solid"
                                borderColor="gray.200"
                            >
                                <SectionHeader
                                    icon={TruckIcon}
                                    title="Vehicle Information"
                                    subtitle="Details of the reserved vehicle"
                                />
                            </Box>

                            <Box px={5} pb={3}>
                                <SimpleGrid
                                    columns={{
                                        base: 1,
                                        md: 2,
                                    }}
                                    spacingX={8}
                                >
                                    <InformationRow
                                        icon={TruckIcon}
                                        label="Vehicle"
                                        value={
                                            vehicleName || "-"
                                        }
                                    />

                                    <InformationRow
                                        icon={TagIcon}
                                        label="Stock Number"
                                        value={
                                            reservation.vehicle
                                                ?.stock_no || "-"
                                        }
                                    />

                                    <InformationRow
                                        icon={CalendarDaysIcon}
                                        label="Year Model"
                                        value={
                                            reservation.vehicle
                                                ?.year_model || "-"
                                        }
                                    />

                                    <InformationRow
                                        icon={PaintBrushIcon}
                                        label="Color"
                                        value={
                                            reservation.vehicle
                                                ?.color || "-"
                                        }
                                    />

                                    <InformationRow
                                        icon={InformationCircleIcon}
                                        label="Vehicle Status"
                                        value={formatText(
                                            reservation.vehicle
                                                ?.status
                                        )}
                                    />
                                </SimpleGrid>
                            </Box>
                        </Box>

                        {/* RESERVATION INFORMATION */}

                        <Box
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="xl"
                            overflow="hidden"
                        >
                            <Box
                                bg="gray.50"
                                px={5}
                                py={4}
                                borderBottom="1px solid"
                                borderColor="gray.200"
                            >
                                <SectionHeader
                                    icon={CalendarDaysIcon}
                                    title="Reservation Information"
                                    subtitle="Details and current reservation status"
                                />
                            </Box>

                            <Box px={5} pb={3}>
                                <SimpleGrid
                                    columns={{
                                        base: 1,
                                        md: 2,
                                    }}
                                    spacingX={8}
                                >
                                    <InformationRow
                                        icon={CalendarDaysIcon}
                                        label="Reservation Date"
                                        value={formatDate(
                                            reservation.reserved_at
                                        )}
                                    />

                                    <InformationRow
                                        icon={ClockIcon}
                                        label="Expiration Date"
                                        value={formatDate(
                                            reservation.expires_at
                                        )}
                                    />

                                    <InformationRow
                                        icon={MapPinIcon}
                                        label="Reservation Source"
                                        value={formatText(
                                            reservation.reservation_source
                                        )}
                                    />

                                    <InformationRow
                                        icon={TagIcon}
                                        label="Purchase Option"
                                        value={formatText(
                                            reservation.purchase_option
                                        )}
                                    />
                                </SimpleGrid>

                                <Divider my={4} />

                                {/* STATUS */}

                                <Box
                                    bg="gray.50"
                                    borderRadius="lg"
                                    p={4}
                                >
                                    <HStack
                                        justify="space-between"
                                        align="center"
                                        flexWrap="wrap"
                                        gap={2}
                                    >
                                        <HStack spacing={2}>
                                            <CheckCircleIcon
                                                width={20}
                                                height={20}
                                            />

                                            <Text
                                                fontSize="sm"
                                                fontWeight="semibold"
                                                color="gray.700"
                                            >
                                                Reservation Status
                                            </Text>
                                        </HStack>

                                        <Badge
                                            colorScheme={getStatusColor(
                                                reservation.reservation_status
                                            )}
                                            borderRadius="full"
                                            px={3}
                                            py={1}
                                            fontSize="xs"
                                            textTransform="capitalize"
                                        >
                                            {formatText(
                                                reservation.reservation_status
                                            )}
                                        </Badge>
                                    </HStack>
                                </Box>

                                {/* REMARKS */}

                                <Box mt={4}>
                                    <HStack
                                        spacing={2}
                                        mb={2}
                                    >
                                        <InformationCircleIcon
                                            width={19}
                                            height={19}
                                        />

                                        <Text
                                            fontSize="sm"
                                            fontWeight="semibold"
                                            color="gray.700"
                                        >
                                            Remarks
                                        </Text>
                                    </HStack>

                                    <Box
                                        bg="gray.50"
                                        borderRadius="lg"
                                        p={4}
                                    >
                                        <Text
                                            fontSize="sm"
                                            color="gray.600"
                                            whiteSpace="pre-wrap"
                                        >
                                            {reservation.remarks ||
                                                "No remarks available."}
                                        </Text>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                        <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" px={{ base: 4, md: 6 }} py={4}>
                            <Text fontSize="sm" fontWeight="700" color="gray.800" mb={3}>
                                Timeline
                            </Text>
                            <ReservationTimeline reservation={reservation} customerView />
                        </Box>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}