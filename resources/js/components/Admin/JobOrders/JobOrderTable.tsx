import { useMemo, useState } from "react";

import { Box, Flex, Grid, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import {
    CheckBadgeIcon,
    ClipboardDocumentCheckIcon,
    ExclamationTriangleIcon,
    InboxStackIcon,
    InformationCircleIcon,
    PlayCircleIcon,
} from "@heroicons/react/24/outline";

import type { JobOrder } from "../../../api/JobOrderManagement/jobOrderApi";
import Pagination from "../../../Reusable/Paginations";
import StatTile from "../../Shared/ServiceCards/StatTile";
import JobOrderCard from "./JobOrderCard";
import JobOrderDetailsModal from "./JobOrderDetailsModal";
import { getInspectionState } from "./jobOrderHelpers";

interface AdminJobOrderTableProps {
    jobOrders: JobOrder[];
    onChanged?: () => void;
}

const PAGE_SIZE = 9;

type QuickFilter = "" | "inspection" | "decision" | "in_progress" | "completed";

const matches = (jobOrder: JobOrder, filter: QuickFilter) => {
    const open = !["completed", "cancelled"].includes(jobOrder.status);
    switch (filter) {
        case "inspection":
            return open && getInspectionState(jobOrder) === "needed";
        case "decision":
            return open && getInspectionState(jobOrder) === "awaiting_decision";
        case "in_progress":
            return jobOrder.status === "in_progress";
        case "completed":
            return jobOrder.status === "completed";
        default:
            return true;
    }
};

export default function AdminJobOrderTable({ jobOrders, onChanged = () => {} }: AdminJobOrderTableProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [filter, setFilter] = useState<QuickFilter>("");
    const [page, setPage] = useState(1);

    const selectedJobOrder = jobOrders.find((jobOrder) => jobOrder.id === selectedId) ?? null;

    const counts = useMemo(
        () => ({
            all: jobOrders.length,
            inspection: jobOrders.filter((jobOrder) => matches(jobOrder, "inspection")).length,
            decision: jobOrders.filter((jobOrder) => matches(jobOrder, "decision")).length,
            in_progress: jobOrders.filter((jobOrder) => matches(jobOrder, "in_progress")).length,
            completed: jobOrders.filter((jobOrder) => matches(jobOrder, "completed")).length,
        }),
        [jobOrders]
    );

    const filtered = useMemo(() => jobOrders.filter((jobOrder) => matches(jobOrder, filter)), [jobOrders, filter]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const choose = (value: QuickFilter) => {
        setFilter((current) => (current === value ? "" : value));
        setPage(1);
    };

    return (
        <>
            <Box layerStyle="panel" overflow="hidden">
                <Box px={5} pt={4} pb={2}>
                    <Text fontSize="md" fontWeight="700" color="gray.800">
                        Job Orders
                    </Text>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                        Inspection, progress and costs of every shop job.
                    </Text>
                </Box>

                <SimpleGrid columns={{ base: 2, md: 3, xl: 5 }} spacing={3} px={5} py={4}>
                    <StatTile label="All job orders" value={counts.all} color="gray" icon={InboxStackIcon} active={filter === ""} onClick={() => choose("")} />
                    <StatTile label="Needs inspection" value={counts.inspection} color="yellow" icon={ClipboardDocumentCheckIcon} active={filter === "inspection"} onClick={() => choose("inspection")} />
                    <StatTile label="Needs decision" value={counts.decision} color="orange" icon={ExclamationTriangleIcon} active={filter === "decision"} onClick={() => choose("decision")} />
                    <StatTile label="In progress" value={counts.in_progress} color="blue" icon={PlayCircleIcon} active={filter === "in_progress"} onClick={() => choose("in_progress")} />
                    <StatTile label="Completed" value={counts.completed} color="green" icon={CheckBadgeIcon} active={filter === "completed"} onClick={() => choose("completed")} />
                </SimpleGrid>

                <Box px={5} pb={5}>
                    {filtered.length === 0 ? (
                        <Flex justify="center" py={14} border="1px dashed" borderColor="gray.300" borderRadius="xl">
                            <VStack spacing={2} color="gray.400">
                                <InformationCircleIcon width={36} />
                                <Text fontSize="sm" color="gray.500">
                                    {filter ? "No job orders in this group." : "No job orders found."}
                                </Text>
                            </VStack>
                        </Flex>
                    ) : (
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))", "2xl": "repeat(3, minmax(0, 1fr))" }} gap={4}>
                            {pageItems.map((jobOrder) => (
                                <JobOrderCard key={jobOrder.id} jobOrder={jobOrder} onView={(item) => setSelectedId(item.id)} />
                            ))}
                        </Grid>
                    )}
                </Box>

                {filtered.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filtered.length}
                        itemsPerPage={PAGE_SIZE}
                        onPageChange={setPage}
                        itemLabel="job order"
                    />
                )}
            </Box>

            <JobOrderDetailsModal
                jobOrder={selectedJobOrder}
                isOpen={selectedJobOrder !== null}
                onClose={() => setSelectedId(null)}
                onChanged={onChanged}
            />
        </>
    );
}
