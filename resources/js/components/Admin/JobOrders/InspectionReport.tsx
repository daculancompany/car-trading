import { Badge, Box, Button, Flex, HStack, SimpleGrid, Table, Tbody, Td, Text, Th, Thead, Tr, useToast } from "@chakra-ui/react";
import { ArrowDownTrayIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { downloadInspectionPdf, type JobOrder, type JobOrderInspection } from "../../../api/JobOrderManagement/jobOrderApi";
import CarDiagram from "./CarDiagram";
import { fuelInfo } from "./jobOrderHelpers";
import {
    INSPECTION_SECTIONS,
    PRE_CHECKS,
    RATING_META,
    WHEELS,
    buildFormItems,
    normalizeRating,
    serviceLabel,
} from "./inspectionTemplate";
import PhotoGallery from "./PhotoGallery";
import StatusDots from "./StatusDots";

interface Props {
    jobOrder: JobOrder;
    inspection: JobOrderInspection;
}

const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";

const peso = (value?: number | string | null) =>
    value == null || value === "" ? "—" : new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(value));

const Label = ({ children }: { children: string }) => (
    <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.04em" mb={1.5}>
        {children}
    </Text>
);

export default function InspectionReport({ jobOrder, inspection }: Props) {
    const toast = useToast();
    const [showAll, setShowAll] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const items = buildFormItems(inspection.checklist).filter((entry) => entry.status);
    const marks = inspection.damage_marks ?? [];
    const summary = inspection.summary ?? {
        good: items.filter((entry) => entry.status === "good").length,
        attention: items.filter((entry) => entry.status === "attention").length,
        urgent: items.filter((entry) => entry.status === "urgent").length,
        na: 0,
        damages: marks.length,
    };
    const hasTires = WHEELS.some((wheel) => inspection.tires?.wheels?.[wheel.key] || inspection.brakes?.[wheel.key]);
    const sections = [...INSPECTION_SECTIONS.map((section) => section.title), "General"]
        .map((title) => ({ title, entries: items.filter((entry) => entry.section === title) }))
        .filter((section) => section.entries.length > 0);
    const services = inspection.recommended_services ?? [];

    const handleDownload = async () => {
        try {
            setDownloading(true);
            await downloadInspectionPdf(jobOrder.id, `inspection-${jobOrder.job_order_no}.pdf`);
        } catch {
            toast({ title: "Could not download the inspection PDF.", status: "error", duration: 3000 });
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Box display="grid" gap={4}>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2}>
                {([
                    { key: "good", label: "Checked OK", value: summary.good, hex: RATING_META.good.hex },
                    { key: "attention", label: "Needs attention", value: summary.attention, hex: RATING_META.attention.hex },
                    { key: "urgent", label: "Immediate", value: summary.urgent, hex: RATING_META.urgent.hex },
                    { key: "damage", label: "Body damage", value: summary.damages, hex: "#805AD5" },
                ]).map((tile) => (
                    <Flex key={tile.key} align="center" gap={3} p={3} borderRadius="lg" border="1px solid" borderColor="gray.200" borderLeft="4px solid" borderLeftColor={tile.hex} bg="white">
                        <Text fontSize="2xl" fontWeight="800" color={tile.hex} lineHeight="1">
                            {tile.value}
                        </Text>
                        <Text fontSize="xs" color="gray.600" fontWeight="600">
                            {tile.label}
                        </Text>
                    </Flex>
                ))}
            </SimpleGrid>

            <Flex gap={2} wrap="wrap" align="center">
                {inspection.odometer != null && <Badge variant="outline">{inspection.odometer.toLocaleString()} km</Badge>}
                {inspection.fuel_level && <Badge variant="outline">Fuel {fuelInfo(inspection.fuel_level)?.label ?? inspection.fuel_level}</Badge>}
                {PRE_CHECKS.map((check) => (
                    <Badge key={check.key} colorScheme={inspection.pre_checks?.[check.key] ? "green" : "gray"} variant="subtle" display="flex" alignItems="center" gap={1}>
                        {inspection.pre_checks?.[check.key] && <CheckCircleIcon width={12} />}
                        {check.label}
                    </Badge>
                ))}
                <Box flex="1" />
                <Button size="sm" variant="outline" colorScheme="brand" leftIcon={<ArrowDownTrayIcon width={16} />} onClick={handleDownload} isLoading={downloading}>
                    Download PDF
                </Button>
            </Flex>

            <Box>
                <Label>Body damage</Label>
                <CarDiagram marks={marks} />
            </Box>

            <Box>
                <Flex justify="space-between" align="center" mb={1.5}>
                    <Label>Courtesy inspection</Label>
                    <Button size="xs" variant="ghost" leftIcon={showAll ? <EyeSlashIcon width={14} /> : <EyeIcon width={14} />} onClick={() => setShowAll((value) => !value)}>
                        {showAll ? "Show issues only" : "Show all items"}
                    </Button>
                </Flex>
                {sections.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">
                        No checklist recorded.
                    </Text>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        {sections.map((section) => {
                            const flagged = section.entries
                                .filter((entry) => entry.status === "urgent" || entry.status === "attention")
                                .sort((a, b) => (a.status === "urgent" ? -1 : 0) - (b.status === "urgent" ? -1 : 0));
                            const visible = showAll ? section.entries : flagged;
                            const okCount = section.entries.filter((entry) => entry.status === "good").length;

                            return (
                                <Box key={section.title} border="1px solid" borderColor="gray.200" borderRadius="lg" overflow="hidden">
                                    <Flex bg="gray.50" px={3} py={2} align="center" justify="space-between">
                                        <Text fontSize="sm" fontWeight="800">
                                            {section.title}
                                        </Text>
                                        <HStack spacing={1}>
                                            {(["good", "attention", "urgent"] as const).map((rating) => {
                                                const count = section.entries.filter((entry) => entry.status === rating).length;
                                                return count > 0 ? (
                                                    <Badge key={rating} colorScheme={RATING_META[rating].color} variant={rating === "good" ? "subtle" : "solid"}>
                                                        {count}
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </HStack>
                                    </Flex>
                                    {visible.map((entry) => (
                                        <Flex key={entry.item} px={3} py={2} borderTop="1px solid" borderColor="gray.100" gap={3} align="flex-start">
                                            <Box flex="1" minW={0}>
                                                <Text fontSize="sm" fontWeight={entry.status === "good" || entry.status === "na" ? "500" : "700"}>
                                                    {entry.item}
                                                </Text>
                                                {entry.note && (
                                                    <Text fontSize="xs" color="gray.600">
                                                        {entry.note}
                                                    </Text>
                                                )}
                                            </Box>
                                            <StatusDots value={entry.status} size={14} label={entry.item} allowNa={entry.status === "na"} />
                                        </Flex>
                                    ))}
                                    {!showAll && (
                                        <Flex px={3} py={2} borderTop={flagged.length ? "1px solid" : undefined} borderColor="gray.100" align="center" gap={1.5} color="green.600">
                                            <CheckCircleIcon width={14} />
                                            <Text fontSize="xs" fontWeight="600">
                                                {flagged.length === 0 ? "All items OK" : `${okCount} other item${okCount === 1 ? "" : "s"} OK`}
                                            </Text>
                                        </Flex>
                                    )}
                                </Box>
                            );
                        })}
                    </SimpleGrid>
                )}
            </Box>

            {hasTires && (
                <Box>
                    <Label>{`Tires & brakes${inspection.tires?.size ? ` · ${inspection.tires.size}` : ""}`}</Label>
                    <Box overflowX="auto" border="1px solid" borderColor="gray.200" borderRadius="lg">
                        <Table size="sm">
                            <Thead bg="gray.50">
                                <Tr>
                                    <Th>Wheel</Th>
                                    <Th isNumeric>PSI</Th>
                                    <Th isNumeric>Tread</Th>
                                    <Th>Tire</Th>
                                    <Th isNumeric>Brake pad</Th>
                                    <Th>Brake</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {WHEELS.map((wheel) => {
                                    const tire = inspection.tires?.wheels?.[wheel.key];
                                    const brake = inspection.brakes?.[wheel.key];
                                    return (
                                        <Tr key={wheel.key}>
                                            <Td fontWeight="700">{wheel.label}</Td>
                                            <Td isNumeric>{tire?.psi ?? "—"}</Td>
                                            <Td isNumeric>{tire?.tread_mm != null ? `${tire.tread_mm} mm` : "—"}</Td>
                                            <Td>
                                                <StatusDots value={normalizeRating(tire?.status)} size={14} allowNa={false} label={`${wheel.label} tire`} />
                                            </Td>
                                            <Td isNumeric>{brake?.pad_mm != null ? `${brake.pad_mm} mm` : "—"}</Td>
                                            <Td>
                                                <StatusDots value={normalizeRating(brake?.status)} size={14} allowNa={false} label={`${wheel.label} brake`} />
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </Tbody>
                        </Table>
                    </Box>
                    {inspection.tires?.spare_ok && (
                        <Text fontSize="xs" color="green.600" mt={1.5}>
                            ✓ Spare tire checked
                        </Text>
                    )}
                </Box>
            )}

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                    <Label>Findings</Label>
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                        {inspection.findings}
                    </Text>
                    {inspection.recommendation && (
                        <>
                            <Box mt={3} />
                            <Label>Recommendation</Label>
                            <Text fontSize="sm" whiteSpace="pre-wrap">
                                {inspection.recommendation}
                            </Text>
                        </>
                    )}
                    {inspection.notes && (
                        <>
                            <Box mt={3} />
                            <Label>Notes</Label>
                            <Text fontSize="sm" whiteSpace="pre-wrap">
                                {inspection.notes}
                            </Text>
                        </>
                    )}
                </Box>
                <Box bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="lg" p={3}>
                    <Label>Recommended services</Label>
                    {services.length === 0 ? (
                        <Text fontSize="sm" color="gray.500">
                            None recommended.
                        </Text>
                    ) : (
                        <Flex gap={1.5} wrap="wrap">
                            {services.map((service) => (
                                <Badge key={service} colorScheme="yellow" variant="solid" px={2} py={0.5} borderRadius="full" textTransform="none">
                                    {serviceLabel(service)}
                                </Badge>
                            ))}
                        </Flex>
                    )}
                    <SimpleGrid columns={3} spacing={2} mt={3} pt={3} borderTop="1px dashed" borderColor="yellow.300">
                        <Box>
                            <Text fontSize="2xs" color="gray.500">
                                Next service
                            </Text>
                            <Text fontSize="sm" fontWeight="700">
                                {formatDate(inspection.next_service_date)}
                            </Text>
                        </Box>
                        <Box>
                            <Text fontSize="2xs" color="gray.500">
                                Service required
                            </Text>
                            <Text fontSize="sm" fontWeight="700" noOfLines={2}>
                                {inspection.service_required || "—"}
                            </Text>
                        </Box>
                        <Box>
                            <Text fontSize="2xs" color="gray.500">
                                Estimate
                            </Text>
                            <Text fontSize="sm" fontWeight="700">
                                {peso(inspection.estimated_cost)}
                            </Text>
                        </Box>
                    </SimpleGrid>
                </Box>
            </SimpleGrid>

            {inspection.photo_list.length > 0 && (
                <Box>
                    <Label>{`Photos (${inspection.photo_list.length})`}</Label>
                    <PhotoGallery photos={inspection.photo_list.map((photo) => ({ url: photo.url, caption: photo.caption, tag: photo.item }))} />
                </Box>
            )}
        </Box>
    );
}
