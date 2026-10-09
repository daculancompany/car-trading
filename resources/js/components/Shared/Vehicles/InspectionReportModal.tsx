import {
    Badge,
    Box,
    Flex,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    Spinner,
    Text,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

import api from "../../../api/api";
import type { DamageMark, InspectionBrakes, InspectionTires } from "../../../api/JobOrderManagement/jobOrderApi";
import CarDiagram from "../../Admin/JobOrders/CarDiagram";
import PhotoGallery from "../../Admin/JobOrders/PhotoGallery";
import StatusDots from "../../Admin/JobOrders/StatusDots";
import { INSPECTION_SECTIONS, RATING_META, WHEELS, normalizeRating } from "../../Admin/JobOrders/inspectionTemplate";
import { inspectionColor } from "./loan";

interface Report {
    badge: { score: number | null; good: number; attention: number; urgent: number; damages: number };
    inspected_at: string;
    odometer: number | null;
    checklist: { section: string | null; item: string; status: string | null; note: string | null }[];
    tires: InspectionTires | null;
    brakes: InspectionBrakes | null;
    damage_marks: DamageMark[];
    photo_list: { url: string; caption?: string | null; item?: string | null }[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    vehicleId: number;
    title: string;
}

export default function InspectionReportModal({ isOpen, onClose, vehicleId, title }: Props) {
    const [report, setReport] = useState<Report | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!isOpen || report) return;
        api.get<{ data: Report }>(`/vehicles/${vehicleId}/inspection-report`)
            .then((response) => setReport(response.data.data))
            .catch(() => setFailed(true));
    }, [isOpen, vehicleId, report]);

    const score = report?.badge.score ?? null;
    const sections = INSPECTION_SECTIONS.map((section) => ({
        title: section.title,
        entries: (report?.checklist ?? []).filter((entry) => entry.section === section.title || section.items.includes(entry.item)),
    })).filter((section) => section.entries.length > 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent borderRadius="xl" mx={3}>
                <ModalHeader>
                    <Text fontSize="lg" fontWeight="800">
                        Inspection report
                    </Text>
                    <Text fontSize="sm" color="gray.500" fontWeight="500">
                        {title}
                    </Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    {failed ? (
                        <Text color="gray.500">This vehicle has no inspection report yet.</Text>
                    ) : !report ? (
                        <Flex justify="center" py={12}>
                            <Spinner color="brand.500" />
                        </Flex>
                    ) : (
                        <Box display="grid" gap={5}>
                            <Flex gap={4} align="center" wrap="wrap" bg="gray.50" borderRadius="xl" p={4}>
                                <Flex boxSize="84px" borderRadius="full" border="6px solid" borderColor={`${inspectionColor(score)}.400`} align="center" justify="center" bg="white" flexShrink={0}>
                                    <Text fontSize="2xl" fontWeight="800">
                                        {score ?? "—"}
                                        {score != null && (
                                            <Text as="span" fontSize="sm">
                                                %
                                            </Text>
                                        )}
                                    </Text>
                                </Flex>
                                <Box flex="1" minW="200px">
                                    <Text fontWeight="800" fontSize="lg">
                                        {report.badge.good} of {report.badge.good + report.badge.attention + report.badge.urgent} points passed
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Inspected {new Date(report.inspected_at).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
                                        {report.odometer != null && ` · ${report.odometer.toLocaleString()} km`}
                                    </Text>
                                    <HStack spacing={2} mt={2} wrap="wrap">
                                        <Badge colorScheme="green">{report.badge.good} OK</Badge>
                                        <Badge colorScheme="yellow">{report.badge.attention} attention</Badge>
                                        <Badge colorScheme="red">{report.badge.urgent} needs repair</Badge>
                                        <Badge colorScheme="purple">{report.badge.damages} body marks</Badge>
                                    </HStack>
                                </Box>
                            </Flex>

                            <Box>
                                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mb={2}>
                                    Body condition
                                </Text>
                                <CarDiagram marks={report.damage_marks} />
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mb={2}>
                                    Checklist
                                </Text>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                    {sections.map((section) => {
                                        const flagged = section.entries.filter((entry) => ["attention", "urgent"].includes(entry.status ?? ""));
                                        return (
                                            <Box key={section.title} border="1px solid" borderColor="gray.200" borderRadius="lg" overflow="hidden">
                                                <Flex bg="gray.50" px={3} py={2} justify="space-between">
                                                    <Text fontSize="sm" fontWeight="800">
                                                        {section.title}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {section.entries.filter((entry) => entry.status === "good").length}/{section.entries.length} OK
                                                    </Text>
                                                </Flex>
                                                {flagged.length === 0 ? (
                                                    <HStack px={3} py={2} color="green.600">
                                                        <CheckCircleIcon width={14} />
                                                        <Text fontSize="xs" fontWeight="600">
                                                            All checked items OK
                                                        </Text>
                                                    </HStack>
                                                ) : (
                                                    flagged.map((entry) => (
                                                        <Flex key={entry.item} px={3} py={2} borderTop="1px solid" borderColor="gray.100" gap={3}>
                                                            <Box flex="1">
                                                                <Text fontSize="sm" fontWeight="600">
                                                                    {entry.item}
                                                                </Text>
                                                                {entry.note && (
                                                                    <Text fontSize="xs" color="gray.600">
                                                                        {entry.note}
                                                                    </Text>
                                                                )}
                                                            </Box>
                                                            <StatusDots value={normalizeRating(entry.status as never)} size={12} allowNa={false} label={entry.item} />
                                                        </Flex>
                                                    ))
                                                )}
                                            </Box>
                                        );
                                    })}
                                </SimpleGrid>
                            </Box>

                            {(report.tires?.wheels || report.brakes) && (
                                <Box>
                                    <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mb={2}>
                                        Tires & brakes
                                    </Text>
                                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2}>
                                        {WHEELS.map((wheel) => {
                                            const tire = report.tires?.wheels?.[wheel.key];
                                            const brake = report.brakes?.[wheel.key];
                                            const tireRating = normalizeRating(tire?.status);
                                            const brakeRating = normalizeRating(brake?.status);
                                            return (
                                                <Box key={wheel.key} border="1px solid" borderColor="gray.200" borderRadius="lg" p={3}>
                                                    <Text fontSize="sm" fontWeight="700" mb={1}>
                                                        {wheel.label}
                                                    </Text>
                                                    <Text fontSize="xs" color={tireRating ? RATING_META[tireRating].hex : "gray.500"} fontWeight="600">
                                                        Tread {tire?.tread_mm != null ? `${tire.tread_mm} mm` : "—"}
                                                    </Text>
                                                    <Text fontSize="xs" color={brakeRating ? RATING_META[brakeRating].hex : "gray.500"} fontWeight="600">
                                                        Brake pad {brake?.pad_mm != null ? `${brake.pad_mm} mm` : "—"}
                                                    </Text>
                                                </Box>
                                            );
                                        })}
                                    </SimpleGrid>
                                </Box>
                            )}

                            {report.photo_list.length > 0 && (
                                <Box>
                                    <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mb={2}>
                                        Photos
                                    </Text>
                                    <PhotoGallery photos={report.photo_list.map((photo) => ({ url: photo.url, caption: photo.caption ?? null, tag: photo.item ?? null }))} />
                                </Box>
                            )}

                            <Text fontSize="xs" color="gray.500">
                                Inspected by CDO Car Trading mechanics. Ask us to see the vehicle in person before you reserve.
                            </Text>
                        </Box>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
