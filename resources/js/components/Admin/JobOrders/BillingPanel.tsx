import {
    Badge,
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    IconButton,
    Input,
    InputGroup,
    InputLeftAddon,
    InputRightAddon,
    NumberInput,
    NumberInputField,
    Progress,
    Select,
    SimpleGrid,
    Text,
    useToast,
} from "@chakra-ui/react";
import { ArrowDownTrayIcon, BanknotesIcon, ShieldCheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import {
    addJobOrderPayment,
    deleteJobOrderPayment,
    downloadInvoicePdf,
    updateWarranty,
    type JobOrder,
    type PaymentMethod,
} from "../../../api/JobOrderManagement/jobOrderApi";
import { PAYMENT_BADGE, getJobOrderCosts } from "./jobOrderHelpers";

interface Props {
    jobOrder: JobOrder;
    onChanged: () => void;
    office: boolean;
}

const METHODS: { value: PaymentMethod; label: string }[] = [
    { value: "cash", label: "Cash" },
    { value: "gcash", label: "GCash" },
    { value: "bank_transfer", label: "Bank transfer" },
    { value: "card", label: "Card" },
    { value: "other", label: "Other" },
];

const WARRANTY_PRESETS = [7, 30, 90, 180];

const peso = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value || 0);

const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";

const errorMessage = (error: unknown, fallback: string) =>
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

