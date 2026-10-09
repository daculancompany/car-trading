import {
    Avatar,
    Badge,
    Box,
    Button,
    ButtonGroup,
    Flex,
    Grid,
    HStack,
    IconButton,
    Select,
    SimpleGrid,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    Tooltip,
    useToast,
} from "@chakra-ui/react";
import { BellAlertIcon, CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
    getJobOrders,
    getServiceReminders,
    sendServiceReminder,
    type JobOrder,
    type ServiceReminder,
} from "../../../api/JobOrderManagement/jobOrderApi";
import PageHeader from "../PageHeader";
import { EmptyState, LoadingState, Panel } from "../ui";
import { useDetails } from "../Details/detailsContext";
import CustomerAvatar from "../Customers/CustomerAvatar";
import DetailsLink from "../Details/DetailsLink";
import { serviceLabel } from "../../Admin/JobOrders/inspectionTemplate";

const STATUS_COLOR: Record<string, string> = {
    pending: "yellow",
    assigned: "purple",
    in_progress: "blue",
    completed: "green",
    cancelled: "red",
};

const DAY_MS = 86400000;

const startOfWeek = (date: Date) => {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = (result.getDay() + 6) % 7;
    result.setDate(result.getDate() - day);
    return result;
};

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const staffName = (job: JobOrder) => [job.assignedStaff?.first_name, job.assignedStaff?.last_name].filter(Boolean).join(" ") || "Unassigned";

const vehicleShort = (job: JobOrder) => [job.vehicle?.brand?.brand, job.vehicle?.model?.model].filter(Boolean).join(" ") || "Vehicle";

const jobDays = (job: JobOrder): [Date, Date] => {
    const start = new Date(job.start_job ?? job.scheduled_at ?? job.created_at ?? Date.now());
    const endSource = job.finish_job ?? job.estimated_completion ?? null;
    const end = endSource ? new Date(endSource) : start;
    const from = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const to = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return [from, to < from ? from : to];
};

