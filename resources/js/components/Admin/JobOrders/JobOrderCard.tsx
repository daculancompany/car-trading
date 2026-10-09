import { Badge, Box, Button, Flex, HStack, Icon, Progress, SimpleGrid, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import {
    CalendarDaysIcon,
    ChatBubbleLeftEllipsisIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    HomeModernIcon,
    UserIcon,
} from "@heroicons/react/24/outline";

import type { JobOrder } from "../../../api/JobOrderManagement/jobOrderApi";
import CustomerAvatar from "../../Shared/Customers/CustomerAvatar";
import DetailsLink from "../../Shared/Details/DetailsLink";
import PhotoStrip from "../../Shared/ServiceCards/PhotoStrip";
import VehicleThumb from "../../Shared/ServiceCards/VehicleThumb";
import ProgressStepper from "../../Shared/ServiceCards/ProgressStepper";
import { statusTheme, workTypeTheme } from "../../Shared/ServiceCards/statusTheme";
import { INSPECTION_STATE_BADGE, getInspectionState, getJobOrderCosts, getJobOrderSource, priorityInfo, progressColor } from "./jobOrderHelpers";
import { getJobOrderSteps, jobOrderCaption } from "./jobOrderSteps";

interface Props {
    jobOrder: JobOrder;
    onView: (jobOrder: JobOrder) => void;
    actions?: ReactNode;
}

const peso = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (value?: string | null, withTime = false) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        ...(withTime ? { hour: "numeric", minute: "2-digit" } : { year: "numeric" }),
    });
};

