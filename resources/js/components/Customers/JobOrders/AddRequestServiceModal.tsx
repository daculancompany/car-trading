import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
    Alert,
    AlertDescription,
    AlertIcon,
    Badge,
    Box,
    Button,
    ButtonGroup,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    HStack,
    Input,
    InputGroup,
    InputRightAddon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    NumberInput,
    NumberInputField,
    Select,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    Wrap,
    WrapItem,
    useToast,
} from "@chakra-ui/react";

import {
    CalendarDaysIcon,
    CameraIcon,
    ChatBubbleBottomCenterTextIcon,
    TruckIcon,
    WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

import {
    createRequestService,
    type RequestServiceType,
    type RequestUrgency,
    type VehicleRelease,
} from "../../../api/JobOrderManagement/requestServiceApi";
import MultiPhotoInput, { type PendingPhoto } from "../../Admin/JobOrders/MultiPhotoInput";

interface AddRequestServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicleReleases: VehicleRelease[];
    onSuccess: () => void;
}

const SERVICE_TYPES: { value: RequestServiceType; label: string; hint: string }[] = [
    { value: "repair", label: "Repair", hint: "Something is broken" },
    { value: "maintenance", label: "Maintenance", hint: "PMS, oil change" },
    { value: "inspection", label: "Check-up", hint: "Not sure what's wrong" },
    { value: "washing", label: "Washing", hint: "Exterior & interior" },
    { value: "detailing", label: "Detailing", hint: "Deep clean, polish" },
    { value: "other", label: "Other", hint: "Anything else" },
];

const SYMPTOMS = [
    "Strange noise",
    "Warning light on",
    "Vibration",
    "Fluid leak",
    "Overheating",
    "Hard to start",
    "Brake problem",
    "Steering problem",
    "Aircon not cold",
    "Electrical problem",
    "Tire problem",
    "Smoke or burning smell",
    "Body damage",
];

const STARTED_OPTIONS = [
    { value: "today", label: "Today" },
    { value: "few_days", label: "A few days ago" },
    { value: "week", label: "About a week" },
    { value: "month", label: "A month or more" },
];

const URGENCY_OPTIONS: { value: RequestUrgency; label: string; color: string }[] = [
    { value: "low", label: "Low", color: "gray" },
    { value: "normal", label: "Normal", color: "blue" },
    { value: "high", label: "High", color: "orange" },
    { value: "urgent", label: "Urgent", color: "red" },
];

const TIME_OPTIONS = [
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "any", label: "Any time" },
] as const;

const PROBLEM_TYPES: RequestServiceType[] = ["repair", "inspection", "other"];

const today = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
};