function CalendarTab() {
    const toast = useToast();
    const details = useDetails();
    const [jobs, setJobs] = useState<JobOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [showDone, setShowDone] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setJobs(await getJobOrders());
        } catch {
            toast({ title: "Could not load job orders.", status: "error", duration: 3000 });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        load();
    }, [load]);

    const days = useMemo(() => Array.from({ length: 7 }, (_, index) => new Date(weekStart.getTime() + index * DAY_MS)), [weekStart]);
    const weekEnd = days[6];
    const today = dayKey(new Date());

    const visible = jobs.filter((job) => job.status !== "cancelled" && (showDone || job.status !== "completed"));
    const rows = useMemo(() => {
        const map = new Map<string, { name: string; role?: string; jobs: JobOrder[] }>();
        visible.forEach((job) => {
            const [from, to] = jobDays(job);
            if (to < weekStart || from > weekEnd) return;
            const key = String(job.assigned_staff_id ?? 0);
            const row = map.get(key) ?? { name: staffName(job), role: job.assignedStaff?.user?.role?.name, jobs: [] };
            row.jobs.push(job);
            map.set(key, row);
        });
        return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    }, [visible, weekStart, weekEnd]);

    const total = rows.reduce((sum, row) => sum + row.jobs.length, 0);
    const label = `${weekStart.toLocaleDateString("en-PH", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}`;

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={4} gap={3} wrap="wrap">
                <HStack spacing={2}>
                    <IconButton aria-label="Previous week" size="sm" variant="outline" icon={<ChevronLeftIcon width={16} />} onClick={() => setWeekStart(new Date(weekStart.getTime() - 7 * DAY_MS))} />
                    <Button size="sm" variant="outline" onClick={() => setWeekStart(startOfWeek(new Date()))}>
                        This week
                    </Button>
                    <IconButton aria-label="Next week" size="sm" variant="outline" icon={<ChevronRightIcon width={16} />} onClick={() => setWeekStart(new Date(weekStart.getTime() + 7 * DAY_MS))} />
                    <Text fontWeight="800" ml={2}>
                        {label}
                    </Text>
                </HStack>
                <HStack spacing={3}>
                    <Badge colorScheme="blue" variant="subtle">
                        {total} job{total === 1 ? "" : "s"} this week
                    </Badge>
                    <ButtonGroup size="xs" isAttached variant="outline">
                        <Button variant={showDone ? "outline" : "solid"} colorScheme={showDone ? "gray" : "brand"} onClick={() => setShowDone(false)}>
                            Active
                        </Button>
                        <Button variant={showDone ? "solid" : "outline"} colorScheme={showDone ? "brand" : "gray"} onClick={() => setShowDone(true)}>
                            Include done
                        </Button>
                    </ButtonGroup>
                </HStack>
            </Flex>

            {loading ? (
                <LoadingState label="Loading schedule…" />
            ) : rows.length === 0 ? (
                <EmptyState icon={CalendarDaysIcon} title="Nothing scheduled this week" message="Job orders appear here by their schedule, start and estimated completion dates." />
            ) : (
                <Box overflowX="auto" border="1px solid" borderColor="gray.200" borderRadius="xl">
                    <Grid templateColumns="200px repeat(7, minmax(130px, 1fr))" minW="1110px">
                        <Box bg="gray.50" px={3} py={2.5} borderBottom="1px solid" borderColor="gray.200" fontSize="xs" fontWeight="700" color="gray.500">
                            STAFF
                        </Box>
                        {days.map((day) => {
                            const isToday = dayKey(day) === today;
                            return (
                                <Box key={day.toISOString()} bg={isToday ? "brand.50" : "gray.50"} px={2} py={2} borderBottom="1px solid" borderLeft="1px solid" borderColor="gray.200" textAlign="center">
                                    <Text fontSize="2xs" fontWeight="700" color={isToday ? "brand.600" : "gray.500"} textTransform="uppercase">
                                        {day.toLocaleDateString("en-PH", { weekday: "short" })}
                                    </Text>
                                    <Text fontSize="lg" fontWeight="800" color={isToday ? "brand.600" : "gray.800"} lineHeight="1.2">
                                        {day.getDate()}
                                    </Text>
                                </Box>
                            );
                        })}

                        {rows.map((row) => (
                            <Box key={row.name} display="contents">
                                <Flex px={3} py={3} borderBottom="1px solid" borderColor="gray.100" align="flex-start" gap={2.5}>
                                    <Avatar size="sm" name={row.name} bg={row.role?.toLowerCase() === "washer" ? "teal.500" : "blue.500"} color="white" />
                                    <Box minW={0}>
                                        <Text fontSize="sm" fontWeight="700" noOfLines={1}>
                                            {row.name}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                            {row.role ?? "Staff"} · {row.jobs.length} job{row.jobs.length === 1 ? "" : "s"}
                                        </Text>
                                    </Box>
                                </Flex>
                                {days.map((day) => {
                                    const dayJobs = row.jobs.filter((job) => {
                                        const [from, to] = jobDays(job);
                                        return day >= from && day <= to;
                                    });
                                    return (
                                        <Stack key={day.toISOString()} spacing={1.5} p={1.5} borderBottom="1px solid" borderLeft="1px solid" borderColor="gray.100" bg={dayKey(day) === today ? "brand.50" : undefined} minH="72px">
                                            {dayJobs.map((job) => {
                                                const color = STATUS_COLOR[job.status] ?? "gray";
                                                const time = job.scheduled_at ? new Date(job.scheduled_at).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" }) : null;
                                                return (
                                                    <Tooltip key={job.id} label={`${job.job_order_no} · ${vehicleShort(job)} · ${job.status.replace("_", " ")}`} hasArrow openDelay={300}>
                                                        <Box
                                                            as="button"
                                                            textAlign="left"
                                                            px={2}
                                                            py={1.5}
                                                            borderRadius="md"
                                                            bg={`${color}.50`}
                                                            borderLeft="3px solid"
                                                            borderColor={`${color}.400`}
                                                            _hover={{ bg: `${color}.100` }}
                                                            onClick={() => details?.open("jobOrder", job.id)}
                                                        >
                                                            <Text fontSize="2xs" fontWeight="800" color={`${color}.800`} noOfLines={1}>
                                                                {job.job_order_no}
                                                                {time && ` · ${time}`}
                                                            </Text>
                                                            <Text fontSize="2xs" color="gray.600" noOfLines={1}>
                                                                {vehicleShort(job)}
                                                            </Text>
                                                        </Box>
                                                    </Tooltip>
                                                );
                                            })}
                                        </Stack>
                                    );
                                })}
                            </Box>
                        ))}
                    </Grid>
                </Box>
            )}

            <HStack spacing={4} mt={3} wrap="wrap">
                {Object.entries(STATUS_COLOR)
                    .filter(([status]) => status !== "cancelled")
                    .map(([status, color]) => (
                        <HStack key={status} spacing={1.5}>
                            <Box boxSize="10px" borderRadius="sm" bg={`${color}.400`} />
                            <Text fontSize="xs" color="gray.600" textTransform="capitalize">
                                {status.replace("_", " ")}
                            </Text>
                        </HStack>
                    ))}
            </HStack>
        </Box>
    );
}

