import { Badge, Box, Flex, Icon, Text } from "@chakra-ui/react";
import {
    ArrowPathIcon,
    CheckBadgeIcon,
    ClipboardDocumentCheckIcon,
    DocumentPlusIcon,
    PlayIcon,
    ScaleIcon,
    XCircleIcon,
} from "@heroicons/react/24/solid";
import type { ComponentType, ReactNode, SVGProps } from "react";

import type { JobOrder } from "../../../api/JobOrderManagement/jobOrderApi";
import { progressColor, resultInfo } from "./jobOrderHelpers";
import PhotoGallery from "./PhotoGallery";

interface TimelineEvent {
    key: string;
    at: string;
    title: string;
    by?: string | null;
    color: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    body?: ReactNode;
}

const formatDate = (value: string) =>
    new Date(value).toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const buildEvents = (jobOrder: JobOrder): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const inspection = jobOrder.inspection;

    if (jobOrder.created_at) {
        events.push({
            key: "created",
            at: jobOrder.created_at,
            title: "Job order created",
            by: (jobOrder.creator as { username?: string } | undefined)?.username,
            color: "gray",
            icon: DocumentPlusIcon,
        });
    }

    if (inspection) {
        const info = resultInfo(inspection.result);
        events.push({
            key: "inspected",
            at: inspection.inspected_at,
            title: "Vehicle inspected",
            by: inspection.inspector?.username,
            color: info?.color === "gray" ? "orange" : "purple",
            icon: ClipboardDocumentCheckIcon,
            body: (
                <>
                    <Badge colorScheme={info?.color} mb={1}>
                        {info?.label}
                    </Badge>
                    <Text fontSize="sm" color="gray.700" noOfLines={3}>
                        {inspection.findings}
                    </Text>
                </>
            ),
        });

        if (inspection.office_decision && inspection.decided_at) {
            events.push({
                key: "decision",
                at: inspection.decided_at,
                title: inspection.office_decision === "proceed" ? "Office approved to proceed" : "Office cancelled after inspection",
                by: inspection.decider?.username,
                color: inspection.office_decision === "proceed" ? "teal" : "red",
                icon: ScaleIcon,
                body: inspection.decision_note ? <Text fontSize="sm" color="gray.700">{inspection.decision_note}</Text> : undefined,
            });
        }
    }

    if (jobOrder.start_job) {
        events.push({ key: "started", at: jobOrder.start_job, title: "Work started", color: "blue", icon: PlayIcon });
    }

    (jobOrder.updates ?? []).forEach((update) => {
        events.push({
            key: `update-${update.id}`,
            at: update.created_at,
            title: `Progress ${update.progress}%`,
            by: update.user?.username,
            color: progressColor(update.progress),
            icon: ArrowPathIcon,
            body: (
                <>
                    <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
                        {update.comment}
                    </Text>
                    {update.photo_urls.length > 0 && (
                        <Box mt={2}>
                            <PhotoGallery photos={update.photo_urls.map((url) => ({ url }))} size="72px" columns={{ base: 4, md: 6 }} />
                        </Box>
                    )}
                </>
            ),
        });
    });

    if (jobOrder.finish_job) {
        events.push({ key: "finished", at: jobOrder.finish_job, title: "Job completed", color: "green", icon: CheckBadgeIcon });
    } else if (jobOrder.status === "cancelled" && jobOrder.updated_at && inspection?.office_decision !== "cancel") {
        events.push({ key: "cancelled", at: jobOrder.updated_at, title: "Job order cancelled", color: "red", icon: XCircleIcon });
    }

    return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
};

export default function JobOrderTimeline({ jobOrder }: { jobOrder: JobOrder }) {
    const events = buildEvents(jobOrder);

    if (events.length === 0) {
        return (
            <Text fontSize="sm" color="gray.500">
                No activity yet.
            </Text>
        );
    }

    return (
        <Box position="relative">
            {events.map((event, index) => (
                <Flex key={event.key} gap={3} position="relative" pb={index === events.length - 1 ? 0 : 5}>
                    {index < events.length - 1 && (
                        <Box position="absolute" left="15px" top="32px" bottom="0" w="2px" bg="gray.200" />
                    )}
                    <Flex
                        boxSize="32px"
                        flexShrink={0}
                        borderRadius="full"
                        bg={`${event.color}.100`}
                        color={`${event.color}.600`}
                        align="center"
                        justify="center"
                        border="2px solid white"
                        boxShadow="sm"
                        zIndex={1}
                    >
                        <Icon as={event.icon} boxSize={4} />
                    </Flex>
                    <Box flex="1" minW={0} pt={0.5}>
                        <Flex justify="space-between" gap={2} wrap="wrap">
                            <Text fontSize="sm" fontWeight="700" color="gray.800">
                                {event.title}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                {formatDate(event.at)}
                            </Text>
                        </Flex>
                        {event.by && (
                            <Text fontSize="xs" color="gray.500">
                                by {event.by}
                            </Text>
                        )}
                        {event.body && <Box mt={1.5}>{event.body}</Box>}
                    </Box>
                </Flex>
            ))}
        </Box>
    );
}
