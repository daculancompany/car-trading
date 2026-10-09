import { useMemo, useState } from "react";

import { Box, Button, Flex, Grid, SimpleGrid, Skeleton, Text, VStack } from "@chakra-ui/react";
import {
    CheckBadgeIcon,
    ClockIcon,
    InboxStackIcon,
    InformationCircleIcon,
    PlayCircleIcon,
    UserPlusIcon,
} from "@heroicons/react/24/outline";

import type { RequestService, Staff } from "../../../api/JobOrderManagement/requestServiceApi";
import Pagination from "../../../Reusable/Paginations";
import StatTile from "../../Shared/ServiceCards/StatTile";
import { useDetails } from "../../Shared/Details/detailsContext";
import RequestServiceCard from "../../Customers/JobOrders/RequestServiceCard";
import ViewRequestServiceModal from "./ViewRequestServiceModal";
import AssignRequestServiceModal from "../JobOrders/AssignJobOrders";

interface RequestTableProps {
    requestServices: RequestService[];
    loading: boolean;
    onReload: () => void;
    staffs: Staff[];
}

const PAGE_SIZE = 9;

type Filter = "" | "pending" | "assigned" | "in_progress" | "completed";

export default function RequestTable({ requestServices, loading, onReload, staffs }: RequestTableProps) {
    const details = useDetails();
    const [filter, setFilter] = useState<Filter>("");
    const [page, setPage] = useState(1);
    const [viewing, setViewing] = useState<RequestService | null>(null);
    const [assigning, setAssigning] = useState<RequestService | null>(null);

    const counts = useMemo(() => {
        const count = (status: string) => requestServices.filter((service) => service.status === status).length;
        return {
            all: requestServices.length,
            pending: count("pending"),
            assigned: count("assigned"),
            in_progress: count("in_progress"),
            completed: count("completed"),
        };
    }, [requestServices]);

    const filtered = useMemo(
        () => (filter ? requestServices.filter((service) => service.status === filter) : requestServices),
        [requestServices, filter]
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const choose = (value: Filter) => {
        setFilter((current) => (current === value ? "" : value));
        setPage(1);
    };

    const handleView = (service: RequestService) => {
        if (service.job_order && details) {
            details.open("jobOrder", service.job_order.id);
            return;
        }
        setViewing(service);
    };

    return (
        <Box layerStyle="panel" overflow="hidden">
            <Box px={5} pt={4} pb={2}>
                <Text fontSize="md" fontWeight="700" color="gray.800">
                    Service Requests
                </Text>
                <Text fontSize="sm" color="gray.500" mt={1}>
                    Customer requests, their job orders and progress.
                </Text>
            </Box>

            <SimpleGrid columns={{ base: 2, md: 3, xl: 5 }} spacing={3} px={5} py={4}>
                <StatTile label="All requests" value={counts.all} color="gray" icon={InboxStackIcon} active={filter === ""} onClick={() => choose("")} />
                <StatTile label="Waiting to assign" value={counts.pending} color="yellow" icon={ClockIcon} active={filter === "pending"} onClick={() => choose("pending")} />
                <StatTile label="Assigned" value={counts.assigned} color="purple" icon={UserPlusIcon} active={filter === "assigned"} onClick={() => choose("assigned")} />
                <StatTile label="In progress" value={counts.in_progress} color="blue" icon={PlayCircleIcon} active={filter === "in_progress"} onClick={() => choose("in_progress")} />
                <StatTile label="Completed" value={counts.completed} color="green" icon={CheckBadgeIcon} active={filter === "completed"} onClick={() => choose("completed")} />
            </SimpleGrid>

            <Box px={5} pb={5}>
                {loading ? (
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))", "2xl": "repeat(3, minmax(0, 1fr))" }} gap={4}>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Box key={index} border="1px solid" borderColor="gray.200" borderRadius="xl" p={4}>
                                <VStack align="stretch" spacing={4}>
                                    <Skeleton height="24px" width="55%" />
                                    <Skeleton height="18px" />
                                    <Skeleton height="60px" />
                                </VStack>
                            </Box>
                        ))}
                    </Grid>
                ) : filtered.length === 0 ? (
                    <Flex justify="center" py={14} border="1px dashed" borderColor="gray.300" borderRadius="xl">
                        <VStack spacing={2} color="gray.400">
                            <InformationCircleIcon width={36} />
                            <Text fontSize="sm" color="gray.500">
                                {filter ? "No requests in this group." : "No service requests found."}
                            </Text>
                        </VStack>
                    </Flex>
                ) : (
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))", "2xl": "repeat(3, minmax(0, 1fr))" }} gap={4}>
                        {pageItems.map((service) => (
                            <RequestServiceCard
                                key={service.id}
                                service={service}
                                onView={handleView}
                                showCustomer
                                actions={
                                    service.status === "pending" && !service.job_order ? (
                                        <Button size="sm" colorScheme="green" leftIcon={<UserPlusIcon width={16} />} onClick={() => setAssigning(service)}>
                                            Assign
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ))}
                    </Grid>
                )}
            </Box>

            {!loading && filtered.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filtered.length}
                    itemsPerPage={PAGE_SIZE}
                    onPageChange={setPage}
                    itemLabel="service request"
                />
            )}

            <ViewRequestServiceModal isOpen={viewing !== null} onClose={() => setViewing(null)} requestService={viewing} />

            <AssignRequestServiceModal
                isOpen={assigning !== null}
                onClose={() => setAssigning(null)}
                requestService={assigning}
                staffs={staffs}
                onSuccess={() => {
                    setAssigning(null);
                    onReload();
                }}
            />
        </Box>
    );
}