function RemindersTab() {
    const toast = useToast();
    const [days, setDays] = useState(30);
    const [rows, setRows] = useState<ServiceReminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setRows(await getServiceReminders(days));
        } catch {
            toast({ title: "Could not load service reminders.", status: "error", duration: 3000 });
        } finally {
            setLoading(false);
        }
    }, [days, toast]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSend = async (row: ServiceReminder) => {
        setSending(row.inspection_id);
        try {
            const message = await sendServiceReminder(row.inspection_id);
            toast({ title: message, status: "success", duration: 2500 });
            load();
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast({ title: message ?? "Could not send the reminder.", status: "error", duration: 3500 });
        } finally {
            setSending(null);
        }
    };

    const overdue = rows.filter((row) => row.days_left < 0).length;

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={4} gap={3} wrap="wrap">
                <HStack spacing={2}>
                    <Badge colorScheme="red">{overdue} overdue</Badge>
                    <Badge colorScheme="orange">{rows.length - overdue} upcoming</Badge>
                </HStack>
                <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.600">
                        Due within
                    </Text>
                    <Select size="sm" w="auto" value={days} onChange={(event) => setDays(Number(event.target.value))}>
                        <option value={7}>7 days</option>
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={180}>6 months</option>
                    </Select>
                </HStack>
            </Flex>

            {loading ? (
                <LoadingState label="Loading reminders…" />
            ) : rows.length === 0 ? (
                <EmptyState icon={BellAlertIcon} title="No vehicles due for service" message="Vehicles appear here from the next service date set during inspection." />
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={3}>
                    {rows.map((row) => {
                        const late = row.days_left < 0;
                        const soon = row.days_left <= 3;
                        const color = late ? "red" : soon ? "orange" : "blue";
                        const vehicle = [row.vehicle?.year_model, row.vehicle?.brand?.brand, row.vehicle?.model?.model].filter(Boolean).join(" ");
                        return (
                            <Box key={row.inspection_id} border="1px solid" borderColor="gray.200" borderTop="4px solid" borderTopColor={`${color}.400`} borderRadius="xl" p={4} bg="white">
                                <Flex justify="space-between" align="flex-start" gap={2} mb={3}>
                                    <Box minW={0}>
                                        <DetailsLink type="vehicle" id={row.vehicle?.id} fontWeight="700" fontSize="sm" noOfLines={1}>
                                            {vehicle || "Vehicle"}
                                        </DetailsLink>
                                        <Text fontSize="xs" color="gray.500">
                                            {row.vehicle?.specs?.plate_number ?? row.vehicle?.stock_no} · from <DetailsLink type="jobOrder" id={row.job_order_id}>{row.job_order_no}</DetailsLink>
                                        </Text>
                                    </Box>
                                    <Badge colorScheme={color} flexShrink={0}>
                                        {late ? `${Math.abs(row.days_left)}d overdue` : row.days_left === 0 ? "Today" : `in ${row.days_left}d`}
                                    </Badge>
                                </Flex>
                                {row.customer ? (
                                    <CustomerAvatar customer={row.customer} size="xs" withName subtitle={row.customer.mobile_number} />
                                ) : (
                                    <Text fontSize="xs" color="gray.500">
                                        Shop vehicle
                                    </Text>
                                )}
                                <Text fontSize="sm" mt={3}>
                                    <b>Due {new Date(row.next_service_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</b>
                                    {row.service_required && ` · ${row.service_required}`}
                                </Text>
                                {row.recommended_services.length > 0 && (
                                    <Flex gap={1} wrap="wrap" mt={2}>
                                        {row.recommended_services.slice(0, 4).map((service) => (
                                            <Badge key={service} colorScheme="yellow" variant="subtle" fontSize="2xs" textTransform="none">
                                                {serviceLabel(service)}
                                            </Badge>
                                        ))}
                                    </Flex>
                                )}
                                <Flex justify="space-between" align="center" mt={4} pt={3} borderTop="1px solid" borderColor="gray.100">
                                    <Text fontSize="xs" color="gray.500">
                                        {row.reminder_sent_at ? `Reminded ${new Date(row.reminder_sent_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}` : "Not reminded yet"}
                                    </Text>
                                    <Button size="xs" colorScheme="brand" variant={row.reminder_sent_at ? "outline" : "solid"} leftIcon={<BellAlertIcon width={14} />} isDisabled={!row.customer} isLoading={sending === row.inspection_id} onClick={() => handleSend(row)}>
                                        {row.reminder_sent_at ? "Remind again" : "Send reminder"}
                                    </Button>
                                </Flex>
                            </Box>
                        );
                    })}
                </SimpleGrid>
            )}
        </Box>
    );
}

export default function SchedulePage() {
    return (
        <Stack spacing={4}>
            <PageHeader title="Schedule" subtitle="Who is working on what this week, and which customers are due for service." />
            <Panel p={{ base: 3, md: 5 }}>
                <Tabs colorScheme="brand" isLazy>
                    <TabList mb={4}>
                        <Tab fontWeight="600" gap={2}>
                            <WrenchScrewdriverIcon width={16} />
                            Work calendar
                        </Tab>
                        <Tab fontWeight="600" gap={2}>
                            <BellAlertIcon width={16} />
                            Due for service
                        </Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel p={0}>
                            <CalendarTab />
                        </TabPanel>
                        <TabPanel p={0}>
                            <RemindersTab />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Panel>
        </Stack>
    );
}
