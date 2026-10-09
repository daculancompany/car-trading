import { Badge, Box, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import {
    ArrowPathIcon,
    BanknotesIcon,
    CheckBadgeIcon,
    ClockIcon,
    DocumentPlusIcon,
    IdentificationIcon,
    TruckIcon,
    XCircleIcon,
} from "@heroicons/react/24/solid";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

import type { Reservation, ReservationHistoryAction, ReservationStatusHistory } from "../../../api/ReservationManagement/reservationApi";
import { reservationStatusTheme } from "./reservationFlow";

const ACTIONS: Record<ReservationHistoryAction, { title: string; color: string; icon: ComponentType<SVGProps<SVGSVGElement>> }> = {
    created: { title: "Reservation submitted", color: "gray", icon: DocumentPlusIcon },
    approved: { title: "Approved", color: "green", icon: CheckBadgeIcon },
    rejected: { title: "Rejected", color: "red", icon: XCircleIcon },
    id_reviewed: { title: "Valid ID reviewed", color: "blue", icon: IdentificationIcon },
    payment_verified: { title: "Payment verified", color: "teal", icon: BanknotesIcon },
    released: { title: "Vehicle released", color: "purple", icon: TruckIcon },
    expired: { title: "Reservation expired", color: "orange", icon: ClockIcon },
    status_changed: { title: "Status updated", color: "gray", icon: ArrowPathIcon },
    auto: { title: "Status updated automatically", color: "gray", icon: ArrowPathIcon },
};

const formatDate = (value: string) =>
    new Date(value).toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const relative = (value: string) => {
    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.round(diff / 60000);
    if (Number.isNaN(minutes)) return "";
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return days < 30 ? `${days}d ago` : "";
};

const actor = (entry: ReservationStatusHistory, customerView: boolean) => {
    if (!entry.user) return entry.action === "created" ? (customerView ? "You" : "Customer") : "System · automatic";
    if (customerView) return entry.action === "created" ? "You" : "CDO Car Trading";
    return entry.user.role?.name ? `${entry.user.username} · ${entry.user.role.name}` : entry.user.username;
};

interface Props {
    reservation: Reservation;
    customerView?: boolean;
}

export default function ReservationTimeline({ reservation, customerView = false }: Props) {
    const entries = [...(reservation.status_histories ?? [])].reverse();

    if (entries.length === 0) {
        return (
            <Text fontSize="sm" color="gray.500">
                No activity recorded yet.
            </Text>
        );
    }

    return (
        <Box position="relative">
            {entries.map((entry, index) => {
                const action = ACTIONS[entry.action] ?? ACTIONS.status_changed;
                const to = reservationStatusTheme(entry.to_status);
                const from = entry.from_status ? reservationStatusTheme(entry.from_status) : null;
                const statusChanged = from && entry.from_status !== entry.to_status;
                const title = entry.action === "approved" ? `Approved → ${to.label}` : action.title;

                return (
                    <Flex key={entry.id} gap={3} position="relative" pb={index === entries.length - 1 ? 0 : 5}>
                        {index < entries.length - 1 && (
                            <Box position="absolute" left="15px" top="32px" bottom="0" w="2px" bg="gray.200" />
                        )}
                        <Flex
                            boxSize="32px"
                            borderRadius="full"
                            bg={`${action.color}.50`}
                            color={`${action.color}.500`}
                            border="2px solid"
                            borderColor={`${action.color}.200`}
                            align="center"
                            justify="center"
                            flexShrink={0}
                            zIndex={1}
                        >
                            <Icon as={action.icon} boxSize={4} />
                        </Flex>
                        <Box flex="1" minW={0} pt={0.5}>
                            <Flex justify="space-between" gap={2} align="flex-start">
                                <Text fontSize="sm" fontWeight="700" color="gray.800">
                                    {title}
                                </Text>
                                <Text fontSize="2xs" color="gray.400" whiteSpace="nowrap" pt={0.5}>
                                    {relative(entry.created_at)}
                                </Text>
                            </Flex>
                            <Text fontSize="xs" color="gray.500">
                                {actor(entry, customerView)} · {formatDate(entry.created_at)}
                            </Text>
                            {statusChanged && (
                                <HStack spacing={1.5} mt={1.5}>
                                    <Badge colorScheme={from.color} variant="subtle" fontSize="2xs">
                                        {from.label}
                                    </Badge>
                                    <ArrowRightIcon width={12} color="var(--chakra-colors-gray-400)" />
                                    <Badge colorScheme={to.color} fontSize="2xs">
                                        {to.label}
                                    </Badge>
                                </HStack>
                            )}
                            {entry.note && (
                                <Box mt={2} px={3} py={2} bg={entry.action === "rejected" ? "red.50" : "gray.50"} borderRadius="md" borderLeft="3px solid" borderColor={`${action.color}.300`}>
                                    <Text fontSize="xs" color="gray.700" whiteSpace="pre-wrap">
                                        {entry.note}
                                    </Text>
                                </Box>
                            )}
                        </Box>
                    </Flex>
                );
            })}
        </Box>
    );
}
