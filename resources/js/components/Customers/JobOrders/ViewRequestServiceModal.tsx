import {
    Badge,
    Box,
    Divider,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    Text,
    Button,
    Wrap,
    WrapItem,
    Flex,
    Progress,
} from "@chakra-ui/react";

import type {
    RequestService,
} from "../../../api/JobOrderManagement/requestServiceApi";
import PhotoGallery from "../../Admin/JobOrders/PhotoGallery";
import JobOrderTimeline from "../../Admin/JobOrders/JobOrderTimeline";
import { progressColor, resultInfo } from "../../Admin/JobOrders/jobOrderHelpers";
import ProgressStepper from "../../Shared/ServiceCards/ProgressStepper";
import type { JobOrder as FullJobOrder } from "../../../api/JobOrderManagement/jobOrderApi";
import { getRequestSteps, progressCaption, requestProgress } from "./requestProgress";

const peso = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value || 0);

const labelOf = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const STARTED_LABELS: Record<string, string> = {
    today: "Today",
    few_days: "A few days ago",
    week: "About a week ago",
    month: "A month or more",
};

interface ViewRequestServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestService: RequestService | null;
}

export default function ViewRequestServiceModal({
    isOpen,
    onClose,
    requestService,
}: ViewRequestServiceModalProps) {

    if (!requestService) {
        return null;
    }

    // VEHICLE

    const vehicle =
        requestService
            .vehicle_release
            ?.sale
            ?.reservation
            ?.vehicle;

    const vehicleName = [
        vehicle?.brand?.brand,
        vehicle?.model?.model,
        vehicle?.variant?.variant,
    ]
        .filter(Boolean)
        .join(" ") || "—";

    // STATUS

    const getStatusColor = (
        status: RequestService["status"]
    ) => {

        switch (status) {

            case "pending":
                return "yellow";

            case "assigned":
                return "blue";

            case "in_progress":
                return "purple";

            case "completed":
                return "green";

            case "cancelled":
                return "red";

            default:
                return "gray";
        }
    };

    const getStatusLabel = (
        status: RequestService["status"]
    ) => {

        switch (status) {

            case "pending":
                return "Pending";

            case "assigned":
                return "Assigned";

            case "in_progress":
                return "In Progress";

            case "completed":
                return "Completed";

            case "cancelled":
                return "Cancelled";

            default:
                return status;
        }
    };

    // IMAGE URL

    const jobOrder = requestService.job_order ?? null;
    const percent = requestProgress(requestService);
    const partsTotal = (jobOrder?.parts_used ?? []).reduce(
        (sum, used) => sum + Number(used.vehicle_part?.unit_price ?? 0) * used.quantity,
        0
    );

    const photoUrls = requestService.photo_urls?.length
        ? requestService.photo_urls
        : requestService.request_proof
            ? [`/storage/${requestService.request_proof}`]
            : [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="3xl"
            isCentered
            scrollBehavior="inside"
        >

            <ModalOverlay />

            <ModalContent>

                {/* HEADER */}

                <ModalHeader>
                    Service Request Details
                </ModalHeader>

                <ModalCloseButton />

                <ModalBody>

                    {/* REQUEST INFORMATION */}

                    <Text
                        fontSize="md"
                        fontWeight="700"
                        mb={3}
                    >
                        Request Information
                    </Text>

                    <SimpleGrid
                        columns={{
                            base: 1,
                            md: 2,
                        }}
                        spacing={4}
                    >

                        <Box>

                            <Text
                                fontSize="xs"
                                color="gray.500"
                            >
                                Request Number
                            </Text>

                            <Text
                                fontSize="sm"
                                fontWeight="600"
                            >
                                {
                                    requestService
                                        .service_request_number
                                }
                            </Text>

                        </Box>

                        <Box>

                            <Text
                                fontSize="xs"
                                color="gray.500"
                            >
                                Status
                            </Text>

                            <Badge
                                colorScheme={
                                    getStatusColor(
                                        requestService.status
                                    )
                                }
                                mt={1}
                            >
                                {
                                    getStatusLabel(
                                        requestService.status
                                    )
                                }
                            </Badge>

                        </Box>

                        <Box>

                            <Text
                                fontSize="xs"
                                color="gray.500"
                            >
                                Preferred Service Date
                            </Text>

                            <Text
                                fontSize="sm"
                                fontWeight="500"
                            >
                                {
                                    requestService
                                        .request_date_pref
                                        ? new Date(
                                            requestService
                                                .request_date_pref
                                        ).toLocaleDateString(
                                            "en-US",
                                            {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }
                                        )
                                        : "—"
                                }
                            </Text>

                        </Box>

                        <Box>

                            <Text
                                fontSize="xs"
                                color="gray.500"
                            >
                                Release Number
                            </Text>

                            <Text
                                fontSize="sm"
                                fontWeight="500"
                            >
                                {
                                    requestService
                                        .vehicle_release
                                        ?.release_number || "—"
                                }
                            </Text>

                        </Box>

                    </SimpleGrid>

                    <Divider my={5} />

                    {/* VEHICLE */}

                    <Text
                        fontSize="md"
                        fontWeight="700"
                        mb={3}
                    >
                        Vehicle
                    </Text>

                    <SimpleGrid
                        columns={{
                            base: 1,
                            md: 2,
                        }}
                        spacing={4}
                    >

                        <Box>

                            <Text
                                fontSize="xs"
                                color="gray.500"
                            >
                                Vehicle
                            </Text>

                            <Text
                                fontSize="sm"
                                fontWeight="600"
                            >
                                {vehicleName}
                            </Text>

                        </Box>

                        <Box>

                            <Text
                                fontSize="xs"
                                color="gray.500"
                            >
                                Stock Number
                            </Text>

                            <Text
                                fontSize="sm"
                            >
                                {vehicle?.stock_no || "—"}
                            </Text>

                        </Box>

                        <Box>

                            <Text
                                fontSize="xs"
                                color="gray.500"
                            >
                                Year Model
                            </Text>

                            <Text
                                fontSize="sm"
                            >
                                {vehicle?.year_model || "—"}
                            </Text>

                        </Box>

                        <Box>

                            <Text
                                fontSize="xs"
                                color="gray.500"
                            >
                                Color
                            </Text>

                            <Text
                                fontSize="sm"
                                textTransform="capitalize"
                            >
                                {vehicle?.color || "—"}
                            </Text>

                        </Box>

                    </SimpleGrid>

                    <Divider my={5} />

                    {/* SERVICE REQUEST */}

                    <Text
                        fontSize="md"
                        fontWeight="700"
                        mb={3}
                    >
                        Service Request
                    </Text>

                    <Box
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        bg="gray.50"
                    >

                        <Text
                            fontSize="xs"
                            color="gray.500"
                            mb={1}
                        >
                            Request Details
                        </Text>

                        <Text
                            fontSize="sm"
                            whiteSpace="pre-wrap"
                        >
                            {
                                requestService
                                    .request_detail
                            }
                        </Text>

                    </Box>

                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mt={4} fontSize="sm">
                        {[
                            ["Service type", requestService.service_type ? labelOf(requestService.service_type) : null],
                            ["Urgency", requestService.urgency ? labelOf(requestService.urgency) : null],
                            ["Problem started", requestService.problem_started ? STARTED_LABELS[requestService.problem_started] ?? requestService.problem_started : null],
                            ["Mileage", requestService.mileage != null ? `${requestService.mileage.toLocaleString()} km` : null],
                            ["Preferred time", requestService.preferred_time ? labelOf(requestService.preferred_time) : null],
                            ["Contact number", requestService.contact_number],
                        ]
                            .filter(([, value]) => value)
                            .map(([name, value]) => (
                                <Box key={name as string}>
                                    <Text fontSize="xs" color="gray.500">
                                        {name}
                                    </Text>
                                    <Text fontWeight="600">{value}</Text>
                                </Box>
                            ))}
                    </SimpleGrid>

                    {(requestService.symptoms ?? []).length > 0 && (
                        <Box mt={4}>
                            <Text fontSize="xs" color="gray.500" mb={1.5}>
                                Symptoms
                            </Text>
                            <Wrap spacing={1.5}>
                                {(requestService.symptoms ?? []).map((symptom) => (
                                    <WrapItem key={symptom}>
                                        <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={2.5} py={0.5}>
                                            {symptom}
                                        </Badge>
                                    </WrapItem>
                                ))}
                            </Wrap>
                        </Box>
                    )}

                    {photoUrls.length > 0 && (
                        <Box mt={5}>
                            <Text fontSize="sm" fontWeight="600" mb={3}>
                                Photos ({photoUrls.length})
                            </Text>
                            <PhotoGallery photos={photoUrls.map((url) => ({ url }))} columns={{ base: 3, md: 4 }} size="100px" />
                        </Box>
                    )}

                    <Box mt={6} p={4} bg="gray.50" borderRadius="xl" border="1px" borderColor="gray.100">
                        <Flex justify="space-between" align="baseline" mb={2}>
                            <Text fontSize="sm" fontWeight="700">
                                Service progress
                            </Text>
                            <Text fontSize="xl" fontWeight="800" color={`${progressColor(percent)}.600`}>
                                {requestService.status === "cancelled" ? "—" : `${percent}%`}
                            </Text>
                        </Flex>
                        <Progress
                            value={requestService.status === "cancelled" ? 100 : percent}
                            colorScheme={requestService.status === "cancelled" ? "red" : progressColor(percent)}
                            size="sm"
                            borderRadius="full"
                        />
                        <Text fontSize="xs" color="gray.600" mt={2} mb={4}>
                            {progressCaption(requestService)}
                        </Text>
                        <ProgressStepper steps={getRequestSteps(requestService)} />
                    </Box>

                    {jobOrder?.inspection && (
                        <Box mt={5} p={4} border="1px" borderColor="gray.200" borderRadius="xl">
                            <Flex justify="space-between" align="center" mb={2} gap={2} wrap="wrap">
                                <Text fontSize="sm" fontWeight="700">
                                    Inspection result
                                </Text>
                                <Badge colorScheme={resultInfo(jobOrder.inspection.result)?.color}>
                                    {resultInfo(jobOrder.inspection.result)?.label}
                                </Badge>
                            </Flex>
                            <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
                                {jobOrder.inspection.findings}
                            </Text>
                            {jobOrder.inspection.recommendation && (
                                <Text fontSize="sm" color="gray.600" mt={2}>
                                    <b>Recommendation:</b> {jobOrder.inspection.recommendation}
                                </Text>
                            )}
                            {(jobOrder.inspection.checklist ?? []).filter((entry) => ["issue", "urgent", "attention"].includes(entry.status)).length > 0 && (
                                <Wrap spacing={1.5} mt={3}>
                                    {(jobOrder.inspection.checklist ?? [])
                                        .filter((entry) => ["issue", "urgent", "attention"].includes(entry.status))
                                        .map((entry) => (
                                            <WrapItem key={entry.item}>
                                                <Badge colorScheme={entry.status === "attention" ? "yellow" : "red"} variant="subtle" borderRadius="full" px={2.5} title={entry.note ?? undefined}>
                                                    {entry.item}
                                                </Badge>
                                            </WrapItem>
                                        ))}
                                </Wrap>
                            )}
                            {(jobOrder.inspection.photo_list ?? []).length > 0 && (
                                <Box mt={3}>
                                    <PhotoGallery
                                        photos={jobOrder.inspection.photo_list.map((photo) => ({ url: photo.url, caption: photo.caption, tag: photo.item }))}
                                        columns={{ base: 3, md: 5 }}
                                        size="80px"
                                    />
                                </Box>
                            )}
                        </Box>
                    )}

                    {jobOrder && (
                        <Box mt={5} p={4} border="1px" borderColor="gray.200" borderRadius="xl">
                            <Text fontSize="sm" fontWeight="700" mb={4}>
                                Timeline
                            </Text>
                            <JobOrderTimeline jobOrder={jobOrder as unknown as FullJobOrder} />
                        </Box>
                    )}

                    {jobOrder && (partsTotal > 0 || Number(jobOrder.labor_cost) > 0) && (
                        <Box mt={5} p={4} border="1px" borderColor="gray.200" borderRadius="xl">
                            <Text fontSize="sm" fontWeight="700" mb={3}>
                                Charges
                            </Text>
                            {(jobOrder.parts_used ?? []).map((used) => (
                                <Flex key={used.id} justify="space-between" fontSize="sm" py={1}>
                                    <Text color="gray.600">
                                        {used.vehicle_part?.part_name ?? "Part"} × {used.quantity}
                                    </Text>
                                    <Text>{peso(Number(used.vehicle_part?.unit_price ?? 0) * used.quantity)}</Text>
                                </Flex>
                            ))}
                            <Flex justify="space-between" fontSize="sm" py={1}>
                                <Text color="gray.600">Labor</Text>
                                <Text>{peso(Number(jobOrder.labor_cost) || 0)}</Text>
                            </Flex>
                            <Divider my={2} />
                            <Flex justify="space-between" fontWeight="800">
                                <Text>Total</Text>
                                <Text>{peso(partsTotal + (Number(jobOrder.labor_cost) || 0))}</Text>
                            </Flex>
                        </Box>
                    )}

                </ModalBody>

                {/* FOOTER */}

                <ModalFooter>

                    <Button
                        onClick={onClose}
                    >
                        Close
                    </Button>

                </ModalFooter>

            </ModalContent>

        </Modal>
    );
}