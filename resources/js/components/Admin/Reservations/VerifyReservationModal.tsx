import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
    Badge,
    Box,
    Button,
    Collapse,
    Flex,
    FormControl,
    FormLabel,
    Grid,
    HStack,
    Icon,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    Tooltip,
    useToast,
} from "@chakra-ui/react";

import {
    AdjustmentsHorizontalIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ClockIcon,
    IdentificationIcon,
    InformationCircleIcon,
    TruckIcon,
    UserIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

import {
    RESERVATION_STATUSES,
    approveReservation,
    getReservation,
    rejectReservation,
    reviewReservationId,
    updateReservation,
    type Reservation,
} from "../../../api/ReservationManagement/reservationApi";
import CustomerAvatar from "../../Shared/Customers/CustomerAvatar";
import DetailsLink from "../../Shared/Details/DetailsLink";
import VehicleThumb from "../../Shared/ServiceCards/VehicleThumb";
import ReservationStepper from "../../Shared/Reservations/ReservationStepper";
import ReservationTimeline from "../../Shared/Reservations/ReservationTimeline";
import {
    canRejectReservation,
    nextApproval,
    reservationStatusTheme,
    stageMessage,
} from "../../Shared/Reservations/reservationFlow";

type IdReviewSelection = "" | "approved" | "resubmit";

interface VerifyReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: Reservation | null;
    onVerified?: (reservation: Reservation) => void;
    onChanged?: () => void;
}

const formatText = (value?: string | null) =>
    value ? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "-";

const getImageUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `/storage/${path}`;
};

const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

const peso = (value?: number | null) =>
    value == null ? "-" : new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(Number(value));

const initialReview = (value?: string | null): IdReviewSelection =>
    value === "approved" || value === "resubmit" ? value : "";

const Card = ({ icon, title, right, children, p = 4 }: { icon: ReactNode; title: string; right?: ReactNode; children: ReactNode; p?: number }) => (
    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" overflow="hidden">
        <Flex px={4} py={3} borderBottom="1px solid" borderColor="gray.100" align="center" justify="space-between" gap={2}>
            <HStack spacing={2.5}>
                <Flex boxSize="30px" borderRadius="lg" bg="brand.50" color="brand.500" align="center" justify="center">
                    {icon}
                </Flex>
                <Text fontSize="sm" fontWeight="700" color="gray.800">
                    {title}
                </Text>
            </HStack>
            {right}
        </Flex>
        <Box p={p}>{children}</Box>
    </Box>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
    <Box>
        <Text fontSize="2xs" color="gray.500" textTransform="uppercase" letterSpacing="0.04em" fontWeight="600">
            {label}
        </Text>
        <Text fontSize="sm" fontWeight="600" color="gray.800" mt={0.5}>
            {children}
        </Text>
    </Box>
);