export default function BillingPanel({ jobOrder, onChanged, office }: Props) {
    const toast = useToast();
    const costs = getJobOrderCosts(jobOrder);
    const total = jobOrder.total_cost ?? costs.total;
    const paid = jobOrder.amount_paid ?? 0;
    const balance = jobOrder.balance ?? Math.max(total - paid, 0);
    const status = PAYMENT_BADGE[jobOrder.payment_status ?? "not_billed"];
    const completed = jobOrder.status === "completed";
    const [amount, setAmount] = useState<number | null>(balance || null);
    const [method, setMethod] = useState<PaymentMethod>("cash");
    const [reference, setReference] = useState("");
    const [warrantyDays, setWarrantyDays] = useState<number | null>(jobOrder.warranty_days ?? null);
    const [warrantyKm, setWarrantyKm] = useState<number | null>(jobOrder.warranty_km ?? null);
    const [busy, setBusy] = useState("");

    const run = async (key: string, action: () => Promise<unknown>, success: string, failure: string) => {
        setBusy(key);
        try {
            await action();
            toast({ title: success, status: "success", duration: 2500 });
            onChanged();
        } catch (error) {
            toast({ title: errorMessage(error, failure), status: "error", duration: 4000 });
        } finally {
            setBusy("");
        }
    };

    const handlePay = () => {
        if (!amount || amount <= 0) {
            toast({ title: "Enter the amount received.", status: "warning", duration: 2500 });
            return;
        }
        run(
            "pay",
            () => addJobOrderPayment(jobOrder.id, { amount, method, reference_no: reference.trim() || null }),
            "Payment recorded.",
            "Could not record the payment."
        ).then(() => setReference(""));
    };

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={3} gap={2} wrap="wrap">
                <HStack spacing={2}>
                    <Badge colorScheme={status.color} fontSize="sm" px={3} py={1} borderRadius="full">
                        {status.label}
                    </Badge>
                    {jobOrder.invoice_no && (
                        <Badge variant="outline" fontSize="xs">
                            {jobOrder.invoice_no}
                        </Badge>
                    )}
                </HStack>
                {completed && (
                    <Button
                        size="sm"
                        variant="outline"
                        colorScheme="brand"
                        leftIcon={<ArrowDownTrayIcon width={16} />}
                        isLoading={busy === "invoice"}
                        onClick={() => run("invoice", () => downloadInvoicePdf(jobOrder), "Invoice downloaded.", "Could not download the invoice.")}
                    >
                        Invoice PDF
                    </Button>
                )}
            </Flex>

            {!completed ? (
                <Text fontSize="sm" color="gray.500">
                    The invoice is created when the job is marked completed.
                </Text>
            ) : (
                <>
                    <SimpleGrid columns={3} spacing={2} mb={2}>
                        {[
                            { label: "Total", value: total, color: "gray.900" },
                            { label: "Paid", value: paid, color: "green.600" },
                            { label: "Balance", value: balance, color: balance > 0 ? "red.600" : "green.600" },
                        ].map((item) => (
                            <Box key={item.label} bg="gray.50" borderRadius="md" p={2.5} textAlign="center">
                                <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="700">
                                    {item.label}
                                </Text>
                                <Text fontSize="sm" fontWeight="800" color={item.color}>
                                    {peso(item.value)}
                                </Text>
                            </Box>
                        ))}
                    </SimpleGrid>
                    <Progress value={total > 0 ? (paid / total) * 100 : 100} size="sm" colorScheme={balance > 0 ? "orange" : "green"} borderRadius="full" mb={4} />

                    {(jobOrder.payments ?? []).length > 0 && (
                        <Box mb={4}>
                            {(jobOrder.payments ?? []).map((payment) => (
                                <Flex key={payment.id} align="center" gap={2} py={2} borderBottom="1px solid" borderColor="gray.100" fontSize="sm">
                                    <BanknotesIcon width={16} color="var(--chakra-colors-green-500)" />
                                    <Box flex="1" minW={0}>
                                        <Text fontWeight="600">
                                            {peso(Number(payment.amount))} · {METHODS.find((item) => item.value === payment.method)?.label ?? payment.method}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                            {formatDate(payment.paid_at)}
                                            {payment.reference_no && ` · Ref ${payment.reference_no}`}
                                            {payment.receiver?.username && ` · ${payment.receiver.username}`}
                                        </Text>
                                    </Box>
                                    {office && (
                                        <IconButton
                                            aria-label="Remove payment"
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="red"
                                            icon={<TrashIcon width={14} />}
                                            isLoading={busy === `del-${payment.id}`}
                                            onClick={() => {
                                                if (window.confirm("Remove this payment?")) {
                                                    run(`del-${payment.id}`, () => deleteJobOrderPayment(jobOrder.id, payment.id), "Payment removed.", "Could not remove the payment.");
                                                }
                                            }}
                                        />
                                    )}
                                </Flex>
                            ))}
                        </Box>
                    )}

                    {office && balance > 0 && (
                        <Box border="1px dashed" borderColor="gray.300" borderRadius="lg" p={3} mb={4}>
                            <Text fontSize="sm" fontWeight="700" mb={2}>
                                Record payment
                            </Text>
                            <SimpleGrid columns={2} spacing={2}>
                                <InputGroup size="sm">
                                    <InputLeftAddon>₱</InputLeftAddon>
                                    <NumberInput min={0} max={balance} precision={2} value={amount ?? ""} onChange={(_, value) => setAmount(Number.isNaN(value) ? null : value)} w="full">
                                        <NumberInputField borderLeftRadius={0} />
                                    </NumberInput>
                                </InputGroup>
                                <Select size="sm" value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
                                    {METHODS.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </Select>
                            </SimpleGrid>
                            {method !== "cash" && (
                                <Input size="sm" mt={2} placeholder="Reference number" value={reference} onChange={(event) => setReference(event.target.value)} />
                            )}
                            <HStack mt={2} justify="space-between">
                                <Button size="xs" variant="link" onClick={() => setAmount(balance)}>
                                    Full balance
                                </Button>
                                <Button size="sm" colorScheme="green" onClick={handlePay} isLoading={busy === "pay"}>
                                    Save payment
                                </Button>
                            </HStack>
                        </Box>
                    )}
                </>
            )}

            <Divider my={3} />

            <HStack spacing={2} mb={2}>
                <ShieldCheckIcon width={18} color={jobOrder.warranty_active ? "var(--chakra-colors-green-500)" : "var(--chakra-colors-gray-400)"} />
                <Text fontSize="sm" fontWeight="700">
                    Warranty
                </Text>
                {jobOrder.warranty_until && (
                    <Badge colorScheme={jobOrder.warranty_active ? "green" : "gray"}>{jobOrder.warranty_active ? "Active" : "Expired"}</Badge>
                )}
            </HStack>
            {jobOrder.warranty_days ? (
                <Text fontSize="sm" color="gray.600" mb={office ? 3 : 0}>
                    {jobOrder.warranty_days} days{jobOrder.warranty_km ? ` / ${jobOrder.warranty_km.toLocaleString()} km` : ""}
                    {jobOrder.warranty_until ? ` · until ${formatDate(jobOrder.warranty_until)}` : " · starts when the job is completed"}
                </Text>
            ) : (
                !office && (
                    <Text fontSize="sm" color="gray.500">
                        No warranty on this job.
                    </Text>
                )
            )}
            {office && (
                <Box>
                    <HStack spacing={1.5} mb={2} wrap="wrap">
                        {WARRANTY_PRESETS.map((days) => (
                            <Button key={days} size="xs" borderRadius="full" variant={warrantyDays === days ? "solid" : "outline"} colorScheme={warrantyDays === days ? "green" : "gray"} onClick={() => setWarrantyDays(days)}>
                                {days} days
                            </Button>
                        ))}
                    </HStack>
                    <SimpleGrid columns={2} spacing={2}>
                        <FormControl>
                            <FormLabel fontSize="2xs" color="gray.500" mb={1}>
                                Days
                            </FormLabel>
                            <InputGroup size="sm">
                                <NumberInput min={0} value={warrantyDays ?? ""} onChange={(_, value) => setWarrantyDays(Number.isNaN(value) ? null : value)} w="full">
                                    <NumberInputField borderRightRadius={0} />
                                </NumberInput>
                                <InputRightAddon>days</InputRightAddon>
                            </InputGroup>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="2xs" color="gray.500" mb={1}>
                                Distance
                            </FormLabel>
                            <InputGroup size="sm">
                                <NumberInput min={0} value={warrantyKm ?? ""} onChange={(_, value) => setWarrantyKm(Number.isNaN(value) ? null : value)} w="full">
                                    <NumberInputField borderRightRadius={0} />
                                </NumberInput>
                                <InputRightAddon>km</InputRightAddon>
                            </InputGroup>
                        </FormControl>
                    </SimpleGrid>
                    <Flex justify="flex-end" mt={2}>
                        <Button
                            size="sm"
                            variant="outline"
                            isDisabled={warrantyDays === (jobOrder.warranty_days ?? null) && warrantyKm === (jobOrder.warranty_km ?? null)}
                            isLoading={busy === "warranty"}
                            onClick={() => run("warranty", () => updateWarranty(jobOrder.id, warrantyDays, warrantyKm), "Warranty saved.", "Could not save the warranty.")}
                        >
                            Save warranty
                        </Button>
                    </Flex>
                </Box>
            )}
        </Box>
    );
}