export default function JobOrderCard({ jobOrder, onView, actions }: Props) {
    const status = statusTheme(jobOrder.status);
    const type = workTypeTheme(jobOrder.work_type);
    const priority = priorityInfo(jobOrder.priority);
    const source = getJobOrderSource(jobOrder);
    const costs = getJobOrderCosts(jobOrder);
    const inspectionState = getInspectionState(jobOrder);
    const inspectionBadge = INSPECTION_STATE_BADGE[inspectionState];
    const percent = jobOrder.status === "completed" ? 100 : jobOrder.progress ?? 0;
    const cancelled = jobOrder.status === "cancelled";
    const vehicle = jobOrder.vehicle;
    const vehicleName = [vehicle?.year_model, vehicle?.brand?.brand, vehicle?.model?.model, vehicle?.variant?.variant].filter(Boolean).join(" ");
    const staff = [jobOrder.assignedStaff?.first_name, jobOrder.assignedStaff?.last_name].filter(Boolean).join(" ");
    const latestUpdate = jobOrder.updates?.[0] ?? null;
    const problem = jobOrder.reported_problem || jobOrder.requestService?.request_detail || jobOrder.description;
    const photos = [
        ...(jobOrder.requestService?.photo_urls ?? []),
        ...(jobOrder.inspection?.photo_list ?? []).map((photo) => photo.url),
        ...(jobOrder.updates ?? []).flatMap((update) => update.photo_urls),
    ];
    const needsAttention = !cancelled && jobOrder.status !== "completed" && (inspectionState === "needed" || inspectionState === "awaiting_decision");

    return (
        <Box
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderTop="4px solid"
            borderTopColor={`${status.color}.400`}
            borderRadius="xl"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            transition="all 0.2s"
            _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
        >
            <Flex px={4} pt={4} pb={3} justify="space-between" align="flex-start" gap={3}>
                <HStack spacing={3} minW={0}>
                    <Flex boxSize="44px" borderRadius="xl" bg={`${type.color}.50`} color={`${type.color}.500`} align="center" justify="center" flexShrink={0}>
                        <Icon as={type.icon} boxSize={6} />
                    </Flex>
                    <Box minW={0}>
                        <Text fontSize="sm" fontWeight="800" color="gray.800" noOfLines={1}>
                            {jobOrder.job_order_no}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            {type.label} · {formatDate(jobOrder.created_at)}
                        </Text>
                    </Box>
                </HStack>
                <Flex direction="column" align="flex-end" gap={1}>
                    <Badge colorScheme={status.color} borderRadius="full" px={2.5} py={0.5} display="flex" alignItems="center" gap={1}>
                        <Icon as={status.icon} boxSize={3.5} />
                        {status.label}
                    </Badge>
                    {jobOrder.priority && jobOrder.priority !== "normal" && (
                        <Badge colorScheme={priority.color} variant="subtle" borderRadius="full" px={2} fontSize="2xs">
                            {priority.label} priority
                        </Badge>
                    )}
                </Flex>
            </Flex>

            <Box px={4} pb={4} flex="1">
                <HStack spacing={3} mb={3} color="gray.700" align="center">
                    <VehicleThumb images={vehicle?.images} alt={vehicleName} />
                    <Box minW={0}>
                        <DetailsLink type="vehicle" id={jobOrder.vehicle_id} fontSize="sm" fontWeight="700" noOfLines={1}>
                            {vehicleName || "Vehicle"}
                        </DetailsLink>
                        <HStack spacing={1.5} mt={1}>
                            {vehicle?.specs?.plate_number && (
                                <Badge variant="outline" fontSize="2xs">
                                    {vehicle.specs.plate_number}
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

                <Flex align="center" gap={2} mb={3} minH="32px">
                    {source.isCustomer ? (
                        <>
                            <CustomerAvatar customer={source.customer} size="xs" withName name={source.customerName || "Customer"} />
                            <Badge colorScheme="blue" variant="subtle" fontSize="2xs">
                                {source.requestNumber}
                            </Badge>
                        </>
                    ) : (
                        <Badge colorScheme="gray" display="flex" alignItems="center" gap={1}>
                            <HomeModernIcon width={12} />
                            Shop job
                        </Badge>
                    )}
                </Flex>

                {problem && (
                    <Text fontSize="sm" color="gray.600" noOfLines={2} mb={3}>
                        {problem}
                    </Text>
                )}

                {photos.length > 0 && (
                    <Box mb={3}>
                        <PhotoStrip urls={photos} max={5} size="46px" />
                    </Box>
                )}

                {needsAttention && inspectionBadge && (
                    <Flex align="center" gap={2} mb={3} px={3} py={2} borderRadius="lg" bg={`${inspectionBadge.color}.50`} color={`${inspectionBadge.color}.700`}>
                        <ExclamationTriangleIcon width={16} />
                        <Text fontSize="xs" fontWeight="700">
                            {inspectionBadge.label}
                        </Text>
                    </Flex>
                )}

                <Box bg="gray.50" border="1px" borderColor="gray.100" borderRadius="lg" p={3.5}>
                    <Flex justify="space-between" align="baseline" mb={2}>
                        <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                            Work progress
                        </Text>
                        <Text fontSize="lg" fontWeight="800" color={cancelled ? "red.500" : `${progressColor(percent)}.600`}>
                            {cancelled ? "—" : `${percent}%`}
                        </Text>
                    </Flex>
                    <Progress
                        value={cancelled ? 100 : percent}
                        colorScheme={cancelled ? "red" : progressColor(percent)}
                        size="sm"
                        borderRadius="full"
                        hasStripe={jobOrder.status === "in_progress"}
                        isAnimated={jobOrder.status === "in_progress"}
                    />
                    <Text fontSize="xs" color="gray.600" mt={2} mb={4}>
                        {jobOrderCaption(jobOrder)}
                    </Text>
                    <ProgressStepper steps={getJobOrderSteps(jobOrder)} />
                </Box>

                {latestUpdate && (
                    <Flex gap={2} mt={3} p={3} bg="blue.50" borderRadius="lg">
                        <Box color="blue.500" mt={0.5}>
                            <ChatBubbleLeftEllipsisIcon width={16} />
                        </Box>
                        <Box minW={0}>
                            <Text fontSize="xs" color="blue.700" fontWeight="700">
                                {latestUpdate.user?.username ?? "Update"} · {latestUpdate.progress}% · {formatDate(latestUpdate.created_at, true)}
                            </Text>
                            <Text fontSize="sm" color="gray.700" noOfLines={2}>
                                {latestUpdate.comment}
                            </Text>
                        </Box>
                    </Flex>
                )}

                <SimpleGrid columns={3} spacing={2} mt={4}>
                    {[
                        { icon: UserIcon, label: "Assigned", value: staff || "—" },
                        { icon: CalendarDaysIcon, label: "Scheduled", value: formatDate(jobOrder.scheduled_at) },
                        { icon: CurrencyDollarIcon, label: "Total", value: peso(costs.total) },
                    ].map((item) => (
                        <Box key={item.label} minW={0}>
                            <HStack spacing={1} color="gray.400">
                                <item.icon width={13} />
                                <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="700">
                                    {item.label}
                                </Text>
                            </HStack>
                            <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1}>
                                {item.value}
                            </Text>
                        </Box>
                    ))}
                </SimpleGrid>
            </Box>

            <Flex borderTop="1px solid" borderColor="gray.100" px={4} py={3} justify="space-between" align="center" gap={3} bg="gray.50">
                <Text fontSize="xs" color="gray.500" fontWeight="600">
                    {(jobOrder.partsUsed ?? []).length} part{(jobOrder.partsUsed ?? []).length === 1 ? "" : "s"} · {(jobOrder.updates ?? []).length} update
                    {(jobOrder.updates ?? []).length === 1 ? "" : "s"}
                </Text>
                <HStack spacing={2}>
                    <Button size="sm" variant={actions ? "outline" : "solid"} colorScheme="brand" leftIcon={<EyeIcon width={16} />} onClick={() => onView(jobOrder)}>
                        {actions ? "Details" : "View details"}
                    </Button>
                    {actions}
                </HStack>
            </Flex>
        </Box>
    );
}