export default function VerifyReservationModal({ isOpen, onClose, reservation, onVerified, onChanged }: VerifyReservationModalProps) {
    const toast = useToast();
    const [current, setCurrent] = useState<Reservation | null>(reservation);
    const [busy, setBusy] = useState<"" | "approve" | "reject" | "review" | "override">("");
    const [frontReview, setFrontReview] = useState<IdReviewSelection>("");
    const [backReview, setBackReview] = useState<IdReviewSelection>("");
    const [frontRemarks, setFrontRemarks] = useState("");
    const [backRemarks, setBackRemarks] = useState("");
    const [approveNote, setApproveNote] = useState("");
    const [rejectMode, setRejectMode] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showOverride, setShowOverride] = useState(false);
    const [overrideStatus, setOverrideStatus] = useState<Reservation["reservation_status"]>("pending_reservation");
    const [overrideRemarks, setOverrideRemarks] = useState("");

    const resetForm = (item: Reservation) => {
        setFrontReview(initialReview(item.valid_id_front_status));
        setBackReview(initialReview(item.valid_id_back_status));
        setFrontRemarks(item.valid_id_front_remarks ?? "");
        setBackRemarks(item.valid_id_back_remarks ?? "");
        setOverrideStatus(item.reservation_status);
        setOverrideRemarks(item.remarks ?? "");
        setApproveNote("");
        setRejectMode(false);
        setRejectReason("");
    };

    useEffect(() => {
        if (!reservation || !isOpen) return;
        setCurrent(reservation);
        resetForm(reservation);
        setShowOverride(false);
        getReservation(reservation.id)
            .then((fresh) => setCurrent((previous) => ({ ...previous, ...fresh, vehicle: { ...previous?.vehicle, ...fresh.vehicle } } as Reservation)))
            .catch(() => undefined);
    }, [reservation, isOpen]);

    const reviewChanged = useMemo(
        () =>
            Boolean(current) &&
            (frontReview !== initialReview(current?.valid_id_front_status) ||
                backReview !== initialReview(current?.valid_id_back_status) ||
                (frontReview === "resubmit" && frontRemarks !== (current?.valid_id_front_remarks ?? "")) ||
                (backReview === "resubmit" && backRemarks !== (current?.valid_id_back_remarks ?? ""))),
        [current, frontReview, backReview, frontRemarks, backRemarks],
    );

    if (!reservation || !current) return null;

    const status = reservationStatusTheme(current.reservation_status);
    const approval = nextApproval(current);
    const stage = stageMessage(current);
    const needsIds = current.reservation_status === "pending_reservation";
    const idsApproved = frontReview === "approved" && backReview === "approved";
    const approveBlocked = needsIds && !idsApproved;
    const canReject = canRejectReservation(current);
    const vehicle = current.vehicle;
    const vehicleName = [vehicle?.year_model, vehicle?.brand?.brand, vehicle?.model?.model, vehicle?.variant?.variant].filter(Boolean).join(" ");
    const loading = busy !== "";

    const fail = (error: unknown, fallback: string) =>
        toast({
            title: fallback,
            description: (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error)?.message,
            status: "error",
            duration: 4000,
            isClosable: true,
            position: "top-right",
        });

    const applyFresh = async (fresh?: Reservation) => {
        const latest = fresh?.status_histories ? fresh : await getReservation(current.id);
        const merged = { ...current, ...latest, vehicle: { ...current.vehicle, ...latest.vehicle } } as Reservation;
        setCurrent(merged);
        resetForm(merged);
        onChanged?.();
        return merged;
    };

    const saveReview = async () => {
        if (frontReview === "resubmit" && !frontRemarks.trim()) throw new Error("A reason is required for the front ID resubmission.");
        if (backReview === "resubmit" && !backRemarks.trim()) throw new Error("A reason is required for the back ID resubmission.");
        await reviewReservationId(current.id, {
            ...(frontReview && { front_status: frontReview, front_remarks: frontRemarks.trim() || null }),
            ...(backReview && { back_status: backReview, back_remarks: backRemarks.trim() || null }),
        });
    };

    const handleReviewOnly = async () => {
        setBusy("review");
        try {
            await saveReview();
            await applyFresh();
            toast({ title: "ID review saved", status: "success", duration: 2500, position: "top-right" });
        } catch (error) {
            fail(error, "Could not save the ID review.");
        } finally {
            setBusy("");
        }
    };

    const handleApprove = async () => {
        setBusy("approve");
        try {
            if (reviewChanged) await saveReview();
            const fresh = await approveReservation(current.id, approveNote.trim() || null);
            const merged = await applyFresh(fresh);
            toast({
                title: "Reservation approved",
                description: `Moved to ${reservationStatusTheme(merged.reservation_status).label}. The customer was notified.`,
                status: "success",
                duration: 3000,
                position: "top-right",
            });
        } catch (error) {
            fail(error, "Could not approve the reservation.");
        } finally {
            setBusy("");
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast({ title: "Please give the reason for rejecting.", status: "warning", duration: 2500, position: "top-right" });
            return;
        }
        setBusy("reject");
        try {
            const fresh = await rejectReservation(current.id, rejectReason.trim());
            await applyFresh(fresh);
            toast({ title: "Reservation rejected", description: "The customer was notified.", status: "success", duration: 3000, position: "top-right" });
        } catch (error) {
            fail(error, "Could not reject the reservation.");
        } finally {
            setBusy("");
        }
    };

    const handleOverride = async () => {
        setBusy("override");
        try {
            if (reviewChanged) await saveReview();
            await updateReservation(current.id, { reservation_status: overrideStatus, remarks: overrideRemarks.trim() || null });
            const merged = await applyFresh();
            toast({ title: "Status updated", status: "success", duration: 2500, position: "top-right" });
            if (["reserved", "completed"].includes(overrideStatus)) {
                onVerified?.(merged);
            }
        } catch (error) {
            fail(error, "Could not update the status.");
        } finally {
            setBusy("");
        }
    };

    const handleClose = () => {
        if (loading) return;
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="6xl" scrollBehavior="inside" isCentered>
            <ModalOverlay bg="blackAlpha.500" />
            <ModalContent maxH="calc(100vh - 2rem)" borderRadius="xl" overflow="hidden" mx={3}>
                <ModalHeader px={{ base: 4, md: 6 }} py={4} borderBottom="1px solid" borderColor="gray.200" pr={14}>
                    <Flex align="center" gap={3} wrap="wrap">
                        <Text fontSize="lg" fontWeight="800" color="gray.800">
                            Reservation #{current.id}
                        </Text>
                        <Badge colorScheme={status.color} borderRadius="full" px={2.5} py={0.5} display="flex" alignItems="center" gap={1}>
                            <Icon as={status.icon} boxSize={3.5} />
                            {status.label}
                        </Badge>
                        <Badge variant="outline" colorScheme={current.purchase_option === "financing" ? "purple" : "green"} borderRadius="full" px={2}>
                            {formatText(current.purchase_option)}
                        </Badge>
                        <Badge variant="subtle" colorScheme="gray" borderRadius="full" px={2}>
                            {formatText(current.reservation_source)}
                        </Badge>
                    </Flex>
                    <Text fontSize="xs" color="gray.500" fontWeight="500" mt={1}>
                        Review the ID, approve or reject, and follow every step until release.
                    </Text>
                </ModalHeader>
                <ModalCloseButton top={4} right={4} isDisabled={loading} />

                <ModalBody p={0} bg="gray.50">
                    <Box bg="white" px={{ base: 4, md: 8 }} pt={5} pb={4} borderBottom="1px solid" borderColor="gray.200">
                        <ReservationStepper reservation={current} />
                    </Box>

                    <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 340px" }} gap={4} p={{ base: 4, md: 6 }}>
                        <Stack spacing={4} minW={0}>
                            <Box bg={`${stage.color}.50`} border="1px solid" borderColor={`${stage.color}.200`} borderLeft="4px solid" borderLeftColor={`${stage.color}.400`} borderRadius="xl" px={4} py={3}>
                                <HStack spacing={2} mb={1}>
                                    <Icon as={approval ? InformationCircleIcon : ClockIcon} boxSize={4} color={`${stage.color}.600`} />
                                    <Text fontSize="sm" fontWeight="800" color={`${stage.color}.800`}>
                                        {approval ? "Next step · " : ""}
                                        {stage.title}
                                    </Text>
                                </HStack>
                                <Text fontSize="sm" color="gray.700">
                                    {stage.message}
                                </Text>
                                {approval && (
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        On approve: {approval.hint}
                                    </Text>
                                )}
                            </Box>

                            {rejectMode && (
                                <Box bg="white" border="2px solid" borderColor="red.300" borderRadius="xl" p={4}>
                                    <HStack spacing={2} mb={2}>
                                        <Icon as={XCircleIcon} color="red.500" boxSize={5} />
                                        <Text fontSize="sm" fontWeight="800" color="red.700">
                                            Reject this reservation
                                        </Text>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.600" mb={2}>
                                        The customer will see this reason and the vehicle becomes available again.
                                    </Text>
                                    <Textarea
                                        value={rejectReason}
                                        onChange={(event) => setRejectReason(event.target.value)}
                                        placeholder="e.g. The ID does not match the customer's name."
                                        rows={3}
                                        size="sm"
                                        autoFocus
                                        isDisabled={loading}
                                    />
                                </Box>
                            )}

                            <Card
                                icon={<IdentificationIcon width={17} />}
                                title={`Valid ID · ${current.valid_id_type ?? "-"}`}
                                right={
                                    idsApproved ? (
                                        <Badge colorScheme="green" borderRadius="full" px={2} display="flex" alignItems="center" gap={1}>
                                            <CheckCircleIcon width={12} />
                                            Both approved
                                        </Badge>
                                    ) : (
                                        <Badge colorScheme="yellow" borderRadius="full" px={2}>
                                            Needs review
                                        </Badge>
                                    )
                                }
                            >
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    {[
                                        { label: "Front", url: getImageUrl(current.valid_id_front), side: "front" as const },
                                        { label: "Back", url: getImageUrl(current.valid_id_back), side: "back" as const },
                                    ].map((image) => {
                                        const review = image.side === "front" ? frontReview : backReview;
                                        const setReview = image.side === "front" ? setFrontReview : setBackReview;
                                        const reviewRemarks = image.side === "front" ? frontRemarks : backRemarks;
                                        const setReviewRemarks = image.side === "front" ? setFrontRemarks : setBackRemarks;

                                        return (
                                            <Box key={image.side} border="1px solid" borderColor={review === "approved" ? "green.200" : review === "resubmit" ? "orange.200" : "gray.200"} borderRadius="lg" overflow="hidden">
                                                <Flex h="190px" bg="gray.50" align="center" justify="center" p={2}>
                                                    {image.url ? (
                                                        <Image src={image.url} alt={`ID ${image.label}`} maxH="100%" maxW="100%" objectFit="contain" borderRadius="md" />
                                                    ) : (
                                                        <Text fontSize="sm" color="gray.500">
                                                            No image uploaded.
                                                        </Text>
                                                    )}
                                                </Flex>
                                                <Box p={3}>
                                                    <Text fontSize="xs" fontWeight="700" color="gray.600" mb={2}>
                                                        ID {image.label}
                                                    </Text>
                                                    <HStack spacing={2}>
                                                        <Button
                                                            size="xs"
                                                            flex="1"
                                                            colorScheme="green"
                                                            variant={review === "approved" ? "solid" : "outline"}
                                                            leftIcon={<CheckCircleIcon width={14} />}
                                                            onClick={() => setReview("approved")}
                                                            isDisabled={loading}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="xs"
                                                            flex="1"
                                                            colorScheme="orange"
                                                            variant={review === "resubmit" ? "solid" : "outline"}
                                                            onClick={() => setReview("resubmit")}
                                                            isDisabled={loading}
                                                        >
                                                            Resubmit
                                                        </Button>
                                                    </HStack>
                                                    {review === "resubmit" && (
                                                        <Textarea
                                                            mt={2}
                                                            value={reviewRemarks}
                                                            onChange={(event) => setReviewRemarks(event.target.value)}
                                                            placeholder={`Why does the ${image.side} ID need to be replaced?`}
                                                            rows={2}
                                                            size="sm"
                                                            isDisabled={loading}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </SimpleGrid>
                            </Card>

                            <Card icon={<InformationCircleIcon width={17} />} title="Reservation details">
                                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                                    <Field label="Reserved on">{formatDateTime(current.reserved_at)}</Field>
                                    <Field label="Hold expires">{formatDateTime(current.expires_at)}</Field>
                                    <Field label="Source">{formatText(current.reservation_source)}</Field>
                                    <Field label="Purchase option">{formatText(current.purchase_option)}</Field>
                                    <Field label="Reservation fee">{peso(current.vehicle?.reservation_price)}</Field>
                                    <Field label="Selling price">{peso(current.vehicle?.selling_price)}</Field>
                                </SimpleGrid>
                                {current.remarks && (
                                    <Box mt={4} p={3} bg="gray.50" borderRadius="md">
                                        <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="600">
                                            Remarks
                                        </Text>
                                        <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
                                            {current.remarks}
                                        </Text>
                                    </Box>
                                )}
                            </Card>

                            {approval && !rejectMode && (
                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.600">
                                        Approval note (optional)
                                    </FormLabel>
                                    <Textarea
                                        value={approveNote}
                                        onChange={(event) => setApproveNote(event.target.value)}
                                        placeholder="Shown in the reservation timeline."
                                        rows={2}
                                        size="sm"
                                        bg="white"
                                        isDisabled={loading}
                                    />
                                </FormControl>
                            )}

                            <Box bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.300">
                                <Button
                                    variant="ghost"
                                    w="full"
                                    justifyContent="space-between"
                                    size="sm"
                                    color="gray.600"
                                    leftIcon={<AdjustmentsHorizontalIcon width={16} />}
                                    rightIcon={showOverride ? <ChevronUpIcon width={14} /> : <ChevronDownIcon width={14} />}
                                    onClick={() => setShowOverride((value) => !value)}
                                >
                                    <Text flex="1" textAlign="left">
                                        Manual status override
                                    </Text>
                                </Button>
                                <Collapse in={showOverride} animateOpacity>
                                    <Stack spacing={3} px={4} pb={4}>
                                        <Text fontSize="xs" color="gray.500">
                                            Only for corrections. Normal steps use the Approve and Reject buttons.
                                        </Text>
                                        <Select size="sm" value={overrideStatus} onChange={(event) => setOverrideStatus(event.target.value as Reservation["reservation_status"])} isDisabled={loading}>
                                            {RESERVATION_STATUSES.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Select>
                                        <Textarea
                                            size="sm"
                                            rows={2}
                                            value={overrideRemarks}
                                            onChange={(event) => setOverrideRemarks(event.target.value)}
                                            placeholder="Reason / remarks"
                                            isDisabled={loading}
                                        />
                                        <Button
                                            size="sm"
                                            alignSelf="flex-end"
                                            variant="outline"
                                            onClick={() => void handleOverride()}
                                            isLoading={busy === "override"}
                                            isDisabled={loading || (overrideStatus === current.reservation_status && overrideRemarks === (current.remarks ?? ""))}
                                        >
                                            Save status
                                        </Button>
                                    </Stack>
                                </Collapse>
                            </Box>
                        </Stack>

                        <Stack spacing={4} minW={0}>
                            <Card icon={<UserIcon width={17} />} title="Customer">
                                <CustomerAvatar customer={current.customer} size="md" withName subtitle={current.customer?.mobile_number} />
                                {current.customer?.address && (
                                    <Text fontSize="xs" color="gray.500" mt={3}>
                                        {current.customer.address}
                                    </Text>
                                )}
                            </Card>

                            <Card icon={<TruckIcon width={17} />} title="Vehicle">
                                <HStack spacing={3} align="center">
                                    <VehicleThumb images={vehicle?.images} alt={vehicleName} size="64px" />
                                    <Box minW={0}>
                                        <DetailsLink type="vehicle" id={vehicle?.id} fontSize="sm" fontWeight="700" noOfLines={2}>
                                            {vehicleName || "Vehicle"}
                                        </DetailsLink>
                                        <HStack spacing={1.5} mt={1} wrap="wrap">
                                            {vehicle?.stock_no && (
                                                <Badge variant="outline" fontSize="2xs">
                                                    {vehicle.stock_no}
                                                </Badge>
                                            )}
                                            {vehicle?.color && (
                                                <Text fontSize="xs" color="gray.500">
                                                    {vehicle.color}
                                                </Text>
                                            )}
                                        </HStack>
                                    </Box>
                                </HStack>
                            </Card>

                            <Card icon={<ClockIcon width={17} />} title="Timeline" right={<Text fontSize="2xs" color="gray.400">{current.status_histories?.length ?? 0} events</Text>}>
                                <Box maxH={{ lg: "420px" }} overflowY="auto" pr={1}>
                                    <ReservationTimeline reservation={current} />
                                </Box>
                            </Card>
                        </Stack>
                    </Grid>
                </ModalBody>

                <ModalFooter px={{ base: 4, md: 6 }} py={3} bg="white" borderTop="1px solid" borderColor="gray.200">
                    <Flex w="full" gap={2} direction={{ base: "column-reverse", sm: "row" }} align={{ sm: "center" }}>
                        <Button size="sm" variant="ghost" onClick={handleClose} isDisabled={loading}>
                            Close
                        </Button>
                        <Box flex="1" />
                        {rejectMode ? (
                            <>
                                <Button size="sm" variant="ghost" onClick={() => setRejectMode(false)} isDisabled={loading}>
                                    Back
                                </Button>
                                <Button size="sm" colorScheme="red" leftIcon={<XCircleIcon width={16} />} onClick={() => void handleReject()} isLoading={busy === "reject"}>
                                    Confirm reject
                                </Button>
                            </>
                        ) : (
                            <>
                                {canReject && (
                                    <Button size="sm" colorScheme="red" variant="outline" leftIcon={<XCircleIcon width={16} />} onClick={() => setRejectMode(true)} isDisabled={loading}>
                                        Reject
                                    </Button>
                                )}
                                {reviewChanged && (!approval || approveBlocked) && (
                                    <Button size="sm" variant="outline" colorScheme="blue" onClick={() => void handleReviewOnly()} isLoading={busy === "review"} isDisabled={loading}>
                                        Save ID review
                                    </Button>
                                )}
                                {approval && (
                                    <Tooltip label={approveBlocked ? "Approve both the front and back of the ID first." : approval.hint} hasArrow>
                                        <Box>
                                            <Button
                                                size="sm"
                                                colorScheme="green"
                                                leftIcon={<CheckCircleIcon width={16} />}
                                                onClick={() => void handleApprove()}
                                                isLoading={busy === "approve"}
                                                isDisabled={loading || approveBlocked}
                                                w={{ base: "full", sm: "auto" }}
                                            >
                                                {approval.label}
                                            </Button>
                                        </Box>
                                    </Tooltip>
                                )}
                            </>
                        )}
                    </Flex>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
