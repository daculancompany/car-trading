import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
    Badge,
    Box,
    Button,
    CircularProgress,
    CircularProgressLabel,
    Divider,
    Flex,
    Grid,
    GridItem,
    HStack,
    IconButton,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    NumberInput,
    NumberInputField,
    Progress,
    Select,
    SimpleGrid,
    Stack,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useToast,
} from "@chakra-ui/react";
import {
    CheckCircleIcon,
    ClipboardDocumentCheckIcon,
    ClockIcon,
    CurrencyDollarIcon,
    PhotoIcon,
    PlayIcon,
    TrashIcon,
    TruckIcon,
    UserIcon,
    WrenchScrewdriverIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline";

import {
    cancelJobOrder,
    completeJobOrder,
    startJobOrder,
    updateJobOrder,
    type JobOrder,
} from "../../../api/JobOrderManagement/jobOrderApi";
import { createPartsUsed, deletePartsUsed } from "../../../api/PartManagement/partUsedApi";
import { getVehicleParts, type VehiclePart } from "../../../api/PartManagement/vehiclePartsApi";
import {
    INSPECTION_STATE_BADGE,
    canStartJob,
    ESTIMATE_BADGE,
    PAYMENT_BADGE,
    isCustomerUser,
    needsEstimate,
    startBlockReason,
    fuelInfo,
    getInspectionState,
    getJobOrderCosts,
    getJobOrderSource,
    isOfficeUser,
    priorityInfo,
    progressColor,
    resultInfo,
} from "./jobOrderHelpers";
import BillingPanel from "./BillingPanel";
import EstimatePanel from "./EstimatePanel";
import FeedbackPanel from "./FeedbackPanel";
import QrCodeButton from "../../Shared/QrCode/QrCodeButton";
import JobOrderInspectionPanel from "./JobOrderInspectionPanel";
import JobOrderProgressPanel from "./JobOrderProgressPanel";
import JobOrderTimeline from "./JobOrderTimeline";
import PhotoGallery from "./PhotoGallery";
import DetailsLink from "../../Shared/Details/DetailsLink";
import CustomerAvatar from "../../Shared/Customers/CustomerAvatar";

type Props = {
    jobOrder: JobOrder | null;
    isOpen: boolean;
    onClose: () => void;
    onChanged: () => void;
    readOnly?: boolean;
};

const peso = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value || 0);

const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : "—";

const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const STATUS_COLOR: Record<string, string> = {
    pending: "yellow",
    assigned: "purple",
    in_progress: "blue",
    completed: "green",
    cancelled: "red",
};

function Card({ title, icon, action, children }: { title: string; icon?: ReactNode; action?: ReactNode; children: ReactNode }) {
    return (
        <Box bg="white" border="1px" borderColor="gray.200" borderRadius="xl" boxShadow="xs">
            <Flex justify="space-between" align="center" px={5} py={3.5} borderBottom="1px" borderColor="gray.100" gap={3}>
                <HStack spacing={2} color="gray.700">
                    {icon}
                    <Text fontWeight="700" fontSize="sm">
                        {title}
                    </Text>
                </HStack>
                {action}
            </Flex>
            <Box px={5} py={4}>
                {children}
            </Box>
        </Box>
    );
}

function Field({ name, value }: { name: string; value: ReactNode }) {
    return (
        <Flex justify="space-between" gap={3} py={1.5} fontSize="sm">
            <Text color="gray.500" flexShrink={0}>
                {name}
            </Text>
            <Box textAlign="right" fontWeight="600" color="gray.800" minW={0}>
                {value || "—"}
            </Box>
        </Flex>
    );
}

