import {
    Alert,
    AlertDescription,
    Avatar,
    AlertIcon,
    Badge,
    Box,
    Button,
    ButtonGroup,
    Divider,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    Grid,
    GridItem,
    HStack,
    Image,
    Input,
    InputGroup,
    InputLeftAddon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    NumberInput,
    NumberInputField,
    Progress,
    Select,
    SimpleGrid,
    Spinner,
    Stack,
    Text,
    Textarea,
    useToast,
} from "@chakra-ui/react";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import {
    ArrowUpIcon,
    ClipboardDocumentCheckIcon,
    InformationCircleIcon,
    UserPlusIcon,
    CurrencyDollarIcon,
    TruckIcon,
    UserIcon,
    WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import api from "../../../api/api";
import {
    createJobOrder,
    getJobOrders,
    type FuelLevel,
    type JobOrderPriority,
    type JobOrderWorkType,
    type Staff,
    type Vehicle,
} from "../../../api/JobOrderManagement/jobOrderApi";
import type { RequestService } from "../../../api/JobOrderManagement/requestServiceApi";
import { FUEL_OPTIONS, NO_INSPECTION_WORK_TYPES, PRIORITY_OPTIONS } from "./jobOrderHelpers";
import CustomerAvatar from "../../Shared/Customers/CustomerAvatar";
import OdometerInput from "./OdometerInput";

interface JobOrderFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    requestService?: RequestService | null;
}

const WORK_TYPES: { value: JobOrderWorkType; label: string; hint: string }[] = [
    { value: "repair", label: "Repair", hint: "Fix a problem" },
    { value: "maintenance", label: "Maintenance", hint: "PMS, oil change" },
    { value: "inspection", label: "Inspection", hint: "Check only" },
    { value: "washing", label: "Washing", hint: "No inspection" },
    { value: "detailing", label: "Detailing", hint: "No inspection" },
    { value: "other", label: "Other", hint: "Anything else" },
];

const toInput = (date: Date) => {
    const local = new Date(date);
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    return local.toISOString().slice(0, 16);
};

const vehicleLabel = (vehicle?: Vehicle | null) =>
    vehicle
        ? [vehicle.year_model, vehicle.brand?.brand, vehicle.model?.model, vehicle.variant?.variant].filter(Boolean).join(" ")
        : "";

const staffName = (staff: Staff) => [staff.first_name, staff.last_name].filter(Boolean).join(" ");

const ESTIMATE_PRESETS = [500, 1000, 1500, 2500, 5000];

const peso = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);

const staffRole = (staff: Staff) => staff.user?.role?.name?.toLowerCase().trim() ?? "";

function Section({ title, icon, children, right, highlight = false }: { title: string; icon: ReactNode; children: ReactNode; right?: ReactNode; highlight?: boolean }) {
    return (
        <Box
            bg="white"
            border="1px"
            borderColor={highlight ? "brand.300" : "gray.200"}
            boxShadow={highlight ? "0 0 0 3px var(--chakra-colors-brand-100)" : undefined}
            borderRadius="xl"
            p={5}
            transition="box-shadow 0.3s, border-color 0.3s"
        >
            <HStack spacing={2} mb={4} color="gray.700">
                {icon}
                <Text fontWeight="700" fontSize="sm" flex="1">
                    {title}
                </Text>
                {right}
            </HStack>
            {children}
        </Box>
    );
}

