import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Badge,
    Box,
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormLabel,
    Grid,
    HStack,
    IconButton,
    Image,
    Input,
    InputGroup,
    InputLeftAddon,
    NumberInput,
    NumberInputField,
    Select,
    SimpleGrid,
    Text,
    Textarea,
    useToast,
} from "@chakra-ui/react";
import {
    CameraIcon,
    CheckIcon,
    ClipboardDocumentCheckIcon,
    LifebuoyIcon,
    SparklesIcon,
    TruckIcon,
    WrenchScrewdriverIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useRef, useState, type ReactNode } from "react";

import {
    saveInspection,
    type InspectionRating,
    type InspectionResult,
    type JobOrder,
    type WheelKey,
} from "../../../api/JobOrderManagement/jobOrderApi";
import CarDiagram from "./CarDiagram";
import OdometerInput from "./OdometerInput";
import { FUEL_OPTIONS, INSPECTION_RESULTS } from "./jobOrderHelpers";
import {
    INSPECTION_SECTIONS,
    PRE_CHECKS,
    RATING_META,
    RECOMMENDED_SERVICES,
    WHEELS,
    buildFormState,
    countRatings,
    damageLabel,
    ratingFromMm,
    type InspectionFormState,
} from "./inspectionTemplate";
import MultiPhotoInput, { type MultiPhotoInputHandle, type PendingPhoto } from "./MultiPhotoInput";
import StatusDots from "./StatusDots";

interface Props {
    jobOrder: JobOrder;
    onCancel: () => void;
    onSaved: () => void;
}

const SECTION_HEX: Record<string, string> = {
    blue: "#2B6CB0",
    orange: "#C05621",
    purple: "#6B46C1",
    gray: "#4A5568",
    teal: "#2C7A7B",
    green: "#2F855A",
};

const Block = ({ icon, title, subtitle, color = "#1A202C", right, children }: { icon: ReactNode; title: string; subtitle?: string; color?: string; right?: ReactNode; children: ReactNode }) => (
    <Box border="1px solid" borderColor="gray.200" borderRadius="xl" overflow="hidden" bg="white">
        <Flex bg={color} color="white" px={4} py={3} align="center" gap={3}>
            <Flex boxSize="34px" borderRadius="lg" bg="whiteAlpha.200" color="white" align="center" justify="center" flexShrink={0}>
                {icon}
            </Flex>
            <Box flex="1" minW={0}>
                <Text fontSize="sm" fontWeight="800" letterSpacing="0.04em" textTransform="uppercase" color="white" lineHeight="1.3">
                    {title}
                </Text>
                {subtitle && (
                    <Text fontSize="xs" color="whiteAlpha.900" fontWeight="500" mt={0.5}>
                        {subtitle}
                    </Text>
                )}
            </Box>
            {right}
        </Flex>
        <Box p={4}>{children}</Box>
    </Box>
);

const numberValue = (value: number) => (Number.isNaN(value) ? null : value);

