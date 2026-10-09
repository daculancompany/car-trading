import {
    Alert,
    AlertDescription,
    AlertIcon,
    Badge,
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    InputGroup,
    InputLeftAddon,
    NumberInput,
    NumberInputField,
    SimpleGrid,
    Text,
    Textarea,
    useToast,
} from "@chakra-ui/react";
import { CheckCircleIcon, PaperAirplaneIcon, PhoneIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { respondEstimate, sendEstimate, type JobOrder } from "../../../api/JobOrderManagement/jobOrderApi";
import { ESTIMATE_BADGE, getJobOrderCosts } from "./jobOrderHelpers";

interface Props {
    jobOrder: JobOrder;
    onChanged: () => void;
    mode: "office" | "customer" | "view";
}

const peso = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value || 0);

const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : "—";

const errorMessage = (error: unknown, fallback: string) =>
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

export default function EstimatePanel({ jobOrder, onChanged, mode }: Props) {
    const toast = useToast();
    const status = jobOrder.estimate_status ?? "none";
    const badge = ESTIMATE_BADGE[status];
    const inspection = jobOrder.inspection;
    const suggested = Number(inspection?.estimated_cost ?? 0) || Number(jobOrder.estimated_labor_cost ?? 0) + getJobOrderCosts(jobOrder).parts;
    const [amount, setAmount] = useState<number | null>(jobOrder.estimate_amount != null ? Number(jobOrder.estimate_amount) : suggested || null);
    const [note, setNote] = useState(jobOrder.estimate_note ?? inspection?.recommendation ?? "");
    const [reply, setReply] = useState("");
    const [composing, setComposing] = useState(status === "none" || status === "declined");
    const [busy, setBusy] = useState<"" | "send" | "approve" | "decline">("");
    const editable = ["pending", "assigned"].includes(jobOrder.status);
    const amountValue = Number(jobOrder.estimate_amount ?? 0);

    const handleSend = async () => {
        if (amount == null || amount < 0) {
            toast({ title: "Enter the estimated amount.", status: "warning", duration: 2500 });
            return;
        }
        setBusy("send");
        try {
            await sendEstimate(jobOrder.id, amount, note.trim() || null);
            toast({ title: "Estimate sent to the customer.", status: "success", duration: 2500 });
            setComposing(false);
            onChanged();
        } catch (error) {
            toast({ title: errorMessage(error, "Could not send the estimate."), status: "error", duration: 4000 });
        } finally {
            setBusy("");
        }
    };

    const handleRespond = async (decision: "approve" | "decline") => {
        if (decision === "decline" && !reply.trim()) {
            toast({ title: mode === "customer" ? "Tell us why you are declining." : "Add the customer's reason.", status: "warning", duration: 2500 });
            return;
        }
        setBusy(decision);
        try {
            await respondEstimate(jobOrder.id, decision, reply.trim() || null);
            toast({ title: decision === "approve" ? "Estimate approved." : "Estimate declined.", status: "success", duration: 2500 });
            setReply("");
            onChanged();
        } catch (error) {
            toast({ title: errorMessage(error, "Could not save your response."), status: "error", duration: 4000 });
        } finally {
            setBusy("");
        }
    };

    if (!inspection && status === "none") {
        return (
            <Text fontSize="sm" color="gray.500">
                {mode === "customer"
                    ? "After our mechanic inspects your vehicle, we will send you the estimated cost here for your approval."
                    : "Inspect the vehicle first. The estimate is sent to the customer after the inspection."}
            </Text>
        );
    }

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={3} gap={3} wrap="wrap">
                <Badge colorScheme={badge.color} fontSize="sm" px={3} py={1} borderRadius="full">
                    {badge.label}
                </Badge>
                {jobOrder.estimate_sent_at && (
                    <Text fontSize="xs" color="gray.500">
                        Sent {formatDate(jobOrder.estimate_sent_at)}
                        {jobOrder.estimate_responded_at && ` · answered ${formatDate(jobOrder.estimate_responded_at)}`}
                    </Text>
                )}
            </Flex>

            {status !== "none" && (
                <Flex
                    bg={status === "approved" ? "green.50" : status === "declined" ? "red.50" : "orange.50"}
                    border="1px solid"
                    borderColor={status === "approved" ? "green.200" : status === "declined" ? "red.200" : "orange.200"}
                    borderRadius="lg"
                    p={4}
                    gap={4}
                    direction={{ base: "column", md: "row" }}
                    mb={3}
                >
                    <Box minW="160px">
                        <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="700">
                            Estimated cost
                        </Text>
                        <Text fontSize="2xl" fontWeight="800" color="gray.900">
                            {peso(amountValue)}
                        </Text>
                    </Box>
                    <Box flex="1" minW={0}>
                        {jobOrder.estimate_note && (
                            <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
                                {jobOrder.estimate_note}
                            </Text>
                        )}
                        {jobOrder.estimate_response_note && (
                            <Text fontSize="sm" color="gray.600" mt={2}>
                                <b>{mode === "customer" ? "Your reply" : "Customer reply"}:</b> {jobOrder.estimate_response_note}
                            </Text>
                        )}
                        {status !== "pending" && jobOrder.estimate_responder?.username && mode !== "customer" && (
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                Recorded by {jobOrder.estimate_responder.username}
                            </Text>
                        )}
                    </Box>
                </Flex>
            )}

            {status === "pending" && mode === "customer" && (
                <Box border="2px solid" borderColor="orange.300" borderRadius="lg" p={4}>
                    <Text fontWeight="700" mb={1}>
                        Do you approve this estimate?
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={3}>
                        Work starts only after you approve. The final bill may change slightly if extra parts are needed; we will call you first.
                    </Text>
                    <Textarea size="sm" rows={2} placeholder="Message for the shop (required if declining)" value={reply} onChange={(event) => setReply(event.target.value)} mb={3} />
                    <HStack>
                        <Button colorScheme="green" leftIcon={<CheckCircleIcon width={18} />} onClick={() => handleRespond("approve")} isLoading={busy === "approve"} isDisabled={busy !== ""}>
                            Approve
                        </Button>
                        <Button colorScheme="red" variant="outline" leftIcon={<XCircleIcon width={18} />} onClick={() => handleRespond("decline")} isLoading={busy === "decline"} isDisabled={busy !== ""}>
                            Decline
                        </Button>
                    </HStack>
                </Box>
            )}

            {status === "pending" && mode === "office" && (
                <Alert status="info" borderRadius="lg" alignItems="flex-start">
                    <AlertIcon />
                    <Box flex="1">
                        <AlertDescription fontSize="sm">Waiting for the customer to approve in their account. If they answered by phone or in person, record it here.</AlertDescription>
                        <Textarea size="sm" bg="white" rows={2} mt={2} placeholder="e.g. Customer called and approved" value={reply} onChange={(event) => setReply(event.target.value)} />
                        <HStack mt={2} wrap="wrap">
                            <Button size="sm" colorScheme="green" leftIcon={<PhoneIcon width={14} />} onClick={() => handleRespond("approve")} isLoading={busy === "approve"} isDisabled={busy !== ""}>
                                Approved by customer
                            </Button>
                            <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleRespond("decline")} isLoading={busy === "decline"} isDisabled={busy !== ""}>
                                Declined by customer
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setComposing(true)}>
                                Revise estimate
                            </Button>
                        </HStack>
                    </Box>
                </Alert>
            )}

            {mode === "office" && editable && (composing || status === "declined") && (
                <Box border="1px solid" borderColor="gray.200" borderRadius="lg" p={4} mt={status === "none" ? 0 : 3}>
                    <Text fontWeight="700" mb={3}>
                        {status === "none" ? "Send estimate to customer" : "Send a revised estimate"}
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isRequired>
                            <FormLabel fontSize="sm">Estimated total</FormLabel>
                            <InputGroup>
                                <InputLeftAddon fontWeight="700">₱</InputLeftAddon>
                                <NumberInput min={0} precision={2} value={amount ?? ""} onChange={(_, value) => setAmount(Number.isNaN(value) ? null : value)} w="full">
                                    <NumberInputField borderLeftRadius={0} fontWeight="700" />
                                </NumberInput>
                            </InputGroup>
                            {suggested > 0 && (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    Suggested from the inspection: {peso(suggested)}
                                </Text>
                            )}
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">What is included</FormLabel>
                            <Textarea size="sm" rows={3} placeholder="e.g. Replace front brake pads + labor" value={note} onChange={(event) => setNote(event.target.value)} />
                        </FormControl>
                    </SimpleGrid>
                    <Flex justify="flex-end" gap={2} mt={3}>
                        {status !== "none" && (
                            <Button size="sm" variant="ghost" onClick={() => setComposing(false)}>
                                Cancel
                            </Button>
                        )}
                        <Button size="sm" colorScheme="brand" leftIcon={<PaperAirplaneIcon width={16} />} onClick={handleSend} isLoading={busy === "send"}>
                            Send to customer
                        </Button>
                    </Flex>
                </Box>
            )}

            {status === "approved" && mode === "customer" && jobOrder.status !== "completed" && (
                <Text fontSize="sm" color="green.700">
                    Thank you! Our mechanic will start the work.
                </Text>
            )}
        </Box>
    );
}