const generateRequestNumber = () => {
    const date = new Date();
    const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    return `SR-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
};

function Section({ step, title, icon, children }: { step: number; title: string; icon: ReactNode; children: ReactNode }) {
    return (
        <Box bg="white" border="1px" borderColor="gray.200" borderRadius="xl" p={{ base: 4, md: 5 }}>
            <HStack spacing={3} mb={4}>
                <Flex boxSize="28px" borderRadius="full" bg="brand.500" color="white" align="center" justify="center" fontSize="xs" fontWeight="800">
                    {step}
                </Flex>
                <HStack spacing={2} color="gray.700">
                    {icon}
                    <Text fontWeight="700" fontSize="sm">
                        {title}
                    </Text>
                </HStack>
            </HStack>
            {children}
        </Box>
    );
}

export default function AddRequestServiceModal({ isOpen, onClose, vehicleReleases, onSuccess }: AddRequestServiceModalProps) {
    const toast = useToast();

    const [vehicleReleaseId, setVehicleReleaseId] = useState("");
    const [serviceType, setServiceType] = useState<RequestServiceType>("repair");
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [requestDetail, setRequestDetail] = useState("");
    const [problemStarted, setProblemStarted] = useState("");
    const [mileage, setMileage] = useState<number | null>(null);
    const [photos, setPhotos] = useState<PendingPhoto[]>([]);
    const [requestDatePref, setRequestDatePref] = useState("");
    const [preferredTime, setPreferredTime] = useState<"morning" | "afternoon" | "any">("any");
    const [urgency, setUrgency] = useState<RequestUrgency>("normal");
    const [contactNumber, setContactNumber] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const releasedVehicles = useMemo(
        () => vehicleReleases.filter((release) => String(release.status ?? "").toLowerCase() === "released"),
        [vehicleReleases]
    );

    const selectedRelease = releasedVehicles.find((release) => String(release.id) === vehicleReleaseId) ?? null;
    const selectedVehicle = selectedRelease?.sale?.reservation?.vehicle;
    const asksProblem = PROBLEM_TYPES.includes(serviceType);

    const vehicleName = (release: VehicleRelease) => {
        const vehicle = release.sale?.reservation?.vehicle;
        return (
            [vehicle?.year_model, vehicle?.brand?.brand, vehicle?.model?.model, vehicle?.variant?.variant].filter(Boolean).join(" ") ||
            release.release_number
        );
    };

    const resetForm = () => {
        setVehicleReleaseId(releasedVehicles.length === 1 ? String(releasedVehicles[0].id) : "");
        setServiceType("repair");
        setSymptoms([]);
        setRequestDetail("");
        setProblemStarted("");
        setMileage(null);
        setPhotos([]);
        setRequestDatePref("");
        setPreferredTime("any");
        setUrgency("normal");
        setContactNumber("");
    };

    useEffect(() => {
        if (isOpen) resetForm();
    }, [isOpen]);

    const handleClose = () => {
        if (!submitting) onClose();
    };

    const toggleSymptom = (symptom: string) =>
        setSymptoms((current) => (current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]));

    const handleSubmit = async () => {
        const warn = (title: string) => toast({ title, status: "warning", duration: 3000, isClosable: true });

        if (!vehicleReleaseId) return warn("Select the vehicle that needs service.");
        if (!requestDetail.trim()) return warn("Describe the service or problem.");
        if (photos.length === 0) return warn("Add at least one photo of the vehicle or problem.");
        if (!requestDatePref) return warn("Choose your preferred service date.");

        try {
            setSubmitting(true);

            await createRequestService({
                vehicle_release_id: Number(vehicleReleaseId),
                service_request_number: generateRequestNumber(),
                request_detail: requestDetail.trim(),
                photos: photos.map((photo) => photo.file),
                request_date_pref: requestDatePref,
                service_type: serviceType,
                urgency,
                symptoms: asksProblem ? symptoms : [],
                problem_started: asksProblem ? problemStarted || null : null,
                mileage,
                preferred_time: preferredTime,
                contact_number: contactNumber.trim() || null,
            });

            toast({
                title: "Service request submitted",
                description: "We'll review it and assign a mechanic. You can track it on this page.",
                status: "success",
                duration: 4000,
                isClosable: true,
            });

            resetForm();
            onSuccess();
        } catch (error: any) {
            toast({
                title: "Submission failed",
                description: error?.response?.data?.message || "Failed to submit service request.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="4xl" scrollBehavior="inside">
            <ModalOverlay />

            <ModalContent borderRadius="2xl" overflow="hidden" mx={4}>
                <ModalHeader px={6} py={5} bg="white" borderBottom="1px" borderColor="gray.200">
                    <Flex align="center" gap={3}>
                        <Flex boxSize="44px" borderRadius="xl" bg="brand.50" color="brand.600" align="center" justify="center">
                            <TruckIcon width={24} height={24} />
                        </Flex>
                        <Box>
                            <Text fontSize="md" fontWeight="800" color="dark.900">
                                Request Vehicle Service
                            </Text>
                            <Text fontSize="xs" fontWeight="500" color="gray.500" mt={0.5}>
                                Tell us what your vehicle needs. Photos help our mechanics prepare.
                            </Text>
                        </Box>
                    </Flex>
                </ModalHeader>

                <ModalCloseButton top={5} right={5} isDisabled={submitting} />

                <ModalBody px={{ base: 4, md: 6 }} py={6} bg="gray.50">
                    <Stack spacing={5}>
                        <Section step={1} title="Vehicle" icon={<TruckIcon width={18} />}>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm">Which vehicle?</FormLabel>
                                <Select
                                    h="44px"
                                    bg="white"
                                    placeholder="Select your vehicle"
                                    value={vehicleReleaseId}
                                    onChange={(e) => setVehicleReleaseId(e.target.value)}
                                >
                                    {releasedVehicles.map((release) => (
                                        <option key={release.id} value={release.id}>
                                            {vehicleName(release)}
                                            {release.sale?.reservation?.vehicle?.specs?.plate_number
                                                ? ` (${release.sale.reservation.vehicle.specs.plate_number})`
                                                : ""}
                                        </option>
                                    ))}
                                </Select>
                                {releasedVehicles.length === 0 && (
                                    <FormHelperText fontSize="xs">No released vehicles are available for service requests.</FormHelperText>
                                )}
                            </FormControl>

                            {selectedRelease && (
                                <HStack mt={3} spacing={2} wrap="wrap">
                                    <Badge colorScheme="green">Released</Badge>
                                    {selectedVehicle?.specs?.plate_number && <Badge colorScheme="blue">{selectedVehicle.specs.plate_number}</Badge>}
                                    {selectedVehicle?.color && <Badge>{selectedVehicle.color}</Badge>}
                                    <Text fontSize="xs" color="gray.500">
                                        {selectedRelease.release_number}
                                    </Text>
                                </HStack>
                            )}

                            <FormControl mt={4} maxW="260px">
                                <FormLabel fontSize="sm">Current mileage</FormLabel>
                                <InputGroup>
                                    <NumberInput flex="1" min={0} value={mileage ?? ""} onChange={(_, value) => setMileage(Number.isNaN(value) ? null : value)}>
                                        <NumberInputField bg="white" borderRightRadius={0} placeholder="e.g. 52000" />
                                    </NumberInput>
                                    <InputRightAddon>km</InputRightAddon>
                                </InputGroup>
                            </FormControl>
                        </Section>

                        <Section step={2} title="What do you need?" icon={<WrenchScrewdriverIcon width={18} />}>
                            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2} mb={asksProblem ? 5 : 4}>
                                {SERVICE_TYPES.map((type) => (
                                    <Box
                                        key={type.value}
                                        as="button"
                                        type="button"
                                        textAlign="left"
                                        px={3}
                                        py={2.5}
                                        borderRadius="lg"
                                        border="2px"
                                        borderColor={serviceType === type.value ? "brand.400" : "gray.200"}
                                        bg={serviceType === type.value ? "brand.50" : "white"}
                                        onClick={() => setServiceType(type.value)}
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

                            {asksProblem && (
                                <>
                                    <FormControl mb={4}>
                                        <FormLabel fontSize="sm">What are you noticing? (pick all that apply)</FormLabel>
                                        <Wrap spacing={2}>
                                            {SYMPTOMS.map((symptom) => {
                                                const active = symptoms.includes(symptom);
                                                return (
                                                    <WrapItem key={symptom}>
                                                        <Button
                                                            size="sm"
                                                            borderRadius="full"
                                                            variant={active ? "solid" : "outline"}
                                                            colorScheme={active ? "brand" : "gray"}
                                                            bg={active ? undefined : "white"}
                                                            onClick={() => toggleSymptom(symptom)}
                                                        >
                                                            {symptom}
                                                        </Button>
                                                    </WrapItem>
                                                );
                                            })}
                                        </Wrap>
                                    </FormControl>

                                    <FormControl mb={4}>
                                        <FormLabel fontSize="sm">When did it start?</FormLabel>
                                        <ButtonGroup size="sm" isAttached variant="outline" flexWrap="wrap">
                                            {STARTED_OPTIONS.map((option) => (
                                                <Button
                                                    key={option.value}
                                                    bg={problemStarted === option.value ? undefined : "white"}
                                                    colorScheme={problemStarted === option.value ? "brand" : "gray"}
                                                    variant={problemStarted === option.value ? "solid" : "outline"}
                                                    onClick={() => setProblemStarted(problemStarted === option.value ? "" : option.value)}
                                                >
                                                    {option.label}
                                                </Button>
                                            ))}
                                        </ButtonGroup>
                                    </FormControl>
                                </>
                            )}

                            <FormControl isRequired>
                                <FormLabel fontSize="sm">{asksProblem ? "Describe the problem" : "Describe what you need"}</FormLabel>
                                <Textarea
                                    bg="white"
                                    rows={4}
                                    maxLength={2000}
                                    placeholder={
                                        asksProblem
                                            ? "e.g. Squeaking sound from the front left wheel when braking, louder in the morning."
                                            : "e.g. Full interior and exterior wash before a trip on Saturday."
                                    }
                                    value={requestDetail}
                                    onChange={(e) => setRequestDetail(e.target.value)}
                                />
                                <Flex justify="space-between" mt={1}>
                                    <FormHelperText fontSize="xs" mt={0}>
                                        Where, when and how often it happens helps the mechanic find it faster.
                                    </FormHelperText>
                                    <Text fontSize="xs" color="gray.400">
                                        {requestDetail.length}/2000
                                    </Text>
                                </Flex>
                            </FormControl>
                        </Section>

                        <Section step={3} title="Photos" icon={<CameraIcon width={18} />}>
                            <Text fontSize="sm" color="gray.600" mb={3}>
                                Add up to 10 photos: the problem area, warning lights on the dashboard, leaks under the car, or damage.
                            </Text>
                            <MultiPhotoInput photos={photos} onChange={setPhotos} max={10} label="Add photos" showCaption={false} />
                            <HStack mt={3} spacing={2}>
                                <Badge colorScheme={photos.length > 0 ? "green" : "gray"}>{photos.length} / 10</Badge>
                                <Text fontSize="xs" color="gray.500">
                                    JPG, PNG or WebP · up to 5 MB each · at least 1 required
                                </Text>
                            </HStack>
                        </Section>

                        <Section step={4} title="Schedule & contact" icon={<CalendarDaysIcon width={18} />}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Preferred date</FormLabel>
                                    <Input type="date" bg="white" min={today()} value={requestDatePref} onChange={(e) => setRequestDatePref(e.target.value)} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="sm">Preferred time</FormLabel>
                                    <ButtonGroup size="md" isAttached variant="outline" w="100%">
                                        {TIME_OPTIONS.map((option) => (
                                            <Button
                                                key={option.value}
                                                flex="1"
                                                bg={preferredTime === option.value ? undefined : "white"}
                                                colorScheme={preferredTime === option.value ? "brand" : "gray"}
                                                variant={preferredTime === option.value ? "solid" : "outline"}
                                                onClick={() => setPreferredTime(option.value)}
                                            >
                                                {option.label}
                                            </Button>
                                        ))}
                                    </ButtonGroup>
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="sm">How urgent is it?</FormLabel>
                                    <ButtonGroup size="md" isAttached variant="outline" w="100%">
                                        {URGENCY_OPTIONS.map((option) => (
                                            <Button
                                                key={option.value}
                                                flex="1"
                                                bg={urgency === option.value ? undefined : "white"}
                                                colorScheme={urgency === option.value ? option.color : "gray"}
                                                variant={urgency === option.value ? "solid" : "outline"}
                                                onClick={() => setUrgency(option.value)}
                                            >
                                                {option.label}
                                            </Button>
                                        ))}
                                    </ButtonGroup>
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="sm">Contact number for this request</FormLabel>
                                    <Input
                                        bg="white"
                                        type="tel"
                                        placeholder="Leave empty to use your profile number"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                    />
                                </FormControl>
                            </SimpleGrid>

                            {urgency === "urgent" && (
                                <Alert status="warning" borderRadius="lg" mt={4}>
                                    <AlertIcon />
                                    <AlertDescription fontSize="sm">
                                        If the vehicle is unsafe to drive, please don't drive it. Message us so we can arrange help.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </Section>

                        <Flex gap={2} align="flex-start" color="gray.500" px={1}>
                            <Box mt={0.5}>
                                <ChatBubbleBottomCenterTextIcon width={16} />
                            </Box>
                            <Text fontSize="xs">
                                A mechanic will inspect your vehicle first to confirm the problem before any work or charges.
                            </Text>
                        </Flex>
                    </Stack>
                </ModalBody>

                <ModalFooter px={6} py={4} bg="white" borderTop="1px" borderColor="gray.200" gap={3}>
                    <Button variant="ghost" onClick={handleClose} isDisabled={submitting}>
                        Cancel
                    </Button>
                    <Button colorScheme="brand" onClick={handleSubmit} isLoading={submitting} loadingText="Submitting">
                        Submit request
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
