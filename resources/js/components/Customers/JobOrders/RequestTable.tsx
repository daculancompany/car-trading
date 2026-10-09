import { useMemo, useState } from "react";

import { Badge, Box, Flex, Grid, Heading, HStack, SimpleGrid, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
import {
    CheckBadgeIcon,
    ClockIcon,
    InboxStackIcon,
    InformationCircleIcon,
    PlayCircleIcon,
    WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

import type { RequestService } from "../../../api/JobOrderManagement/requestServiceApi";
import Pagination from "../../../Reusable/Paginations";
import StatTile from "../../Shared/ServiceCards/StatTile";
import ViewRequestServiceModal from "./ViewRequestServiceModal";
import RequestServiceCard from "./RequestServiceCard";
import JobOrderDetailsModal from "../../Admin/JobOrders/JobOrderDetailsModal";
import { requestToJobOrder } from "./requestJobOrder";

interface RequestTableProps {
    requestServices: RequestService[];
    loading: boolean;
    onReload: () => void;
}

const PAGE_SIZE = 6;

type Filter = "" | "open" | "in_progress" | "completed";

export default function CustomerRequestTable({ requestServices, loading, onReload }: RequestTableProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selectedRequest = requestServices.find((service) => service.id === selectedId) ?? null;
    const setSelectedRequest = (service: RequestService | null) => setSelectedId(service?.id ?? null);
    const [filter, setFilter] = useState<Filter>("");
    const [page, setPage] = useState(1);
    const selectedJobOrder = selectedRequest ? requestToJobOrder(selectedRequest) : null;

    const counts = useMemo(
        () => ({
            all: requestServices.length,
            open: requestServices.filter((service) => ["pending", "assigned"].includes(service.status)).length,
            in_progress: requestServices.filter((service) => service.status === "in_progress").length,
            completed: requestServices.filter((service) => service.status === "completed").length,
        }),
        [requestServices]
    );

    const filtered = useMemo(() => {
        if (filter === "open") return requestServices.filter((service) => ["pending", "assigned"].includes(service.status));
        if (filter) return requestServices.filter((service) => service.status === filter);
        return requestServices;
    }, [requestServices, filter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const choose = (value: Filter) => {
        setFilter((current) => (current === value ? "" : value));
        setPage(1);
    };

    return (
        <Box layerStyle="panel" p={{ base: 4, md: 5 }} overflow="hidden">
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }} gap={3} mb={5}>
                <HStack spacing={3}>
                    <Flex bg="brand.50" color="brand.500" borderRadius="lg" boxSize="42px" align="center" justify="center">
                        <WrenchScrewdriverIcon width={23} height={23} />
                    </Flex>
                    <Box>
                        <Heading size={{ base: "sm", md: "md" }} color="gray.800">
                            My Service Requests
                        </Heading>
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" mt={1}>
                            Track each request from submission to completion.
                        </Text>
                    </Box>
                </HStack>
                <Badge colorScheme="blue" borderRadius="full" px={3} py={1} fontSize="xs">
                    {requestServices.length} Requests
                </Badge>
            </Flex>

            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={5}>
                <StatTile label="All requests" value={counts.all} color="gray" icon={InboxStackIcon} active={filter === ""} onClick={() => choose("")} />
                <StatTile label="Waiting" value={counts.open} color="yellow" icon={ClockIcon} active={filter === "open"} onClick={() => choose("open")} />
                <StatTile label="In progress" value={counts.in_progress} color="blue" icon={PlayCircleIcon} active={filter === "in_progress"} onClick={() => choose("in_progress")} />
                <StatTile label="Completed" value={counts.completed} color="green" icon={CheckBadgeIcon} active={filter === "completed"} onClick={() => choose("completed")} />
            </SimpleGrid>

            {loading ? (
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, minmax(0, 1fr))", "2xl": "repeat(3, minmax(0, 1fr))" }} gap={4}>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Box key={index} border="1px solid" borderColor="gray.200" borderRadius="xl" p={4}>
                            <VStack align="stretch" spacing={4}>
                                <Skeleton height="24px" width="55%" />
                                <Skeleton height="18px" />
                                <Skeleton height="60px" />
                                <Skeleton height="40px" />
                            </VStack>
                        </Box>
                    ))}
                </Grid>
            ) : filtered.length === 0 ? (
                <Box textAlign="center" py={12} border="1px dashed" borderColor="gray.300" borderRadius="xl">
                    <VStack spacing={3} color="gray.400">
                        <InformationCircleIcon width={40} height={40} />
                        <Text fontSize="sm" color="gray.500">
                            {filter ? "No requests in this group." : "No service requests found."}
                        </Text>
                        <Text fontSize="xs">Your service requests will appear here.</Text>
                    </VStack>
                </Box>
            ) : (
                <Stack spacing={0}>
                    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, minmax(0, 1fr))", "2xl": "repeat(3, minmax(0, 1fr))" }} gap={4}>
                        {pageItems.map((service) => (
                            <RequestServiceCard key={service.id} service={service} onView={setSelectedRequest} />
                        ))}
                    </Grid>
                    <Box mt={4} mx={{ base: -4, md: -5 }} mb={{ base: -4, md: -5 }}>
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filtered.length}
                            itemsPerPage={PAGE_SIZE}
                            onPageChange={setPage}
                            itemLabel="request"
                        />
                    </Box>
                </Stack>
            )}

            <JobOrderDetailsModal
                isOpen={selectedJobOrder !== null}
                onClose={() => setSelectedRequest(null)}
                jobOrder={selectedJobOrder}
                onChanged={onReload}
                readOnly
            />

            <ViewRequestServiceModal
                isOpen={selectedRequest !== null && selectedJobOrder === null}
                onClose={() => setSelectedRequest(null)}
                requestService={selectedRequest}
            />
        </Box>
    );
}
