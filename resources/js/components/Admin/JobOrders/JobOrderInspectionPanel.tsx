import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Badge,
    Box,
    Button,
    Flex,
    HStack,
    Text,
    Textarea,
    useToast,
} from "@chakra-ui/react";
import { CameraIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { decideInspection, type JobOrder } from "../../../api/JobOrderManagement/jobOrderApi";
import InspectionForm from "./InspectionForm";
import InspectionReport from "./InspectionReport";
import { getInspectionState, isOfficeUser, resultInfo } from "./jobOrderHelpers";

interface Props {
    jobOrder: JobOrder;
    onChanged: () => void;
    readOnly?: boolean;
}

const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function JobOrderInspectionPanel({ jobOrder, onChanged, readOnly = false }: Props) {
    const toast = useToast();
    const inspection = jobOrder.inspection ?? null;
    const state = getInspectionState(jobOrder);
    const office = isOfficeUser() && !readOnly;
    const canEdit = !readOnly && ["pending", "assigned"].includes(jobOrder.status);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [decisionNote, setDecisionNote] = useState("");

    const startEditing = () => setEditing(true);

    const handleDecision = async (decision: "proceed" | "cancel") => {
        if (decision === "cancel" && !window.confirm("Cancel this job order? The customer request will be cancelled too.")) return;

        try {
            setSaving(true);
            await decideInspection(jobOrder.id, decision, decisionNote.trim() || undefined);
            toast({ title: decision === "cancel" ? "Job order cancelled." : "Work can now start.", status: "success", duration: 2500 });
            onChanged();
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast({ title: message ?? "Could not save the decision.", status: "error", duration: 4000 });
        } finally {
            setSaving(false);
        }
    };

    if (state === "not_required" && !editing) {
        return (
            <Text fontSize="sm" color="gray.500">
                No inspection needed for {jobOrder.work_type} jobs.
            </Text>
        );
    }

    if (!inspection && !editing) {
        return (
            <Flex
                direction={{ base: "column", md: "row" }}
                align={{ md: "center" }}
                justify="space-between"
                gap={3}
                bg="yellow.50"
                border="1px dashed"
                borderColor="yellow.300"
                borderRadius="lg"
                px={4}
                py={4}
            >
                <Box>
                    <Text fontWeight="700" color="yellow.800">
                        {readOnly ? "Waiting for vehicle inspection" : "Inspect the vehicle before starting"}
                    </Text>
                    <Text fontSize="sm" color="yellow.700">
                        {readOnly
                            ? "A mechanic will check your vehicle first to confirm the problem before any work starts."
                            : "Check what is really wrong. Customers sometimes report problems that are not there."}
                    </Text>
                </Box>
                {canEdit && (
                    <Button colorScheme="yellow" leftIcon={<CameraIcon width={16} />} onClick={startEditing} flexShrink={0}>
                        Start inspection
                    </Button>
                )}
            </Flex>
        );
    }

    if (editing) {
        return (
            <InspectionForm
                jobOrder={jobOrder}
                onCancel={() => setEditing(false)}
                onSaved={() => {
                    setEditing(false);
                    onChanged();
                }}
            />
        );
    }

    if (!inspection) return null;

    const info = resultInfo(inspection.result);

    return (
        <Box>
            <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={3} mb={4} direction={{ base: "column", md: "row" }}>
                <HStack spacing={3} wrap="wrap">
                    <Badge colorScheme={info?.color} fontSize="sm" px={3} py={1} borderRadius="full">
                        {info?.label}
                    </Badge>
                    <Text fontSize="sm" color="gray.500">
                        by <b>{inspection.inspector?.username ?? "—"}</b> · {formatDate(inspection.inspected_at)}
                        {inspection.odometer != null && ` · ${inspection.odometer.toLocaleString()} km`}
                    </Text>
                </HStack>
                {canEdit && (
                    <Button size="sm" variant="outline" onClick={startEditing}>
                        Edit inspection
                    </Button>
                )}
            </Flex>

            {state === "awaiting_decision" && (
                <Alert status="warning" borderRadius="lg" mb={4} alignItems="flex-start">
                    <AlertIcon />
                    <Box flex="1">
                        <AlertTitle fontSize="sm">No problem found on this vehicle</AlertTitle>
                        <AlertDescription fontSize="sm">
                            {readOnly
                                ? "Our mechanic could not find the reported problem. The shop will contact you about the next step."
                                : "The office must decide whether to continue the job or cancel it."}
                        </AlertDescription>
                        {office && (
                            <Box mt={3}>
                                <Textarea
                                    size="sm"
                                    bg="white"
                                    rows={2}
                                    placeholder="Note for the decision (e.g. customer called and agreed)"
                                    value={decisionNote}
                                    onChange={(event) => setDecisionNote(event.target.value)}
                                />
                                <HStack mt={2}>
                                    <Button size="sm" colorScheme="teal" onClick={() => handleDecision("proceed")} isLoading={saving}>
                                        Proceed anyway
                                    </Button>
                                    <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleDecision("cancel")} isLoading={saving}>
                                        Cancel job order
                                    </Button>
                                </HStack>
                            </Box>
                        )}
                    </Box>
                </Alert>
            )}

            {inspection.office_decision && (
                <Alert status={inspection.office_decision === "proceed" ? "success" : "error"} borderRadius="lg" mb={4}>
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                        Office decided to <b>{inspection.office_decision === "proceed" ? "proceed" : "cancel"}</b>
                        {inspection.decider?.username && ` (${inspection.decider.username})`} · {formatDate(inspection.decided_at)}
                        {inspection.decision_note && ` — ${inspection.decision_note}`}
                    </AlertDescription>
                </Alert>
            )}

            <InspectionReport jobOrder={jobOrder} inspection={inspection} />
        </Box>
    );
}
