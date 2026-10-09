import { Badge, Box, Button, Flex, HStack, Icon, Progress, SimpleGrid, Text } from "@chakra-ui/react";
import { CalendarDaysIcon, ChatBubbleLeftEllipsisIcon, CurrencyDollarIcon, EyeIcon, StarIcon, UserIcon } from "@heroicons/react/24/outline";

import type { RequestService } from "../../../api/JobOrderManagement/requestServiceApi";
import { progressColor } from "../../Admin/JobOrders/jobOrderHelpers";
import ProgressStepper from "../../Shared/ServiceCards/ProgressStepper";
import PhotoStrip from "../../Shared/ServiceCards/PhotoStrip";
import VehicleThumb from "../../Shared/ServiceCards/VehicleThumb";
import { URGENCY_COLOR, statusTheme, workTypeTheme } from "../../Shared/ServiceCards/statusTheme";
import { getRequestSteps, progressCaption, requestProgress } from "./requestProgress";
import CustomerAvatar from "../../Shared/Customers/CustomerAvatar";
import type { ReactNode } from "react";

interface Props {
    service: RequestService;
    onView: (service: RequestService) => void;
    showCustomer?: boolean;
    actions?: ReactNode;
}

const labelOf = (value?: string | null) => (value ? value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "");

const formatDate = (value?: string | null, withTime = false) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        ...(withTime && { hour: "numeric", minute: "2-digit" }),
    });
};