export default function InspectionForm({ jobOrder, onCancel, onSaved }: Props) {
    const toast = useToast();
    const inspection = jobOrder.inspection ?? null;
    const [form, setForm] = useState<InspectionFormState>(() => buildFormState(inspection, jobOrder.fuel_level));
    const [result, setResult] = useState<InspectionResult | "">(inspection?.result ?? "");
    const [findings, setFindings] = useState(inspection?.findings ?? "");
    const [recommendation, setRecommendation] = useState(inspection?.recommendation ?? "");
    const [odometer, setOdometer] = useState<number | null>(inspection?.odometer ?? jobOrder.odometer_in ?? null);
    const [keepPhotos, setKeepPhotos] = useState<string[]>(inspection?.photo_list.map((photo) => photo.path) ?? []);
    const [newPhotos, setNewPhotos] = useState<PendingPhoto[]>([]);
    const [saving, setSaving] = useState(false);
    const photoInput = useRef<MultiPhotoInputHandle>(null);

    const counts = useMemo(() => countRatings(form), [form]);
    const flagged = form.items.filter((entry) => entry.status === "attention" || entry.status === "urgent");
    const photoTags = [...flagged.map((entry) => entry.item), ...form.marks.map((mark) => damageLabel(mark))];
    const existingPhotos = (inspection?.photo_list ?? []).filter((photo) => keepPhotos.includes(photo.path));
    const photoCounts = [...existingPhotos.map((photo) => photo.item), ...newPhotos.map((photo) => photo.item)].reduce<Record<string, number>>((acc, item) => {
        if (item) acc[item] = (acc[item] ?? 0) + 1;
        return acc;
    }, {});

    const patch = (value: Partial<InspectionFormState>) => setForm((current) => ({ ...current, ...value }));

    const setItem = (item: string, value: Partial<InspectionFormState["items"][number]>) =>
        setForm((current) => ({ ...current, items: current.items.map((entry) => (entry.item === item ? { ...entry, ...value } : entry)) }));

    const markSectionGood = (title: string) =>
        setForm((current) => ({
            ...current,
            items: current.items.map((entry) => (entry.section === title && !entry.status ? { ...entry, status: "good" } : entry)),
        }));

    const setWheel = (wheel: WheelKey, value: Partial<InspectionFormState["tires"]["wheels"][WheelKey]>) =>
        setForm((current) => ({ ...current, tires: { ...current.tires, wheels: { ...current.tires.wheels, [wheel]: { ...current.tires.wheels[wheel], ...value } } } }));

    const setBrake = (wheel: WheelKey, value: Partial<InspectionFormState["brakes"][WheelKey]>) =>
        setForm((current) => ({ ...current, brakes: { ...current.brakes, [wheel]: { ...current.brakes[wheel], ...value } } }));

    const toggleService = (key: string) =>
        patch({ services: form.services.includes(key) ? form.services.filter((service) => service !== key) : [...form.services, key] });

    const handleSave = async () => {
        if (!result) {
            toast({ title: "Choose the inspection result.", status: "warning", duration: 3000 });
            return;
        }
        if (!findings.trim()) {
            toast({ title: "Describe what you found.", status: "warning", duration: 3000 });
            return;
        }
        if (result !== "not_found" && counts.attention + counts.urgent + counts.damages === 0) {
            toast({ title: "Mark at least one item yellow or red, or a body damage, for this result.", status: "warning", duration: 3500 });
            return;
        }

        try {
            setSaving(true);
            await saveInspection(jobOrder.id, {
                result,
                findings: findings.trim(),
                recommendation: recommendation.trim() || undefined,
                odometer,
                checklist: form.items
                    .filter((entry) => entry.status)
                    .map((entry) => ({ section: entry.section, item: entry.item, status: entry.status as InspectionRating, note: entry.note.trim() || null })),
                keepPhotos,
                newPhotos: newPhotos.map((photo) => ({ file: photo.file, item: photo.item, caption: photo.caption.trim() })),
                fuel_level: form.fuelLevel || null,
                pre_checks: form.preChecks,
                tires: form.tires,
                brakes: form.brakes,
                damage_marks: form.marks.map((mark) => ({ ...mark, note: mark.note?.trim() || null })),
                recommended_services: form.services,
                next_service_date: form.nextServiceDate || null,
                service_required: form.serviceRequired.trim() || null,
                estimated_cost: form.estimatedCost,
                notes: form.notes.trim() || null,
            });
            toast({ title: "Inspection saved.", status: "success", duration: 2500 });
            onSaved();
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast({ title: message ?? "Could not save the inspection.", status: "error", duration: 4000 });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Flex
                position="sticky"
                top={0}
                zIndex={3}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="xl"
                px={4}
                py={2.5}
                mb={4}
                align="center"
                gap={3}
                wrap="wrap"
                boxShadow="sm"
            >
                <HStack spacing={3} flex="1" wrap="wrap">
                    {(["good", "attention", "urgent"] as const).map((rating) => (
                        <HStack key={rating} spacing={1.5}>
                            <Box boxSize="12px" borderRadius="full" bg={RATING_META[rating].hex} />
                            <Text fontSize="sm" fontWeight="800">
                                {counts[rating]}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                {RATING_META[rating].short}
                            </Text>
                        </HStack>
                    ))}
                    <Badge colorScheme="purple" variant="subtle">
                        {counts.damages} damage
                    </Badge>
                    {counts.unchecked > 0 && (
                        <Badge colorScheme="gray" variant="outline">
                            {counts.unchecked} not checked
                        </Badge>
                    )}
                </HStack>
                <Button size="sm" variant="ghost" onClick={onCancel} isDisabled={saving}>
                    Cancel
                </Button>
                <Button size="sm" colorScheme="brand" leftIcon={<CheckIcon width={16} />} onClick={handleSave} isLoading={saving} loadingText="Saving">
                    Save inspection
                </Button>
            </Flex>

            <Box display="grid" gap={4}>
                <Block icon={<ClipboardDocumentCheckIcon width={20} />} title="Check-in" subtitle="Vehicle condition on arrival" color="#2D3748">
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <FormControl>
                            <FormLabel fontSize="xs" fontWeight="700" color="gray.600">
                                Odometer
                            </FormLabel>
<OdometerInput size="sm" value={odometer} onChange={setOdometer} />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="xs" fontWeight="700" color="gray.600">
                                Fuel level
                            </FormLabel>
                            <Select size="sm" placeholder="Select" value={form.fuelLevel} onChange={(event) => patch({ fuelLevel: event.target.value })}>
                                {FUEL_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                        <Box>
                            <Text fontSize="xs" fontWeight="700" color="gray.600" mb={2}>
                                Pre-checks
                            </Text>
                            {PRE_CHECKS.map((check) => (
                                <Checkbox
                                    key={check.key}
                                    display="flex"
                                    size="sm"
                                    mb={1}
                                    isChecked={form.preChecks[check.key]}
                                    onChange={(event) => patch({ preChecks: { ...form.preChecks, [check.key]: event.target.checked } })}
                                >
                                    {check.label}
                                </Checkbox>
                            ))}
                        </Box>
                    </SimpleGrid>
                    <HStack spacing={4} mt={4} pt={3} borderTop="1px dashed" borderColor="gray.200" wrap="wrap">
                        {(["good", "attention", "urgent"] as const).map((rating) => (
                            <HStack key={rating} spacing={1.5}>
                                <Box boxSize="14px" borderRadius="full" bg={RATING_META[rating].hex} />
                                <Text fontSize="xs" color="gray.600">
                                    {RATING_META[rating].label}
                                </Text>
                            </HStack>
                        ))}
                    </HStack>
                </Block>

                <Block icon={<TruckIcon width={20} />} title="Body damage" subtitle="Mark scratches, dents and cracks on the car" color="#9B2C2C">
                    <CarDiagram
                        marks={form.marks}
                        onChange={(marks) => patch({ marks })}
                        onPhoto={(label) => photoInput.current?.pick(label)}
                        photoCounts={photoCounts}
                    />
                </Block>

                <Block icon={<WrenchScrewdriverIcon width={20} />} title="Courtesy inspection" subtitle="Rate every item: green OK, yellow attention, red immediate" color="#2B6CB0">
                    <Accordion allowMultiple defaultIndex={[0]}>
                        {INSPECTION_SECTIONS.map((section) => {
                            const items = form.items.filter((entry) => entry.section === section.title);
                            const done = items.filter((entry) => entry.status).length;
                            const yellow = items.filter((entry) => entry.status === "attention").length;
                            const red = items.filter((entry) => entry.status === "urgent").length;
                            const hex = SECTION_HEX[section.color] ?? SECTION_HEX.gray;

                            return (
                                <AccordionItem key={section.key} border="1px solid" borderColor="gray.200" borderRadius="lg" mb={2} overflow="hidden">
                                    <AccordionButton px={3} py={2.5} borderLeft="4px solid" borderLeftColor={hex} _expanded={{ bg: "gray.50" }}>
                                        <Text flex="1" textAlign="left" fontSize="sm" fontWeight="800" color="gray.800">
                                            {section.title}
                                        </Text>
                                        <HStack spacing={1.5} mr={2}>
                                            {yellow > 0 && <Badge colorScheme="yellow">{yellow}</Badge>}
                                            {red > 0 && <Badge colorScheme="red">{red}</Badge>}
                                            <Badge colorScheme={done === items.length ? "green" : "gray"} variant={done === items.length ? "solid" : "subtle"}>
                                                {done}/{items.length}
                                            </Badge>
                                        </HStack>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    <AccordionPanel px={0} py={0}>
                                        <Flex justify="flex-end" px={3} py={1.5} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
                                            <Button size="xs" variant="ghost" colorScheme="green" leftIcon={<CheckIcon width={13} />} onClick={() => markSectionGood(section.title)} isDisabled={done === items.length}>
                                                Mark the rest OK
                                            </Button>
                                        </Flex>
                                        {items.map((entry) => {
                                            const flaggedItem = entry.status === "attention" || entry.status === "urgent";
                                            return (
                                                <Box
                                                    key={entry.item}
                                                    px={3}
                                                    py={2}
                                                    borderTop="1px solid"
                                                    borderColor="gray.100"
                                                    bg={entry.status === "urgent" ? "red.50" : entry.status === "attention" ? "yellow.50" : "white"}
                                                >
                                                    <Flex align="center" gap={3}>
                                                        <Text flex="1" fontSize="sm" color="gray.800" fontWeight={flaggedItem ? "700" : "500"}>
                                                            {entry.item}
                                                        </Text>
                                                        {flaggedItem && (
                                                            <IconButton
                                                                aria-label={`Add photo for ${entry.item}`}
                                                                size="xs"
                                                                variant="ghost"
                                                                icon={<CameraIcon width={16} />}
                                                                onClick={() => photoInput.current?.pick(entry.item)}
                                                            />
                                                        )}
                                                        {(photoCounts[entry.item] ?? 0) > 0 && (
                                                            <Badge fontSize="2xs" variant="subtle">
                                                                {photoCounts[entry.item]} photo
                                                            </Badge>
                                                        )}
                                                        <StatusDots value={entry.status} onChange={(status) => setItem(entry.item, { status })} label={entry.item} />
                                                    </Flex>
                                                    {flaggedItem && (
                                                        <Input
                                                            mt={2}
                                                            size="sm"
                                                            bg="white"
                                                            placeholder={`What is wrong with the ${entry.item.toLowerCase()}?`}
                                                            value={entry.note}
                                                            onChange={(event) => setItem(entry.item, { note: event.target.value })}
                                                        />
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </AccordionPanel>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </Block>

                <Block
                    icon={<LifebuoyIcon width={20} />}
                    title="Tires & brakes"
                    subtitle="Tread & pad: 7 mm+ green · 3–6 mm yellow · 2 mm or less red"
                    color="#1A202C"
                >
                    <Flex gap={4} mb={4} wrap="wrap" align="flex-end">
                        <FormControl maxW="220px">
                            <FormLabel fontSize="xs" fontWeight="700" color="gray.600">
                                Tire size
                            </FormLabel>
                            <Input size="sm" placeholder="e.g. 185/65 R15" value={form.tires.size ?? ""} onChange={(event) => patch({ tires: { ...form.tires, size: event.target.value } })} />
                        </FormControl>
                        <Checkbox size="sm" mb={1.5} isChecked={form.tires.spare_ok} onChange={(event) => patch({ tires: { ...form.tires, spare_ok: event.target.checked } })}>
                            Spare tire checked
                        </Checkbox>
                    </Flex>
                    <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={3}>
                        {WHEELS.map((wheel) => {
                            const tire = form.tires.wheels[wheel.key];
                            const brake = form.brakes[wheel.key];
                            return (
                                <Box key={wheel.key} border="1px solid" borderColor="gray.200" borderRadius="lg" p={3}>
                                    <HStack justify="space-between" mb={2}>
                                        <Text fontSize="sm" fontWeight="800">
                                            {wheel.label}
                                        </Text>
                                        <Badge variant="outline">{wheel.key.toUpperCase()}</Badge>
                                    </HStack>
                                    <Grid templateColumns="1fr 1fr" gap={2}>
                                        <FormControl>
                                            <FormLabel fontSize="2xs" color="gray.500" mb={1}>
                                                PSI
                                            </FormLabel>
                                            <NumberInput size="sm" min={0} max={150} value={tire.psi ?? ""} onChange={(_, value) => setWheel(wheel.key, { psi: numberValue(value) })}>
                                                <NumberInputField />
                                            </NumberInput>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="2xs" color="gray.500" mb={1}>
                                                Tread (mm)
                                            </FormLabel>
                                            <NumberInput
                                                size="sm"
                                                min={0}
                                                max={30}
                                                step={0.5}
                                                value={tire.tread_mm ?? ""}
                                                onChange={(_, value) => setWheel(wheel.key, { tread_mm: numberValue(value), status: ratingFromMm(numberValue(value)) ?? tire.status })}
                                            >
                                                <NumberInputField />
                                            </NumberInput>
                                        </FormControl>
                                    </Grid>
                                    <HStack justify="space-between" mt={2}>
                                        <Text fontSize="xs" color="gray.500">
                                            Tire
                                        </Text>
                                        <StatusDots value={tire.status} onChange={(status) => setWheel(wheel.key, { status })} allowNa={false} size={18} label={`${wheel.label} tire`} />
                                    </HStack>
                                    <Box borderTop="1px dashed" borderColor="gray.200" my={2.5} />
                                    <FormControl>
                                        <FormLabel fontSize="2xs" color="gray.500" mb={1}>
                                            Brake pad (mm)
                                        </FormLabel>
                                        <NumberInput
                                            size="sm"
                                            min={0}
                                            max={30}
                                            step={0.5}
                                            value={brake.pad_mm ?? ""}
                                            onChange={(_, value) => setBrake(wheel.key, { pad_mm: numberValue(value), status: ratingFromMm(numberValue(value)) ?? brake.status })}
                                        >
                                            <NumberInputField />
                                        </NumberInput>
                                    </FormControl>
                                    <HStack justify="space-between" mt={2}>
                                        <Text fontSize="xs" color="gray.500">
                                            Brake
                                        </Text>
                                        <StatusDots value={brake.status} onChange={(status) => setBrake(wheel.key, { status })} allowNa={false} size={18} label={`${wheel.label} brake`} />
                                    </HStack>
                                </Box>
                            );
                        })}
                    </SimpleGrid>
                </Block>

                <Block icon={<SparklesIcon width={20} />} title="Recommended services" subtitle="Maintenance the customer should do next" color="#B7791F">
                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={2}>
                        {RECOMMENDED_SERVICES.map((service) => (
                            <Checkbox
                                key={service.key}
                                size="sm"
                                colorScheme="yellow"
                                isChecked={form.services.includes(service.key)}
                                onChange={() => toggleService(service.key)}
                                p={2}
                                borderRadius="md"
                                border="1px solid"
                                borderColor={form.services.includes(service.key) ? "yellow.300" : "gray.100"}
                                bg={form.services.includes(service.key) ? "yellow.50" : "white"}
                            >
                                {service.label}
                            </Checkbox>
                        ))}
                    </SimpleGrid>
                </Block>

                <Block icon={<ClipboardDocumentCheckIcon width={20} />} title="Result & next service" color="#2F855A">
                    <FormControl isRequired mb={4}>
                        <FormLabel fontSize="sm">Did you find the customer's reported problem?</FormLabel>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2}>
                            {INSPECTION_RESULTS.map((option) => (
                                <Box
                                    key={option.value}
                                    as="button"
                                    textAlign="left"
                                    p={3}
                                    borderRadius="lg"
                                    border="2px"
                                    borderColor={result === option.value ? `${option.color}.400` : "gray.200"}
                                    bg={result === option.value ? `${option.color}.50` : "white"}
                                    onClick={() => setResult(option.value)}
                                >
                                    <Text fontWeight="700" fontSize="sm">
                                        {option.label}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                        {option.hint}
                                    </Text>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                        <FormControl isRequired>
                            <FormLabel fontSize="sm">Findings</FormLabel>
                            <Textarea rows={4} placeholder="What did you check and what did you find?" value={findings} onChange={(event) => setFindings(event.target.value)} />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Recommendation</FormLabel>
                            <Textarea rows={4} placeholder="Repairs or parts you recommend" value={recommendation} onChange={(event) => setRecommendation(event.target.value)} />
                        </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
                        <FormControl>
                            <FormLabel fontSize="sm">Next service date</FormLabel>
                            <Input type="date" size="sm" value={form.nextServiceDate} onChange={(event) => patch({ nextServiceDate: event.target.value })} />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Service required</FormLabel>
                            <Input size="sm" placeholder="e.g. Brake pad replacement" value={form.serviceRequired} onChange={(event) => patch({ serviceRequired: event.target.value })} />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Estimated cost</FormLabel>
                            <InputGroup size="sm">
                                <InputLeftAddon>₱</InputLeftAddon>
                                <NumberInput min={0} value={form.estimatedCost ?? ""} onChange={(_, value) => patch({ estimatedCost: numberValue(value) })} w="full">
                                    <NumberInputField borderLeftRadius={0} />
                                </NumberInput>
                            </InputGroup>
                        </FormControl>
                    </SimpleGrid>

                    <FormControl mb={4}>
                        <FormLabel fontSize="sm">Notes</FormLabel>
                        <Textarea rows={2} placeholder="Anything else the office or customer should know" value={form.notes} onChange={(event) => patch({ notes: event.target.value })} />
                    </FormControl>

                    <FormControl>
                        <FormLabel fontSize="sm">Photos</FormLabel>
                        <Text fontSize="xs" color="gray.500" mb={2}>
                            Use the camera buttons on yellow/red items and damage markers so each photo is tagged to what was found.
                        </Text>
                        {existingPhotos.length > 0 && (
                            <SimpleGrid columns={{ base: 3, md: 6 }} spacing={2} mb={3}>
                                {existingPhotos.map((photo) => (
                                    <Box key={photo.path} position="relative" h="80px" borderRadius="md" overflow="hidden">
                                        <Image src={photo.url} alt={photo.caption ?? "Photo"} w="100%" h="100%" objectFit="cover" />
                                        <IconButton
                                            aria-label="Remove photo"
                                            size="xs"
                                            position="absolute"
                                            top={1}
                                            right={1}
                                            colorScheme="blackAlpha"
                                            icon={<XMarkIcon width={12} />}
                                            onClick={() => setKeepPhotos((current) => current.filter((path) => path !== photo.path))}
                                        />
                                        {photo.item && (
                                            <Text position="absolute" bottom={0} left={0} right={0} fontSize="2xs" bg="blackAlpha.700" color="white" px={1} noOfLines={1}>
                                                {photo.item}
                                            </Text>
                                        )}
                                    </Box>
                                ))}
                            </SimpleGrid>
                        )}
                        <MultiPhotoInput ref={photoInput} photos={newPhotos} onChange={setNewPhotos} itemOptions={photoTags} max={20 - existingPhotos.length} label="Add photos" />
                    </FormControl>
                </Block>
            </Box>
        </Box>
    );
}