export default function JobOrderDetailsModal({ jobOrder, isOpen, onClose, onChanged, readOnly = false }: Props) {
    const toast = useToast();
    const [parts, setParts] = useState<VehiclePart[]>([]);
    const [partId, setPartId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [saving, setSaving] = useState(false);
    const [labor, setLabor] = useState<number | null>(null);
    const office = isOfficeUser() && !readOnly;
    const customerView = readOnly && isCustomerUser();

    useEffect(() => {
        if (!isOpen || readOnly) return;
        setPartId("");
        setQuantity(1);
        getVehicleParts()
            .then((data) => setParts(data.filter((part) => !part.archived)))
            .catch(() => setParts([]));
    }, [isOpen, readOnly]);

    useEffect(() => {
        setLabor(jobOrder ? Number(jobOrder.labor_cost) || 0 : null);
    }, [jobOrder]);

    const selectedPart = useMemo(() => parts.find((part) => String(part.id) === partId), [parts, partId]);

    if (!jobOrder) return null;

    const showEstimate =
        jobOrder.status !== "cancelled" &&
        ((jobOrder.estimate_status ?? "none") !== "none" || (needsEstimate(jobOrder) && ["pending", "assigned"].includes(jobOrder.status)));

    const source = getJobOrderSource(jobOrder);
    const costs = getJobOrderCosts(jobOrder);
    const request = jobOrder.requestService;
    const closed = ["completed", "cancelled"].includes(jobOrder.status);
    const editable = !closed && !readOnly;
    const inspectionState = getInspectionState(jobOrder);
    const inspectionBadge = INSPECTION_STATE_BADGE[inspectionState];
    const priority = priorityInfo(jobOrder.priority);
    const fuel = fuelInfo(jobOrder.fuel_level);
    const progress = jobOrder.status === "completed" ? 100 : jobOrder.progress ?? 0;
    const estimate = Number(jobOrder.estimated_labor_cost) || 0;
    const result = resultInfo(jobOrder.inspection?.result);

    const vehicle = jobOrder.vehicle;
    const vehicleName = [vehicle?.year_model, vehicle?.brand?.brand, vehicle?.model?.model, vehicle?.variant?.variant]
        .filter(Boolean)
        .join(" ");
    const vehiclePhoto = vehicle?.images?.[0]?.image_path ? `/storage/${vehicle.images[0].image_path}` : null;
    const staff = [jobOrder.assignedStaff?.first_name, jobOrder.assignedStaff?.last_name].filter(Boolean).join(" ");
    const complaint = jobOrder.reported_problem || request?.request_detail || "";

    const showError = (error: any, fallback: string) =>
        toast({ title: error?.response?.data?.message || fallback, status: "error", duration: 4000, isClosable: true });

    const run = async (task: () => Promise<unknown>, success: string, fallback: string) => {
        try {
            setSaving(true);
            await task();
            toast({ title: success, status: "success", duration: 2500 });
            onChanged();
        } catch (error) {
            showError(error, fallback);
        } finally {
            setSaving(false);
        }
    };

    const handleAddPart = async () => {
        if (!selectedPart) return;
        await run(
            () =>
                createPartsUsed({
                    job_order_id: jobOrder.id,
                    vehicle_part_id: selectedPart.id,
                    quantity,
                    used_at: new Date().toISOString(),
                }),
            `${selectedPart.part_name} added`,
            "Could not add the part."
        );
        setPartId("");
        setQuantity(1);
        getVehicleParts().then((data) => setParts(data.filter((part) => !part.archived)));
    };

    const handleCancel = () => {
        if (!window.confirm(`Cancel ${jobOrder.job_order_no}?`)) return;
        run(() => cancelJobOrder(jobOrder.id), "Job order cancelled.", "Could not cancel the job order.");
    };

    const allPhotos = [
        ...(request?.photo_urls?.length ? request.photo_urls : request?.request_proof ? [`/storage/${request.request_proof}`] : []).map((url) => ({
            url,
            tag: "Customer",
            caption: "Photo from the customer",
        })),
        ...(jobOrder.inspection?.photo_list ?? []).map((photo) => ({ url: photo.url, tag: photo.item ?? "Inspection", caption: photo.caption })),
        ...(jobOrder.updates ?? []).flatMap((update) =>
            update.photo_urls.map((url) => ({ url, tag: `${update.progress}%`, caption: update.comment }))
        ),
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent bg="gray.50" borderRadius={0}>
                <ModalHeader bg="white" borderBottom="1px" borderColor="gray.200" py={4} px={{ base: 4, md: 8 }}>
                    <Flex justify="space-between" align={{ base: "start", lg: "center" }} gap={4} direction={{ base: "column", lg: "row" }} pr={10}>
                        <HStack spacing={4} align="center">
                            <CircularProgress value={progress} color={`${progressColor(progress)}.400`} size="56px" thickness="10px">
                                <CircularProgressLabel fontSize="xs" fontWeight="800">
                                    {progress}%
                                </CircularProgressLabel>
                            </CircularProgress>
                            <Box>
                                <HStack spacing={2} wrap="wrap">
                                    <Text fontSize="xl" fontWeight="800" color="dark.900">
                                        {jobOrder.job_order_no}
                                    </Text>
                                    <Badge colorScheme={STATUS_COLOR[jobOrder.status] ?? "gray"}>{label(jobOrder.status)}</Badge>
                                    <Badge colorScheme={priority.color} variant="subtle">
                                        {priority.label} priority
                                    </Badge>
                                    <Badge colorScheme={source.isCustomer ? "blue" : "gray"} variant="outline">
                                        {source.label}
                                    </Badge>
                                    {inspectionBadge && (
                                        <Badge colorScheme={inspectionBadge.color} variant="subtle">
                                            {inspectionBadge.label}
                                        </Badge>
                                    )}
                                    {showEstimate && (
                                        <Badge colorScheme={ESTIMATE_BADGE[jobOrder.estimate_status ?? "none"].color} variant="subtle">
                                            {ESTIMATE_BADGE[jobOrder.estimate_status ?? "none"].label}
                                        </Badge>
                                    )}
                                    {jobOrder.status === "completed" && (
                                        <Badge colorScheme={PAYMENT_BADGE[jobOrder.payment_status ?? "not_billed"].color}>
                                            {PAYMENT_BADGE[jobOrder.payment_status ?? "not_billed"].label}
                                        </Badge>
                                    )}
                                </HStack>
                                <Text fontSize="sm" fontWeight="normal" color="gray.500" mt={1}>
                                    {label(jobOrder.work_type)} ·{" "}
                                    <DetailsLink type="vehicle" id={jobOrder.vehicle_id}>
                                        {vehicleName || "Vehicle"}
                                    </DetailsLink>
                                    {vehicle?.stock_no && ` · ${vehicle.stock_no}`}
                                </Text>
                            </Box>
                        </HStack>

                        <HStack spacing={2} wrap="wrap" display={readOnly ? "none" : "flex"}>
                            {["pending", "assigned"].includes(jobOrder.status) && (
                                <Button
                                    size="sm"
                                    colorScheme="blue"
                                    leftIcon={<PlayIcon width={16} />}
                                    isDisabled={!canStartJob(jobOrder)}
                                    title={startBlockReason(jobOrder) ?? undefined}
                                    isLoading={saving}
                                    onClick={() => run(() => startJobOrder(jobOrder.id), "Job started.", "Could not start the job.")}
                                >
                                    Start job
                                </Button>
                            )}
                            {jobOrder.status === "in_progress" && (
                                <Button
                                    size="sm"
                                    colorScheme="green"
                                    leftIcon={<CheckCircleIcon width={16} />}
                                    isLoading={saving}
                                    onClick={() => run(() => completeJobOrder(jobOrder.id), "Job completed.", "Could not complete the job.")}
                                >
                                    Mark completed
                                </Button>
                            )}
                            {office && (
                                <QrCodeButton
                                    compact
                                    path={`/scan?type=jobOrder&id=${jobOrder.id}`}
                                    title={String(jobOrder.job_order_no)}
                                    subtitle={[vehicleName, vehicle?.specs?.plate_number].filter(Boolean).join(" · ")}
                                    label="Job order QR code"
                                />
                            )}
                            {office && !closed && (
                                <Button size="sm" variant="outline" colorScheme="red" leftIcon={<XCircleIcon width={16} />} onClick={handleCancel} isDisabled={saving}>
                                    Cancel
                                </Button>
                            )}
                        </HStack>
                    </Flex>
                </ModalHeader>
                <ModalCloseButton top={5} right={5} />

                <ModalBody px={{ base: 4, md: 8 }} py={6}>
                    <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 380px" }} gap={6} maxW="1600px" mx="auto">
                        <GridItem minW={0}>
                            <Stack spacing={6}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <Box bg="blue.50" border="1px" borderColor="blue.100" borderRadius="xl" p={5}>
                                        <Flex justify="space-between" gap={2} mb={2} wrap="wrap">
                                            <Text fontSize="xs" fontWeight="800" color="blue.700" textTransform="uppercase" letterSpacing="wide">
                                                Reported problem
                                            </Text>
                                            {request && (
                                                <Text fontSize="xs" color="blue.600">
                                                    {request.service_request_number}
                                                </Text>
                                            )}
                                        </Flex>
                                        <Text fontSize="sm" color="gray.800" whiteSpace="pre-wrap">
                                            {complaint || "No problem was reported."}
                                        </Text>
                                        {(request?.symptoms ?? []).length > 0 && (
                                            <HStack spacing={1.5} mt={3} wrap="wrap">
                                                {(request?.symptoms ?? []).map((symptom) => (
                                                    <Badge key={symptom} colorScheme="blue" variant="subtle" borderRadius="full" px={2}>
                                                        {symptom}
                                                    </Badge>
                                                ))}
                                            </HStack>
                                        )}
                                        {(request?.photo_urls ?? []).length > 0 && (
                                            <Box mt={3}>
                                                <PhotoGallery
                                                    photos={(request?.photo_urls ?? []).map((url) => ({ url }))}
                                                    columns={{ base: 4, md: 5 }}
                                                    size="64px"
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                    <Box
                                        bg={result ? `${result.color}.50` : "gray.100"}
                                        border="1px"
                                        borderColor={result ? `${result.color}.100` : "gray.200"}
                                        borderRadius="xl"
                                        p={5}
                                    >
                                        <Text fontSize="xs" fontWeight="800" color={result ? `${result.color}.700` : "gray.600"} textTransform="uppercase" letterSpacing="wide" mb={2}>
                                            Inspection finding
                                        </Text>
                                        {jobOrder.inspection ? (
                                            <>
                                                <Badge colorScheme={result?.color} mb={2}>
                                                    {result?.label}
                                                </Badge>
                                                <Text fontSize="sm" color="gray.800" whiteSpace="pre-wrap">
                                                    {jobOrder.inspection.findings}
                                                </Text>
                                            </>
                                        ) : (
                                            <Text fontSize="sm" color="gray.500">
                                                {jobOrder.requires_inspection === false ? "Not required for this work type." : "Not inspected yet."}
                                            </Text>
                                        )}
                                    </Box>
                                </SimpleGrid>

                                <Card title="Vehicle inspection" icon={<ClipboardDocumentCheckIcon width={18} />}>
                                    <JobOrderInspectionPanel key={`${jobOrder.id}-${jobOrder.inspection?.inspected_at ?? "new"}`} jobOrder={jobOrder} onChanged={onChanged} readOnly={readOnly} />
                                </Card>

                                {showEstimate && (
                                    <Card title="Estimate & customer approval" icon={<CurrencyDollarIcon width={18} />}>
                                        <EstimatePanel
                                            key={`${jobOrder.id}-${jobOrder.estimate_status}-${jobOrder.estimate_sent_at ?? ""}`}
                                            jobOrder={jobOrder}
                                            onChanged={onChanged}
                                            mode={customerView ? "customer" : office ? "office" : "view"}
                                        />
                                    </Card>
                                )}

                                <Card title="Progress" icon={<ClockIcon width={18} />}>
                                    <JobOrderProgressPanel key={`${jobOrder.id}-${jobOrder.progress}`} jobOrder={jobOrder} onChanged={onChanged} readOnly={readOnly} />
                                </Card>

                                <Card title="Parts & costs" icon={<WrenchScrewdriverIcon width={18} />}>
                                    <TableContainer>
                                        <Table size="sm">
                                            <Thead bg="gray.50">
                                                <Tr>
                                                    <Th>Part</Th>
                                                    <Th isNumeric>Qty</Th>
                                                    <Th isNumeric>Unit price</Th>
                                                    <Th isNumeric>Subtotal</Th>
                                                    {editable && <Th />}
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {(jobOrder.partsUsed ?? []).length === 0 && (
                                                    <Tr>
                                                        <Td colSpan={editable ? 5 : 4} color="gray.500" fontSize="sm" textAlign="center" py={6}>
                                                            No parts used yet.
                                                        </Td>
                                                    </Tr>
                                                )}
                                                {(jobOrder.partsUsed ?? []).map((used) => {
                                                    const price = Number(used.vehicle_part?.unit_price ?? 0);
                                                    return (
                                                        <Tr key={used.id}>
                                                            <Td>
                                                                <DetailsLink type="part" id={used.vehicle_part?.id} fontWeight="600">
                                                                    {used.vehicle_part?.part_name ?? "Part removed"}
                                                                </DetailsLink>
                                                                <Text as="span" color="gray.500" fontSize="xs" ml={2}>
                                                                    {used.vehicle_part?.category}
                                                                </Text>
                                                            </Td>
                                                            <Td isNumeric>{used.quantity}</Td>
                                                            <Td isNumeric>{peso(price)}</Td>
                                                            <Td isNumeric fontWeight="600">{peso(price * used.quantity)}</Td>
                                                            {editable && (
                                                                <Td isNumeric>
                                                                    <IconButton
                                                                        aria-label="Remove part"
                                                                        size="xs"
                                                                        variant="ghost"
                                                                        colorScheme="red"
                                                                        icon={<TrashIcon width={14} />}
                                                                        isDisabled={saving}
                                                                        onClick={() => run(() => deletePartsUsed(used.id), "Part removed.", "Could not remove the part.")}
                                                                    />
                                                                </Td>
                                                            )}
                                                        </Tr>
                                                    );
                                                })}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>

                                    {editable && (
                                        <Flex mt={4} gap={2} align="center" wrap="wrap">
                                            <Select
                                                size="sm"
                                                flex="1"
                                                minW="240px"
                                                placeholder="Add a part (e.g. brake pads, oil)"
                                                value={partId}
                                                onChange={(e) => setPartId(e.target.value)}
                                            >
                                                {parts.map((part) => (
                                                    <option key={part.id} value={part.id} disabled={part.quantity < 1}>
                                                        {part.part_name} — {peso(Number(part.unit_price))} ({part.quantity} in stock)
                                                    </option>
                                                ))}
                                            </Select>
                                            <NumberInput
                                                size="sm"
                                                w="90px"
                                                min={1}
                                                max={selectedPart?.quantity ?? 99}
                                                value={quantity}
                                                onChange={(_, value) => setQuantity(Number.isNaN(value) ? 1 : value)}
                                            >
                                                <NumberInputField />
                                            </NumberInput>
                                            <Button size="sm" colorScheme="brand" onClick={handleAddPart} isDisabled={!selectedPart} isLoading={saving}>
                                                Add part
                                            </Button>
                                        </Flex>
                                    )}
                                </Card>

                                <Card title={`Activity timeline`} icon={<ClockIcon width={18} />}>
                                    <JobOrderTimeline jobOrder={jobOrder} />
                                </Card>

                                {allPhotos.length > 0 && (
                                    <Card title={`All photos (${allPhotos.length})`} icon={<PhotoIcon width={18} />}>
                                        <PhotoGallery photos={allPhotos} columns={{ base: 3, md: 5, lg: 8 }} />
                                    </Card>
                                )}
                            </Stack>
                        </GridItem>

                        <GridItem minW={0}>
                            <Stack spacing={6} position={{ xl: "sticky" }} top={0}>
                                <Card title="Vehicle" icon={<TruckIcon width={18} />}>
                                    <Box h="160px" borderRadius="lg" overflow="hidden" bg="gray.100" mb={3} display="flex" alignItems="center" justifyContent="center">
                                        {vehiclePhoto ? (
                                            <Image src={vehiclePhoto} alt={vehicleName} w="100%" h="100%" objectFit="cover" />
                                        ) : (
                                            <TruckIcon width={48} color="#A0AEC0" />
                                        )}
                                    </Box>
                                    <DetailsLink type="vehicle" id={jobOrder.vehicle_id} fontWeight="700">
                                        {vehicleName || "Vehicle"}
                                    </DetailsLink>
                                    <Divider my={2} />
                                    <Field name="Stock no." value={vehicle?.stock_no} />
                                    <Field name="Plate no." value={vehicle?.specs?.plate_number} />
                                    <Field name="Color" value={vehicle?.color} />
                                    <Field name="Transmission" value={vehicle?.specs?.transmission} />
                                </Card>

                                {source.isCustomer && (
                                    <Card title="Customer" icon={<UserIcon width={18} />}>
                                        <CustomerAvatar customer={source.customer} size="md" withName name={source.customerName || "Customer"} subtitle={source.customerPhone} />
                                        {request?.request_date_pref && (
                                            <Text fontSize="xs" color="gray.500" mt={3}>
                                                Preferred date: {request.request_date_pref}
                                            </Text>
                                        )}
                                    </Card>
                                )}

                                <Card title="Assignment & schedule" icon={<ClockIcon width={18} />}>
                                    <Field name="Assigned to" value={staff} />
                                    <Field name="Priority" value={<Badge colorScheme={priority.color}>{priority.label}</Badge>} />
                                    <Field name="Scheduled" value={formatDate(jobOrder.scheduled_at)} />
                                    <Field name="Est. completion" value={formatDate(jobOrder.estimated_completion)} />
                                    <Field name="Started" value={formatDate(jobOrder.start_job)} />
                                    <Field name="Finished" value={formatDate(jobOrder.finish_job)} />
                                </Card>

                                <Card title="Check-in" icon={<ClipboardDocumentCheckIcon width={18} />}>
                                    <Field name="Odometer" value={jobOrder.odometer_in != null ? `${jobOrder.odometer_in.toLocaleString()} km` : null} />
                                    <Box py={1.5}>
                                        <Flex justify="space-between" fontSize="sm" mb={1}>
                                            <Text color="gray.500">Fuel level</Text>
                                            <Text fontWeight="600">{fuel?.label ?? "—"}</Text>
                                        </Flex>
                                        {fuel && <Progress value={fuel.percent} size="sm" borderRadius="full" colorScheme={fuel.percent <= 25 ? "red" : "green"} />}
                                    </Box>
                                    <Box py={1.5}>
                                        <Text color="gray.500" fontSize="sm">
                                            Personal items left in vehicle
                                        </Text>
                                        <Text fontSize="sm" fontWeight="600" whiteSpace="pre-wrap">
                                            {jobOrder.personal_items || "None"}
                                        </Text>
                                    </Box>
                                    {jobOrder.description && (
                                        <Box py={1.5}>
                                            <Text color="gray.500" fontSize="sm">
                                                Instructions
                                            </Text>
                                            <Text fontSize="sm" whiteSpace="pre-wrap">
                                                {jobOrder.description}
                                            </Text>
                                        </Box>
                                    )}
                                </Card>

                                <Card title="Cost summary" icon={<CurrencyDollarIcon width={18} />}>
                                    <Field name="Parts" value={peso(costs.parts)} />
                                    <Flex justify="space-between" align="center" py={1.5} fontSize="sm" gap={3}>
                                        <Text color="gray.500">Labor</Text>
                                        {office && editable ? (
                                            <HStack>
                                                <NumberInput size="xs" w="110px" min={0} value={labor ?? 0} onChange={(_, value) => setLabor(Number.isNaN(value) ? 0 : value)}>
                                                    <NumberInputField textAlign="right" />
                                                </NumberInput>
                                                <Button
                                                    size="xs"
                                                    isDisabled={labor === (Number(jobOrder.labor_cost) || 0)}
                                                    isLoading={saving}
                                                    onClick={() => run(() => updateJobOrder(jobOrder.id, { labor_cost: labor ?? 0 }), "Labor cost saved.", "Could not save labor cost.")}
                                                >
                                                    Save
                                                </Button>
                                            </HStack>
                                        ) : (
                                            <Text fontWeight="600">{peso(costs.labor)}</Text>
                                        )}
                                    </Flex>
                                    <Divider my={2} />
                                    <Flex justify="space-between" fontWeight="800" fontSize="md">
                                        <Text>Total</Text>
                                        <Text>{peso(costs.total)}</Text>
                                    </Flex>
                                    {estimate > 0 && (
                                        <Text fontSize="xs" color={costs.labor > estimate ? "red.500" : "gray.500"} mt={2}>
                                            Estimated labor: {peso(estimate)}
                                            {costs.labor > estimate && " · over estimate"}
                                        </Text>
                                    )}
                                </Card>

                                {jobOrder.status !== "cancelled" && (
                                    <Card title="Billing & warranty" icon={<CurrencyDollarIcon width={18} />}>
                                        <BillingPanel key={`${jobOrder.id}-${jobOrder.amount_paid}-${jobOrder.warranty_days}-${jobOrder.status}`} jobOrder={jobOrder} onChanged={onChanged} office={office} />
                                    </Card>
                                )}

                                {jobOrder.status === "completed" && (Boolean(jobOrder.request_service_id) || jobOrder.rating) && (
                                    <Card title="Customer rating" icon={<UserIcon width={18} />}>
                                        <FeedbackPanel key={`${jobOrder.id}-${jobOrder.rated_at ?? ""}`} jobOrder={jobOrder} onChanged={onChanged} canRate={customerView} />
                                    </Card>
                                )}
                            </Stack>
                        </GridItem>
                    </Grid>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