export default function RequestServiceCard({ service, onView, showCustomer = false, actions }: Props) {
    const jobOrder = service.job_order ?? null;
    const status = statusTheme(service.status);
    const type = workTypeTheme(service.service_type);
    const vehicle = service.vehicle_release?.sale?.reservation?.vehicle;
    const vehicleName = [vehicle?.year_model, vehicle?.brand?.brand, vehicle?.model?.model, vehicle?.variant?.variant].filter(Boolean).join(" ");
    const photos = service.photo_urls?.length ? service.photo_urls : service.request_proof ? [`/storage/${service.request_proof}`] : [];
    const percent = requestProgress(service);
    const cancelled = service.status === "cancelled";
    const latestUpdate = jobOrder?.updates?.[0] ?? null;
    const mechanic = [jobOrder?.assigned_staff?.first_name, jobOrder?.assigned_staff?.last_name].filter(Boolean).join(" ");

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
                            {service.service_request_number}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            {type.label} · {formatDate(service.created_at)}
                        </Text>
                    </Box>
                </HStack>
                <Flex direction="column" align="flex-end" gap={1}>
                    <Badge colorScheme={status.color} borderRadius="full" px={2.5} py={0.5} display="flex" alignItems="center" gap={1}>
                        <Icon as={status.icon} boxSize={3.5} />
                        {status.label}
                    </Badge>
                    {service.urgency && service.urgency !== "normal" && (
                        <Badge colorScheme={URGENCY_COLOR[service.urgency]} variant="subtle" borderRadius="full" px={2} fontSize="2xs">
                            {labelOf(service.urgency)} priority
                        </Badge>
                    )}
                </Flex>
            </Flex>

            <Box px={4} pb={4} flex="1">
                {jobOrder?.estimate_status === "pending" && (
                    <Flex align="center" gap={2} mb={3} px={3} py={2} bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="lg">
                        <Icon as={CurrencyDollarIcon} boxSize={4} color="orange.500" />
                        <Text fontSize="xs" fontWeight="700" color="orange.800" flex="1">
                            {showCustomer ? "Waiting for customer to approve the estimate" : "Estimate ready — please review and approve"}
                        </Text>
                        <Text fontSize="xs" fontWeight="800" color="orange.800">
                            ₱{Number(jobOrder.estimate_amount ?? 0).toLocaleString("en-PH")}
                        </Text>
                    </Flex>
                )}
                {jobOrder?.status === "completed" && !jobOrder.rating && !showCustomer && (
                    <Flex align="center" gap={2} mb={3} px={3} py={2} bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="lg">
                        <Icon as={StarIcon} boxSize={4} color="yellow.500" />
                        <Text fontSize="xs" fontWeight="700" color="yellow.800">
                            Job done — rate our service
                        </Text>
                    </Flex>
                )}
                <HStack spacing={3} mb={3} color="gray.700" align="center">
                    <VehicleThumb images={vehicle?.images} alt={vehicleName} />
                    <Box minW={0}>
                        <Text fontSize="sm" fontWeight="700" noOfLines={1}>
                            {vehicleName || "Vehicle"}
                        </Text>
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

                {showCustomer && (
                    <Box mb={3}>
                        <CustomerAvatar
                            customer={service.vehicle_release?.sale?.reservation?.customer}
                            size="xs"
                            withName
                            subtitle={service.contact_number || service.vehicle_release?.sale?.reservation?.customer?.mobile_number}
                        />
                    </Box>
                )}

                <Text fontSize="sm" color="gray.600" noOfLines={2} mb={3}>
                    {service.request_detail || "—"}
                </Text>

                {(service.symptoms ?? []).length > 0 && (
                    <HStack spacing={1.5} wrap="wrap" mb={3}>
                        {(service.symptoms ?? []).slice(0, 3).map((symptom) => (
                            <Badge key={symptom} colorScheme="orange" variant="subtle" borderRadius="full" px={2} fontSize="2xs">
                                {symptom}
                            </Badge>
                        ))}
                        {(service.symptoms ?? []).length > 3 && (
                            <Text fontSize="xs" color="gray.500">
                                +{(service.symptoms ?? []).length - 3}
                            </Text>
                        )}
                    </HStack>
                )}

                {photos.length > 0 && (
                    <Box mb={4}>
                        <PhotoStrip urls={photos} />
                    </Box>
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
                        hasStripe={service.status === "in_progress"}
                        isAnimated={service.status === "in_progress"}
                    />
                    <Text fontSize="xs" color="gray.600" mt={2} mb={4}>
                        {progressCaption(service)}
                    </Text>
                    <ProgressStepper steps={getRequestSteps(service)} />
                </Box>

                {latestUpdate && (
                    <Flex gap={2} mt={3} p={3} bg="blue.50" borderRadius="lg">
                        <Box color="blue.500" mt={0.5}>
                            <ChatBubbleLeftEllipsisIcon width={16} />
                        </Box>
                        <Box minW={0}>
                            <Text fontSize="xs" color="blue.700" fontWeight="700">
                                Latest update · {latestUpdate.progress}% · {formatDate(latestUpdate.created_at, true)}
                            </Text>
                            <Text fontSize="sm" color="gray.700" noOfLines={2}>
                                {latestUpdate.comment}
                            </Text>
                        </Box>
                    </Flex>
                )}

                <SimpleGrid columns={2} spacing={3} mt={4}>
                    <HStack spacing={2} align="start">
                        <Flex boxSize="30px" borderRadius="md" bg="gray.50" color="gray.500" align="center" justify="center" flexShrink={0}>
                            <CalendarDaysIcon width={16} />
                        </Flex>
                        <Box minW={0}>
                            <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="700">
                                Preferred
                            </Text>
                            <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                                {formatDate(service.request_date_pref)}
                                {service.preferred_time && service.preferred_time !== "any" && ` · ${labelOf(service.preferred_time)}`}
                            </Text>
                        </Box>
                    </HStack>
                    <HStack spacing={2} align="start">
                        <Flex boxSize="30px" borderRadius="md" bg="gray.50" color="gray.500" align="center" justify="center" flexShrink={0}>
                            <UserIcon width={16} />
                        </Flex>
                        <Box minW={0}>
                            <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="700">
                                Mechanic
                            </Text>
                            <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                                {mechanic || "Not yet assigned"}
                            </Text>
                        </Box>
                    </HStack>
                </SimpleGrid>
            </Box>

            <Flex borderTop="1px solid" borderColor="gray.100" px={4} py={3} justify="space-between" align="center" gap={3} bg="gray.50">
                <Text fontSize="xs" color="gray.500" fontWeight="600">
                    {jobOrder?.job_order_no ?? "No job order yet"}
                </Text>
                <HStack spacing={2}>
                    <Button size="sm" variant={actions ? "outline" : "solid"} colorScheme="brand" leftIcon={<EyeIcon width={16} />} onClick={() => onView(service)}>
                        {actions ? "Details" : "View details"}
                    </Button>
                    {actions}
                </HStack>
            </Flex>
        </Box>
    );
}
