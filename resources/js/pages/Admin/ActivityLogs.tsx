import {
    Avatar,
    Badge,
    Box,
    Button,
    Collapse,
    Flex,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    SimpleGrid,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useToast,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon, FingerPrintIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Fragment, useCallback, useEffect, useState } from "react";

import api from "../../api/api";
import PageHeader from "../../components/Shared/PageHeader";
import { EmptyState, LoadingState, Panel } from "../../components/Shared/ui";
import DetailsLink from "../../components/Shared/Details/DetailsLink";
import type { DetailsType } from "../../components/Shared/Details/detailsContext";

interface ActivityLog {
    id: number;
    action: "created" | "updated" | "deleted";
    subject_type: string;
    subject_id: number | null;
    subject_label: string | null;
    changes: Record<string, unknown> | null;
    ip_address: string | null;
    created_at: string;
    user?: { id: number; username: string; role?: { name: string } | null } | null;
}

interface ActivityResponse {
    data: ActivityLog[];
    meta: { current_page: number; last_page: number; total: number; per_page: number };
    subject_types: string[];
}

const ACTION_COLOR: Record<string, string> = { created: "green", updated: "blue", deleted: "red" };

const DETAIL_TYPES: Record<string, DetailsType> = {
    JobOrder: "jobOrder",
    Vehicle: "vehicle",
    Customer: "customer",
    VehiclePart: "part",
};

const humanize = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const show = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
};

