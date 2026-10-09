import { Box, Button, HStack, Icon, Text, Textarea, useToast } from "@chakra-ui/react";
import { StarIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

import { submitFeedback, type JobOrder } from "../../../api/JobOrderManagement/jobOrderApi";

interface Props {
    jobOrder: JobOrder;
    onChanged: () => void;
    canRate: boolean;
}

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function Stars({ value, size = 5, onChange }: { value: number; size?: number; onChange?: (value: number) => void }) {
    const [hover, setHover] = useState(0);
    const shown = hover || value;

    return (
        <HStack spacing={0.5} onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                    key={star}
                    as={StarIcon}
                    boxSize={size}
                    color={star <= shown ? "yellow.400" : "gray.200"}
                    cursor={onChange ? "pointer" : "default"}
                    transition="transform 0.1s"
                    _hover={onChange ? { transform: "scale(1.15)" } : undefined}
                    onMouseEnter={onChange ? () => setHover(star) : undefined}
                    onClick={onChange ? () => onChange(star) : undefined}
                    aria-label={`${star} star`}
                />
            ))}
        </HStack>
    );
}

export default function FeedbackPanel({ jobOrder, onChanged, canRate }: Props) {
    const toast = useToast();
    const [rating, setRating] = useState(jobOrder.rating ?? 0);
    const [feedback, setFeedback] = useState(jobOrder.feedback ?? "");
    const [editing, setEditing] = useState(!jobOrder.rating);
    const [saving, setSaving] = useState(false);

    if (jobOrder.status !== "completed") {
        return (
            <Text fontSize="sm" color="gray.500">
                {canRate ? "You can rate our service once the job is done." : "The customer can rate the service after completion."}
            </Text>
        );
    }

    const handleSubmit = async () => {
        if (!rating) {
            toast({ title: "Tap a star to rate.", status: "warning", duration: 2000 });
            return;
        }
        setSaving(true);
        try {
            await submitFeedback(jobOrder.id, rating, feedback.trim() || null);
            toast({ title: "Thank you for your feedback!", status: "success", duration: 2500 });
            setEditing(false);
            onChanged();
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast({ title: message ?? "Could not send your rating.", status: "error", duration: 3500 });
        } finally {
            setSaving(false);
        }
    };

    if (canRate && editing) {
        return (
            <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                    How was our service?
                </Text>
                <HStack spacing={3} mb={3}>
                    <Stars value={rating} size={8} onChange={setRating} />
                    <Text fontSize="sm" fontWeight="700" color="gray.700">
                        {LABELS[rating]}
                    </Text>
                </HStack>
                <Textarea size="sm" rows={3} placeholder="Tell us what went well or what we can improve (optional)" value={feedback} onChange={(event) => setFeedback(event.target.value)} />
                <HStack justify="flex-end" mt={2}>
                    {jobOrder.rating && (
                        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                            Cancel
                        </Button>
                    )}
                    <Button size="sm" colorScheme="brand" onClick={handleSubmit} isLoading={saving}>
                        Submit rating
                    </Button>
                </HStack>
            </Box>
        );
    }

    if (!jobOrder.rating) {
        return (
            <Text fontSize="sm" color="gray.500">
                Not rated yet.
            </Text>
        );
    }

    return (
        <Box>
            <HStack spacing={3}>
                <Stars value={jobOrder.rating} />
                <Text fontWeight="800">{jobOrder.rating}/5</Text>
                <Text fontSize="sm" color="gray.500">
                    {LABELS[jobOrder.rating]}
                </Text>
            </HStack>
            {jobOrder.feedback && (
                <Text fontSize="sm" color="gray.700" mt={2} fontStyle="italic">
                    “{jobOrder.feedback}”
                </Text>
            )}
            {canRate && (
                <Button size="xs" variant="link" mt={2} onClick={() => setEditing(true)}>
                    Edit my rating
                </Button>
            )}
        </Box>
    );
}
