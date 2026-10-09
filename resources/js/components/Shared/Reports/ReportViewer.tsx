import {
    Box,
    Button,
    Flex,
    Heading,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    SimpleGrid,
    Spinner,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useToast,
} from "@chakra-ui/react";
import { ArrowDownTrayIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";

import Pagination from "../../../Reusable/Paginations";
import {
    downloadReport,
    getReport,
    type GenericReportResponse,
    type ReportDateRange,
} from "../../../api/Reports/reportApi";
import type { ReportDefinition } from "./reportDefinitions";

const PAGE_SIZE = 10;

const toInputDate = (value: Date) => {
    const local = new Date(value);
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    return local.toISOString().slice(0, 10);
};

const monthStart = () => {
    const now = new Date();
    return toInputDate(new Date(now.getFullYear(), now.getMonth(), 1));
};

const inputStyle = { size: "sm", bg: "white", borderColor: "gray.300", rounded: "md" } as const;

interface ReportViewerProps {
    report: ReportDefinition;
}

export default function ReportViewer({ report }: ReportViewerProps) {
    const toast = useToast();

    const [fromDate, setFromDate] = useState(monthStart);
    const [toDate, setToDate] = useState(() => toInputDate(new Date()));
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [result, setResult] = useState<GenericReportResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const params = useMemo<ReportDateRange>(
        () => (report.dateFiltered ? { from: fromDate || undefined, to: toDate || undefined } : {}),
        [report.dateFiltered, fromDate, toDate]
    );

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setResult(await getReport(report.key, params));
        } catch (error) {
            console.error(`Failed to load ${report.key} report:`, error);
            setResult(null);
            toast({ title: `Failed to load ${report.label} report.`, status: "error", duration: 3000 });
        } finally {
            setLoading(false);
        }
    }, [report.key, report.label, params, toast]);

    useEffect(() => {
        load();
    }, [load]);

    const rows = useMemo(() => result?.data ?? [], [result]);

    const statusOptions = useMemo(() => {
        if (report.statusOptions) return report.statusOptions;
        if (!report.statusOf) return [];

        const values = Array.from(new Set(rows.map((row) => report.statusOf!(row)).filter(Boolean))).sort();
        return values.map((value) => ({ value, label: value }));
    }, [report, rows]);

    const filteredRows = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return rows.filter((row) => {
            const matchesStatus = !status || report.statusOf?.(row) === status;
            const matchesSearch = !keyword || report.searchText(row).toLowerCase().includes(keyword);
            return matchesStatus && matchesSearch;
        });
    }, [rows, status, search, report]);

    const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const hasFilters = Boolean(status || search);

    const clearFilters = () => {
        setStatus("");
        setSearch("");
        setPage(1);
        setFromDate(monthStart());
        setToDate(toInputDate(new Date()));
    };

    const handlePdf = async () => {
        try {
            setDownloading(true);
            const blob = await downloadReport(report.key, params);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${report.key}-report${params.from ? `-${params.from}-${params.to ?? ""}` : ""}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download report:", error);
            toast({ title: "Download failed", description: "Unable to download this report.", status: "error", duration: 4000 });
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Flex direction="column" gap={4} minW={0}>

            <Box layerStyle="panel" px={{ base: 4, md: 5 }} py={4}>
                <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={3} direction={{ base: "column", md: "row" }}>
                    <Box>
                        <Heading size="sm" color="dark.900">
                            {report.label} Report
                        </Heading>
                        <Text fontSize="xs" color="gray.500" mt={0.5}>
                            {report.description}
                            {!report.dateFiltered && " Shows current data."}
                        </Text>
                    </Box>

                    <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        leftIcon={<ArrowDownTrayIcon width={16} height={16} />}
                        onClick={handlePdf}
                        isLoading={downloading}
                        loadingText="PDF"
                        flexShrink={0}
                    >
                        PDF
                    </Button>
                </Flex>

                <Flex mt={4} gap={3} direction={{ base: "column", md: "row" }} wrap="wrap" align={{ md: "flex-end" }}>
                    {report.dateFiltered && (
                        <>
                            <Box>
                                <Text fontSize="2xs" fontWeight="700" color="gray.500" mb={1}>FROM</Text>
                                <Input
                                    {...inputStyle}
                                    type="date"
                                    w={{ base: "100%", md: "150px" }}
                                    value={fromDate}
                                    max={toDate || undefined}
                                    onChange={(e) => {
                                        setFromDate(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </Box>
                            <Box>
                                <Text fontSize="2xs" fontWeight="700" color="gray.500" mb={1}>TO</Text>
                                <Input
                                    {...inputStyle}
                                    type="date"
                                    w={{ base: "100%", md: "150px" }}
                                    value={toDate}
                                    min={fromDate || undefined}
                                    onChange={(e) => {
                                        setToDate(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </Box>
                        </>
                    )}

                    {statusOptions.length > 0 && (
                        <Box>
                            <Text fontSize="2xs" fontWeight="700" color="gray.500" mb={1}>
                                {(report.statusLabel ?? "Status").toUpperCase()}
                            </Text>
                            <Select
                                {...inputStyle}
                                w={{ base: "100%", md: "180px" }}
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">All</option>
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </Box>
                    )}

                    <Box flex="1" minW={{ md: "200px" }}>
                        <Text fontSize="2xs" fontWeight="700" color="gray.500" mb={1}>SEARCH</Text>
                        <InputGroup size="sm">
                            <InputLeftElement pointerEvents="none">
                                <MagnifyingGlassIcon width={16} height={16} style={{ color: "#A0AEC0" }} />
                            </InputLeftElement>
                            <Input
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                bg="white"
                                borderColor="gray.300"
                                rounded="md"
                            />
                        </InputGroup>
                    </Box>

                    <Button size="sm" variant="ghost" onClick={clearFilters}>
                        Clear
                    </Button>
                </Flex>
            </Box>

            {result && (
                <SimpleGrid columns={{ base: 1, sm: 2, xl: Math.min(report.cards(result.summary).length, 5) }} spacing={3}>
                    {report.cards(result.summary).map((card) => (
                        <Box key={card.label} layerStyle="panel" px={4} py={3}>
                            <Text fontSize="2xs" fontWeight="700" color={`${card.color}.600`} textTransform="uppercase" letterSpacing="wide">
                                {card.label}
                            </Text>
                            <Text fontSize="lg" fontWeight="800" color={`${card.color}.700`} mt={0.5} noOfLines={1}>
                                {card.value}
                            </Text>
                        </Box>
                    ))}
                </SimpleGrid>
            )}

            <Box layerStyle="panel" overflow="hidden">
                {loading ? (
                    <Flex justify="center" align="center" minH="240px">
                        <Spinner color="blue.500" />
                    </Flex>
                ) : (
                    <>
                        <TableContainer overflowX="auto">
                            <Table size="sm" variant="simple">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th py={3} fontSize="2xs">#</Th>
                                        {report.columns.map((column) => (
                                            <Th key={column.header} py={3} fontSize="2xs" textAlign={column.align ?? "left"}>
                                                {column.header}
                                            </Th>
                                        ))}
                                    </Tr>
                                </Thead>

                                <Tbody>
                                    {pageRows.length === 0 ? (
                                        <Tr>
                                            <Td colSpan={report.columns.length + 1} textAlign="center" py={10}>
                                                <Text fontSize="sm" color="gray.500">
                                                    {hasFilters ? "No records match the filters." : "No records for this period."}
                                                </Text>
                                            </Td>
                                        </Tr>
                                    ) : (
                                        pageRows.map((row, index) => (
                                            <Tr key={String(row.id ?? index)} _hover={{ bg: "gray.50" }}>
                                                <Td py={3} color="gray.400" fontSize="xs">
                                                    {(page - 1) * PAGE_SIZE + index + 1}
                                                </Td>
                                                {report.columns.map((column) => (
                                                    <Td
                                                        key={column.header}
                                                        py={3}
                                                        fontSize="sm"
                                                        color="gray.700"
                                                        textAlign={column.align ?? "left"}
                                                        whiteSpace="nowrap"
                                                    >
                                                        {column.render(row)}
                                                    </Td>
                                                ))}
                                            </Tr>
                                        ))
                                    )}
                                </Tbody>
                            </Table>
                        </TableContainer>

                        <Pagination
                            currentPage={page}
                            totalItems={filteredRows.length}
                            itemsPerPage={PAGE_SIZE}
                            onPageChange={setPage}
                            itemLabel="record"
                        />
                    </>
                )}
            </Box>
        </Flex>
    );
}