export default function JobOrderFormModal({ isOpen, onClose, onSuccess, requestService }: JobOrderFormModalProps) {
    const toast = useToast();
    const fromRequest = Boolean(requestService);
    const requestVehicle = requestService?.vehicle_release?.sale?.reservation?.vehicle as Vehicle | undefined;
    const requestCustomer = requestService?.vehicle_release?.sale?.reservation?.customer;

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [activeJobs, setActiveJobs] = useState<Record<number, number>>({});
    const [warranties, setWarranties] = useState<{ vehicleId: number; jobOrderNo: string; until: string; days: number; km: number | null; workType: string }[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [saving, setSaving] = useState(false);

    const [vehicleId, setVehicleId] = useState("");
    const [workType, setWorkType] = useState<JobOrderWorkType | "">("");
    const [priority, setPriority] = useState<JobOrderPriority>("normal");
    const [reportedProblem, setReportedProblem] = useState("");
    const [description, setDescription] = useState("");
    const [staffId, setStaffId] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [estimatedCompletion, setEstimatedCompletion] = useState("");
    const [odometer, setOdometer] = useState<number | null>(null);
    const [fuel, setFuel] = useState<FuelLevel | "">("");
    const [personalItems, setPersonalItems] = useState("");
    const [estimatedLabor, setEstimatedLabor] = useState<number | null>(null);
    const [highlightStaff, setHighlightStaff] = useState(false);
    const staffSection = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        setVehicleId(requestVehicle?.id ? String(requestVehicle.id) : "");
        setWorkType(fromRequest ? ((requestService?.service_type as JobOrderWorkType | undefined) ?? "repair") : "");
        setPriority((requestService?.urgency as JobOrderPriority | undefined) ?? "normal");
        setReportedProblem(
            [
                requestService?.request_detail,
                requestService?.symptoms?.length ? `Symptoms: ${requestService.symptoms.join(", ")}` : null,
            ]
                .filter(Boolean)
                .join("\n\n")
        );
        setDescription("");
        setStaffId("");
        setScheduledAt(toInput(new Date()));
        setEstimatedCompletion("");
        setOdometer(requestService?.mileage ?? null);
        setFuel("");
        setPersonalItems("");
        setEstimatedLabor(null);

        let cancelled = false;
        setLoadingOptions(true);

        Promise.all([
            api.get<{ data: Vehicle[] }>("/vehicles"),
            api.get<{ data: Staff[] }>("/staffs"),
            getJobOrders().catch(() => []),
        ])
            .then(([vehicleResponse, staffResponse, jobOrders]) => {
                if (cancelled) return;

                const vehicleData = Array.isArray(vehicleResponse.data.data) ? vehicleResponse.data.data : [];
                setVehicles(
                    vehicleData.filter((vehicle) => ["available", "maintenance"].includes(String(vehicle.status ?? "").toLowerCase()))
                );

                const staffData = Array.isArray(staffResponse.data.data) ? staffResponse.data.data : [];
                setStaffs(
                    staffData.filter((staff) => {
                        const role = staff.user?.role?.name?.toLowerCase().trim();
                        return (role === "mechanic" || role === "washer") && (!staff.status || staff.status === "active");
                    })
                );

                const counts: Record<number, number> = {};
                jobOrders
                    .filter((jobOrder) => ["pending", "assigned", "in_progress"].includes(jobOrder.status))
                    .forEach((jobOrder) => {
                        counts[jobOrder.assigned_staff_id] = (counts[jobOrder.assigned_staff_id] ?? 0) + 1;
                    });
                setActiveJobs(counts);
                setWarranties(
                    jobOrders
                        .filter((jobOrder) => jobOrder.status === "completed" && jobOrder.warranty_active && jobOrder.warranty_until)
                        .map((jobOrder) => ({
                            vehicleId: jobOrder.vehicle_id,
                            jobOrderNo: String(jobOrder.job_order_no),
                            until: jobOrder.warranty_until as string,
                            days: jobOrder.warranty_days ?? 0,
                            km: jobOrder.warranty_km ?? null,
                            workType: jobOrder.work_type,
                        }))
                );
            })
            .catch((error) => {
                toast({ title: error?.response?.data?.message ?? "Unable to load vehicles and staff.", status: "error", duration: 4000 });
            })
            .finally(() => !cancelled && setLoadingOptions(false));

        return () => {
            cancelled = true;
        };
    }, [isOpen, requestService]);

    const selectedVehicle = useMemo(
        () => (fromRequest ? requestVehicle : vehicles.find((vehicle) => String(vehicle.id) === vehicleId)) ?? null,
        [fromRequest, requestVehicle, vehicles, vehicleId]
    );
    const selectedStaff = staffs.find((staff) => String(staff.id) === staffId) ?? null;
    const preferredRole = workType && NO_INSPECTION_WORK_TYPES.includes(workType) ? "washer" : "mechanic";
    const sortedStaffs = [...staffs].sort(
        (a, b) =>
            Number(staffRole(b) === preferredRole) - Number(staffRole(a) === preferredRole) ||
            (activeJobs[a.id] ?? 0) - (activeJobs[b.id] ?? 0)
    );

    const goToStaff = () => {
        staffSection.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightStaff(true);
        window.setTimeout(() => setHighlightStaff(false), 1600);
    };
    const needsInspection = Boolean(workType) && !NO_INSPECTION_WORK_TYPES.includes(workType);
    const vehicleWarranties = selectedVehicle ? warranties.filter((warranty) => warranty.vehicleId === selectedVehicle.id) : [];
    const vehiclePhoto = selectedVehicle?.images?.[0]?.image_path ? `/storage/${selectedVehicle.images[0].image_path}` : null;

    const handleClose = () => {
        if (!saving) onClose();
    };

    const handleSubmit = async () => {
        const missing = [
            !selectedVehicle && "vehicle",
            !workType && "work type",
            !staffId && "assigned staff",
            !description.trim() && "instructions",
        ].filter(Boolean);

        if (missing.length > 0) {
            toast({ title: "Complete the required fields", description: `Missing: ${missing.join(", ")}.`, status: "warning", duration: 3500 });
            return;
        }

        if (scheduledAt && estimatedCompletion && estimatedCompletion < scheduledAt) {
            toast({ title: "Estimated completion must be after the schedule.", status: "warning", duration: 3000 });
            return;
        }

        try {
            setSaving(true);
            await createJobOrder({
                vehicle_id: selectedVehicle!.id,
                request_service_id: requestService?.id ?? null,
                assigned_staff_id: Number(staffId),
                work_type: workType as JobOrderWorkType,
                description: description.trim(),
                labor_cost: 0,
                priority,
                scheduled_at: scheduledAt || null,
                estimated_completion: estimatedCompletion || null,
                reported_problem: reportedProblem.trim() || null,
                estimated_labor_cost: estimatedLabor,
                odometer_in: odometer,
                fuel_level: fuel || null,
                personal_items: personalItems.trim() || null,
            });

            toast({
                title: fromRequest ? "Request assigned" : "Job order created",
                description: needsInspection ? "The mechanic must inspect the vehicle before starting." : undefined,
                status: "success",
                duration: 3500,
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast({ title: error?.response?.data?.message ?? "Unable to create the job order.", status: "error", duration: 4000 });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="6xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent borderRadius="xl" overflow="hidden">
                <ModalHeader bg="white" borderBottom="1px" borderColor="gray.200">
                    <Text fontSize="lg" fontWeight="800">
                        {fromRequest ? "Assign service request" : "New job order"}
                    </Text>
                    <Text fontSize="sm" fontWeight="normal" color="gray.500">
                        {fromRequest
                            ? `${requestService?.service_request_number} · create a job order and assign a mechanic`
                            : "Plan the work, assign a staff member and record the vehicle check-in."}
                    </Text>
                </ModalHeader>
                <ModalCloseButton isDisabled={saving} />

                <ModalBody bg="gray.50" py={6}>
                    {loadingOptions ? (
                        <Flex justify="center" py={16}>
                            <Spinner color="brand.500" />
                        </Flex>
                    ) : (
                        <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 320px" }} gap={5}>
                            <GridItem minW={0}>
                                <Stack spacing={5}>
                                    <Section title="Vehicle & work" icon={<WrenchScrewdriverIcon width={18} />}>
                                        <Stack spacing={4}>
                                            {!fromRequest && (
                                                <FormControl isRequired>
                                                    <FormLabel fontSize="sm">Vehicle</FormLabel>
                                                    <Select placeholder="Select a vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                                                        {vehicles.map((vehicle) => (
                                                            <option key={vehicle.id} value={vehicle.id}>
                                                                {vehicleLabel(vehicle)} {vehicle.stock_no ? `· ${vehicle.stock_no}` : ""} ({vehicle.status})
                                                            </option>
                                                        ))}
                                                    </Select>
                                                    <FormHelperText fontSize="xs">Only available or maintenance vehicles are listed.</FormHelperText>
                                                </FormControl>
                                            )}

                                            <FormControl isRequired>
                                                <FormLabel fontSize="sm">Work type</FormLabel>
                                                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                                                    {WORK_TYPES.map((type) => (
                                                        <Box
                                                            key={type.value}
                                                            as="button"
                                                            type="button"
                                                            textAlign="left"
                                                            px={3}
                                                            py={2.5}
                                                            borderRadius="lg"
                                                            border="2px"
                                                            borderColor={workType === type.value ? "brand.400" : "gray.200"}
                                                            bg={workType === type.value ? "brand.50" : "white"}
                                                            onClick={() => setWorkType(type.value)}
                                                        >
                                                            <Text fontSize="sm" fontWeight="700">
                                                                {type.label}
                                                            </Text>
                                                            <Text fontSize="xs" color="gray.500">
                                                                {type.hint}
                                                            </Text>
                                                        </Box>
                                                    ))}
                                                </SimpleGrid>
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel fontSize="sm">Priority</FormLabel>
                                                <ButtonGroup size="sm" isAttached variant="outline">
                                                    {PRIORITY_OPTIONS.map((option) => (
                                                        <Button
                                                            key={option.value}
                                                            colorScheme={option.color}
                                                            variant={priority === option.value ? "solid" : "outline"}
                                                            onClick={() => setPriority(option.value)}
                                                        >
                                                            {option.label}
                                                        </Button>
                                                    ))}
                                                </ButtonGroup>
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel fontSize="sm">Reported problem</FormLabel>
                                                <Textarea
                                                    rows={3}
                                                    placeholder="What the customer or staff says is wrong"
                                                    value={reportedProblem}
                                                    onChange={(e) => setReportedProblem(e.target.value)}
                                                />
                                                {fromRequest && <FormHelperText fontSize="xs">Filled from the customer's request. You can edit it.</FormHelperText>}
                                            </FormControl>

                                            <FormControl isRequired>
                                                <FormLabel fontSize="sm">Instructions for the mechanic</FormLabel>
                                                <Textarea
                                                    rows={3}
                                                    placeholder="e.g. Check the brakes and replace pads if worn. Test drive after."
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                />
                                            </FormControl>
                                        </Stack>
                                    </Section>

                                    <Box ref={staffSection}>
                                    <Section
                                        title="Assign mechanic & schedule"
                                        icon={<UserPlusIcon width={18} />}
                                        highlight={highlightStaff}
                                        right={
                                            <Text fontSize="xs" color="gray.500">
                                                {preferredRole === "washer" ? "Washers suggested for this work" : "Mechanics suggested for this work"}
                                            </Text>
                                        }
                                    >
                                        <Stack spacing={4}>
                                            <FormControl isRequired>
                                                <FormLabel fontSize="sm">Assign to</FormLabel>
                                                {sortedStaffs.length === 0 ? (
                                                    <Alert status="warning" borderRadius="lg">
                                                        <AlertIcon />
                                                        <AlertDescription fontSize="sm">No active mechanic or washer accounts. Add one in Staff first.</AlertDescription>
                                                    </Alert>
                                                ) : (
                                                    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={2.5}>
                                                        {sortedStaffs.map((staff) => {
                                                            const selected = String(staff.id) === staffId;
                                                            const jobs = activeJobs[staff.id] ?? 0;
                                                            const role = staffRole(staff);
                                                            const suggested = role === preferredRole;
                                                            const load = jobs >= 4 ? "red" : jobs >= 2 ? "orange" : "green";
                                                            return (
                                                                <Box
                                                                    key={staff.id}
                                                                    as="button"
                                                                    type="button"
                                                                    textAlign="left"
                                                                    position="relative"
                                                                    p={3}
                                                                    borderRadius="lg"
                                                                    border="2px solid"
                                                                    borderColor={selected ? "brand.400" : "gray.200"}
                                                                    bg={selected ? "brand.50" : "white"}
                                                                    opacity={suggested || selected ? 1 : 0.75}
                                                                    _hover={{ borderColor: selected ? "brand.400" : "gray.300", boxShadow: "sm" }}
                                                                    transition="all 0.15s"
                                                                    onClick={() => setStaffId(String(staff.id))}
                                                                >
                                                                    {selected && (
                                                                        <Box position="absolute" top={2} right={2} color="brand.500">
                                                                            <CheckCircleSolid width={20} />
                                                                        </Box>
                                                                    )}
                                                                    <HStack spacing={2.5} pr={6}>
                                                                        <Avatar size="sm" name={staffName(staff)} bg={role === "washer" ? "teal.500" : "blue.500"} color="white" />
                                                                        <Box minW={0}>
                                                                            <Text fontSize="sm" fontWeight="700" noOfLines={1}>
                                                                                {staffName(staff)}
                                                                            </Text>
                                                                            <HStack spacing={1}>
                                                                                <Badge colorScheme={role === "washer" ? "teal" : "blue"} fontSize="2xs">
                                                                                    {staff.user?.role?.name}
                                                                                </Badge>
                                                                                {suggested && (
                                                                                    <Badge colorScheme="green" variant="subtle" fontSize="2xs">
                                                                                        Suggested
                                                                                    </Badge>
                                                                                )}
                                                                            </HStack>
                                                                        </Box>
                                                                    </HStack>
                                                                    <Flex justify="space-between" mt={2.5} fontSize="xs" color="gray.500">
                                                                        <Text>{jobs === 0 ? "Free now" : `${jobs} active job${jobs === 1 ? "" : "s"}`}</Text>
                                                                        {staff.work_start_hour && (
                                                                            <Text>
                                                                                {staff.work_start_hour.slice(0, 5)}–{staff.work_end_hour?.slice(0, 5)}
                                                                            </Text>
                                                                        )}
                                                                    </Flex>
                                                                    <Progress mt={1} value={Math.min(jobs, 5) * 20} size="xs" colorScheme={load} borderRadius="full" bg="gray.100" />
                                                                </Box>
                                                            );
                                                        })}
                                                    </SimpleGrid>
                                                )}
                                            </FormControl>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                <FormControl>
                                                    <FormLabel fontSize="sm">Scheduled</FormLabel>
                                                    <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontSize="sm">Estimated completion</FormLabel>
                                                    <Input
                                                        type="datetime-local"
                                                        min={scheduledAt || undefined}
                                                        value={estimatedCompletion}
                                                        onChange={(e) => setEstimatedCompletion(e.target.value)}
                                                    />
                                                </FormControl>
                                            </SimpleGrid>
                                        </Stack>
                                    </Section>
                                    </Box>

                                    <Section title="Vehicle check-in" icon={<ClipboardDocumentCheckIcon width={18} />}>
                                        <Stack spacing={4}>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                <FormControl>
                                                    <FormLabel fontSize="sm">Odometer</FormLabel>
<OdometerInput value={odometer} onChange={setOdometer} />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontSize="sm">Fuel level</FormLabel>
                                                    <ButtonGroup size="sm" isAttached variant="outline" w="100%">
                                                        {FUEL_OPTIONS.map((option) => (
                                                            <Button
                                                                key={option.value}
                                                                flex="1"
                                                                variant={fuel === option.value ? "solid" : "outline"}
                                                                colorScheme={fuel === option.value ? (option.percent <= 25 ? "red" : "green") : "gray"}
                                                                onClick={() => setFuel(option.value)}
                                                            >
                                                                {option.label}
                                                            </Button>
                                                        ))}
                                                    </ButtonGroup>
                                                </FormControl>
                                            </SimpleGrid>
                                            <FormControl>
                                                <FormLabel fontSize="sm">Personal items left in the vehicle</FormLabel>
                                                <Textarea
                                                    rows={2}
                                                    placeholder="e.g. Umbrella, phone charger, sunglasses"
                                                    value={personalItems}
                                                    onChange={(e) => setPersonalItems(e.target.value)}
                                                />
                                            </FormControl>
                                        </Stack>
                                    </Section>

                                    <Section title="Estimate" icon={<CurrencyDollarIcon width={18} />}>
                                        <Grid templateColumns={{ base: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" }} gap={5}>
                                            <FormControl>
                                                <FormLabel fontSize="sm">Estimated labor cost</FormLabel>
                                                <InputGroup size="lg">
                                                    <InputLeftAddon bg="brand.50" color="brand.600" fontWeight="800" borderColor="gray.200">
                                                        ₱
                                                    </InputLeftAddon>
                                                    <NumberInput
                                                        flex="1"
                                                        min={0}
                                                        precision={2}
                                                        value={estimatedLabor ?? ""}
                                                        onChange={(_, value) => setEstimatedLabor(Number.isNaN(value) ? null : value)}
                                                    >
                                                        <NumberInputField borderLeftRadius={0} placeholder="0.00" fontWeight="700" fontSize="xl" />
                                                    </NumberInput>
                                                </InputGroup>
                                                <HStack spacing={1.5} mt={2.5} wrap="wrap">
                                                    {ESTIMATE_PRESETS.map((amount) => (
                                                        <Button
                                                            key={amount}
                                                            size="xs"
                                                            borderRadius="full"
                                                            variant={estimatedLabor === amount ? "solid" : "outline"}
                                                            colorScheme={estimatedLabor === amount ? "brand" : "gray"}
                                                            onClick={() => setEstimatedLabor(amount)}
                                                        >
                                                            {peso(amount)}
                                                        </Button>
                                                    ))}
                                                    {estimatedLabor != null && (
                                                        <Button size="xs" variant="ghost" onClick={() => setEstimatedLabor(null)}>
                                                            Clear
                                                        </Button>
                                                    )}
                                                </HStack>
                                            </FormControl>
                                            <Box bg="gray.50" border="1px dashed" borderColor="gray.300" borderRadius="lg" p={4}>
                                                <Flex justify="space-between" fontSize="sm" mb={2}>
                                                    <Text color="gray.600">Labor (estimate)</Text>
                                                    <Text fontWeight="700">{estimatedLabor != null ? peso(estimatedLabor) : "—"}</Text>
                                                </Flex>
                                                <Flex justify="space-between" fontSize="sm" mb={3}>
                                                    <Text color="gray.600">Parts</Text>
                                                    <Text color="gray.500">Added after inspection</Text>
                                                </Flex>
                                                <Divider mb={3} />
                                                <HStack spacing={2} align="flex-start" color="gray.500">
                                                    <InformationCircleIcon width={16} style={{ flexShrink: 0, marginTop: 2 }} />
                                                    <Text fontSize="xs">
                                                        This is a quote for the customer. The actual labor cost is set when the job is marked done, and parts are charged from the parts used.
                                                    </Text>
                                                </HStack>
                                            </Box>
                                        </Grid>
                                    </Section>
                                </Stack>
                            </GridItem>

                            <GridItem minW={0}>
                                <Stack spacing={5} position={{ lg: "sticky" }} top={0}>
                                    <Section title="Vehicle" icon={<TruckIcon width={18} />}>
                                        <Box h="150px" borderRadius="lg" overflow="hidden" bg="gray.100" mb={3} display="flex" alignItems="center" justifyContent="center">
                                            {vehiclePhoto ? (
                                                <Image src={vehiclePhoto} alt="Vehicle" w="100%" h="100%" objectFit="cover" />
                                            ) : (
                                                <TruckIcon width={44} color="#A0AEC0" />
                                            )}
                                        </Box>
                                        {selectedVehicle ? (
                                            <>
                                                <Text fontWeight="700">{vehicleLabel(selectedVehicle)}</Text>
                                                <HStack spacing={2} mt={1} wrap="wrap">
                                                    {selectedVehicle.stock_no && <Badge>{selectedVehicle.stock_no}</Badge>}
                                                    {selectedVehicle.specs?.plate_number && <Badge colorScheme="blue">{selectedVehicle.specs.plate_number}</Badge>}
                                                    {selectedVehicle.status && <Badge colorScheme="green">{selectedVehicle.status}</Badge>}
                                                </HStack>
                                            </>
                                        ) : (
                                            <Text fontSize="sm" color="gray.500">
                                                Select a vehicle to see it here.
                                            </Text>
                                        )}
                                    </Section>

                                    {fromRequest && requestCustomer && (
                                        <Section title="Customer" icon={<UserIcon width={18} />}>
                                            <CustomerAvatar customer={requestCustomer} size="md" withName subtitle={requestCustomer.mobile_number} />
                                            {requestService?.request_date_pref && (
                                                <Text fontSize="xs" color="gray.500" mt={3}>
                                                    Preferred date: {requestService.request_date_pref}
                                                </Text>
                                            )}
                                        </Section>
                                    )}

                                    <Section
                                        title="Assigned staff"
                                        icon={<UserIcon width={18} />}
                                        right={
                                            selectedStaff ? (
                                                <Button size="xs" variant="ghost" colorScheme="brand" onClick={goToStaff}>
                                                    Change
                                                </Button>
                                            ) : undefined
                                        }
                                    >
                                        {selectedStaff ? (
                                            <>
                                                <HStack spacing={3}>
                                                    <Avatar size="md" name={staffName(selectedStaff)} bg={staffRole(selectedStaff) === "washer" ? "teal.500" : "blue.500"} color="white" />
                                                    <Box minW={0}>
                                                        <Text fontWeight="700" noOfLines={1}>
                                                            {staffName(selectedStaff)}
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.500">
                                                            {selectedStaff.user?.role?.name}
                                                            {selectedStaff.work_start_hour && ` · ${selectedStaff.work_start_hour.slice(0, 5)}–${selectedStaff.work_end_hour?.slice(0, 5)}`}
                                                        </Text>
                                                    </Box>
                                                </HStack>
                                                <Divider my={3} />
                                                <Flex justify="space-between" fontSize="sm">
                                                    <Text color="gray.500">Active jobs</Text>
                                                    <Badge colorScheme={(activeJobs[selectedStaff.id] ?? 0) >= 3 ? "orange" : "green"}>
                                                        {activeJobs[selectedStaff.id] ?? 0}
                                                    </Badge>
                                                </Flex>
                                            </>
                                        ) : (
                                            <Box
                                                as="button"
                                                type="button"
                                                w="full"
                                                textAlign="center"
                                                border="2px dashed"
                                                borderColor="brand.200"
                                                bg="brand.50"
                                                borderRadius="lg"
                                                px={3}
                                                py={4}
                                                _hover={{ borderColor: "brand.400" }}
                                                onClick={goToStaff}
                                            >
                                                <Flex justify="center" color="brand.500" mb={1.5}>
                                                    <UserPlusIcon width={26} />
                                                </Flex>
                                                <Text fontSize="sm" fontWeight="700" color="brand.700">
                                                    Choose a mechanic
                                                </Text>
                                                <HStack justify="center" spacing={1} mt={0.5} color="gray.500">
                                                    <Text fontSize="xs">Pick one in “Assign mechanic & schedule”</Text>
                                                    <ArrowUpIcon width={12} />
                                                </HStack>
                                            </Box>
                                        )}
                                    </Section>

                                    {vehicleWarranties.length > 0 && (
                                        <Alert status="warning" borderRadius="xl" alignItems="flex-start">
                                            <AlertIcon />
                                            <Box>
                                                <Text fontSize="sm" fontWeight="800">
                                                    Vehicle under warranty
                                                </Text>
                                                {vehicleWarranties.map((warranty) => (
                                                    <Text key={warranty.jobOrderNo} fontSize="xs" mt={1}>
                                                        {warranty.jobOrderNo} ({warranty.workType}) · {warranty.days} days{warranty.km ? ` / ${warranty.km.toLocaleString()} km` : ""} · until{" "}
                                                        {new Date(warranty.until).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                                                    </Text>
                                                ))}
                                                <Text fontSize="xs" color="gray.600" mt={1}>
                                                    If this is the same problem, the repair may be free. Check before charging the customer.
                                                </Text>
                                            </Box>
                                        </Alert>
                                    )}

                                    {workType && (
                                        <Alert status={needsInspection ? "info" : "success"} borderRadius="xl" alignItems="flex-start">
                                            <AlertIcon />
                                            <AlertDescription fontSize="sm">
                                                {needsInspection
                                                    ? "The mechanic must inspect the vehicle and record findings before the job can start."
                                                    : "No inspection needed. The job can start right away."}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </Stack>
                            </GridItem>
                        </Grid>
                    )}
                </ModalBody>

                <ModalFooter bg="white" borderTop="1px" borderColor="gray.200" gap={3}>
                    <Button variant="ghost" onClick={handleClose} isDisabled={saving}>
                        Cancel
                    </Button>
                    <Button colorScheme="brand" onClick={handleSubmit} isLoading={saving} loadingText="Saving" isDisabled={loadingOptions}>
                        {fromRequest ? "Assign & create job order" : "Create job order"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