export default function ActivityLogs() {
    const toast = useToast();
    const [rows, setRows] = useState<ActivityLog[]>([]);
    const [meta, setMeta] = useState<ActivityResponse["meta"] | null>(null);
    const [types, setTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [subjectType, setSubjectType] = useState("");
    const [action, setAction] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get<ActivityResponse>("/activity-logs", {
                params: {
                    page,
                    per_page: 20,
                    search: query || undefined,
                    subject_type: subjectType || undefined,
                    action: action || undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                },
            });
            setRows(response.data.data);
            setMeta(response.data.meta);
            setTypes(response.data.subject_types);
        } catch {
            toast({ title: "Could not load the audit log.", status: "error", duration: 3000 });
        } finally {
            setLoading(false);
        }
    }, [page, query, subjectType, action, dateFrom, dateTo, toast]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setPage(1);
            setQuery(search.trim());
        }, 400);
        return () => window.clearTimeout(timer);
    }, [search]);

    const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
        setPage(1);
        setter(value);
    };

    return (
        <Stack spacing={4}>
            <PageHeader title="Audit Log" subtitle="Every create, edit and delete in the system — who did it and what changed." onRefresh={load} refreshing={loading} />

            <Panel p={4}>
                <SimpleGrid columns={{ base: 1, md: 2, xl: 5 }} spacing={3}>
                    <InputGroup size="sm" gridColumn={{ xl: "span 2" }}>
                        <InputLeftElement pointerEvents="none" color="gray.400">
                            <MagnifyingGlassIcon width={16} />
                        </InputLeftElement>
                        <Input placeholder="Search record or username" value={search} onChange={(event) => setSearch(event.target.value)} />
                    </InputGroup>
                    <Select size="sm" value={subjectType} onChange={(event) => resetPage(setSubjectType)(event.target.value)}>
                        <option value="">All modules</option>
                        {types.map((type) => (
                            <option key={type} value={type}>
                                {humanize(type)}
                            </option>
                        ))}
                    </Select>
                    <Select size="sm" value={action} onChange={(event) => resetPage(setAction)(event.target.value)}>
                        <option value="">All actions</option>
                        <option value="created">Created</option>
                        <option value="updated">Updated</option>
                        <option value="deleted">Deleted</option>
                    </Select>
                    <HStack spacing={2}>
                        <Input size="sm" type="date" value={dateFrom} onChange={(event) => resetPage(setDateFrom)(event.target.value)} />
                        <Input size="sm" type="date" value={dateTo} onChange={(event) => resetPage(setDateTo)(event.target.value)} />
                    </HStack>
                </SimpleGrid>
            </Panel>

            <Panel p={0} overflow="hidden">
                {loading && rows.length === 0 ? (
                    <LoadingState label="Loading audit log…" />
                ) : rows.length === 0 ? (
                    <EmptyState icon={FingerPrintIcon} title="No activity found" message="Try a different filter or date range." />
                ) : (
                    <Box overflowX="auto">
                        <Table size="sm">
                            <Thead bg="gray.50">
                                <Tr>
                                    <Th>When</Th>
                                    <Th>User</Th>
                                    <Th>Action</Th>
                                    <Th>Record</Th>
                                    <Th>Changes</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {rows.map((row) => {
                                    const entries = Object.entries(row.changes ?? {});
                                    const detailType = DETAIL_TYPES[row.subject_type];
                                    const open = expanded === row.id;
                                    return (
                                        <Fragment key={row.id}>
                                            <Tr _hover={{ bg: "gray.50" }}>
                                                <Td whiteSpace="nowrap">
                                                    <Text fontSize="sm">{new Date(row.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {new Date(row.created_at).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}
                                                    </Text>
                                                </Td>
                                                <Td>
                                                    <HStack spacing={2}>
                                                        <Avatar size="xs" name={row.user?.username ?? "System"} bg={row.user ? "brand.500" : "gray.400"} color="white" />
                                                        <Box>
                                                            <Text fontSize="sm" fontWeight="600">
                                                                {row.user?.username ?? "System"}
                                                            </Text>
                                                            <Text fontSize="xs" color="gray.500">
                                                                {row.user?.role?.name ?? "Automatic"}
                                                            </Text>
                                                        </Box>
                                                    </HStack>
                                                </Td>
                                                <Td>
                                                    <Badge colorScheme={ACTION_COLOR[row.action]}>{row.action}</Badge>
                                                </Td>
                                                <Td maxW="320px">
                                                    <Text fontSize="xs" color="gray.500">
                                                        {humanize(row.subject_type)}
                                                    </Text>
                                                    {detailType && row.subject_id && row.action !== "deleted" ? (
                                                        <DetailsLink type={detailType} id={row.subject_id} fontSize="sm" fontWeight="600" noOfLines={1}>
                                                            {row.subject_label ?? `#${row.subject_id}`}
                                                        </DetailsLink>
                                                    ) : (
                                                        <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                                                            {row.subject_label ?? `#${row.subject_id}`}
                                                        </Text>
                                                    )}
                                                </Td>
                                                <Td>
                                                    {entries.length === 0 ? (
                                                        <Text fontSize="xs" color="gray.400">
                                                            —
                                                        </Text>
                                                    ) : (
                                                        <Button size="xs" variant="ghost" rightIcon={open ? <ChevronUpIcon width={12} /> : <ChevronDownIcon width={12} />} onClick={() => setExpanded(open ? null : row.id)}>
                                                            {entries.length} field{entries.length === 1 ? "" : "s"}
                                                        </Button>
                                                    )}
                                                </Td>
                                            </Tr>
                                            {open && (
                                                <Tr>
                                                    <Td colSpan={5} bg="gray.50" px={6}>
                                                        <Collapse in animateOpacity>
                                                            <Stack spacing={1.5} py={1}>
                                                                {entries.map(([field, value]) => {
                                                                    const change = value as { from?: unknown; to?: unknown } | null;
                                                                    const isDiff = row.action === "updated" && change && typeof change === "object" && "to" in change;
                                                                    return (
                                                                        <Flex key={field} gap={3} fontSize="xs" align="flex-start">
                                                                            <Text w="180px" flexShrink={0} color="gray.500" fontWeight="600">
                                                                                {humanize(field)}
                                                                            </Text>
                                                                            {isDiff ? (
                                                                                <Text wordBreak="break-word">
                                                                                    <Text as="span" color="red.600" textDecoration="line-through">
                                                                                        {show(change.from)}
                                                                                    </Text>
                                                                                    {"  →  "}
                                                                                    <Text as="span" color="green.700" fontWeight="600">
                                                                                        {show(change.to)}
                                                                                    </Text>
                                                                                </Text>
                                                                            ) : (
                                                                                <Text wordBreak="break-word">{show(value)}</Text>
                                                                            )}
                                                                        </Flex>
                                                                    );
                                                                })}
                                                                {row.ip_address && (
                                                                    <Text fontSize="2xs" color="gray.400" pt={1}>
                                                                        IP {row.ip_address}
                                                                    </Text>
                                                                )}
                                                            </Stack>
                                                        </Collapse>
                                                    </Td>
                                                </Tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </Tbody>
                        </Table>
                    </Box>
                )}

                {meta && meta.total > 0 && (
                    <Flex justify="space-between" align="center" px={4} py={3} borderTop="1px solid" borderColor="gray.100">
                        <Text fontSize="sm" color="gray.600">
                            Page {meta.current_page} of {meta.last_page} · {meta.total.toLocaleString()} entries
                        </Text>
                        <HStack>
                            <Button size="sm" variant="outline" isDisabled={page <= 1} onClick={() => setPage(page - 1)}>
                                Previous
                            </Button>
                            <Button size="sm" variant="outline" isDisabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>
                                Next
                            </Button>
                        </HStack>
                    </Flex>
                )}
            </Panel>
        </Stack>
    );
}
