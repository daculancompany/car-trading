import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    Progress,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Text,
    Textarea,
    useToast,
} from "@chakra-ui/react";
import { useState } from "react";

import { addJobOrderUpdate, type JobOrder } from "../../../api/JobOrderManagement/jobOrderApi";
import MultiPhotoInput, { type PendingPhoto } from "./MultiPhotoInput";
import { progressColor } from "./jobOrderHelpers";

interface Props {
    jobOrder: JobOrder;
    onChanged: () => void;
    readOnly?: boolean;
}

const QUICK_STEPS = [25, 50, 75, 90];

export default function JobOrderProgressPanel({ jobOrder, onChanged, readOnly = false }: Props) {
    const toast = useToast();
    const current = jobOrder.progress ?? 0;
    const [open, setOpen] = useState(false);
    const [progress, setProgress] = useState(current);
    const [comment, setComment] = useState("");
    const [photos, setPhotos] = useState<PendingPhoto[]>([]);
    const [saving, setSaving] = useState(false);

    const canPost = !readOnly && jobOrder.status === "in_progress";

    const reset = () => {
        setProgress(current);
        setComment("");
        setPhotos([]);
    };

    const handlePost = async () => {
        if (!comment.trim()) {
            toast({ title: "Write what was done.", status: "warning", duration: 3000 });
            return;
        }

        try {
            setSaving(true);
            await addJobOrderUpdate(jobOrder.id, {
                progress,
                comment: comment.trim(),
                photos: photos.map((photo) => photo.file),
            });
            toast({ title: "Progress update posted.", status: "success", duration: 2500 });
            setOpen(false);
            setComment("");
            setPhotos([]);
            onChanged();
        } catch (error: any) {
            toast({ title: error?.response?.data?.message ?? "Could not post the update.", status: "error", duration: 4000 });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" color="gray.600">
                    Overall progress
                </Text>
                <Text fontSize="2xl" fontWeight="800" color={`${progressColor(current)}.600`}>
                    {current}%
                </Text>
            </Flex>
            <Progress value={current} colorScheme={progressColor(current)} borderRadius="full" size="md" hasStripe={canPost} isAnimated={canPost} />

            {canPost && !open && (
                <Button mt={4} size="sm" colorScheme="brand" onClick={() => { reset(); setOpen(true); }}>
                    Post progress update
                </Button>
            )}

            {!canPost && !["completed", "in_progress"].includes(jobOrder.status) && (
                <Text fontSize="xs" color="gray.500" mt={3}>
                    {readOnly ? "Progress will show here once work starts." : "Progress updates can be posted once the job is started."}
                </Text>
            )}

            {canPost && open && (
                <Box mt={4} p={4} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                    <FormControl mb={4}>
                        <FormLabel fontSize="sm" display="flex" justifyContent="space-between">
                            <span>Progress</span>
                            <Text as="span" fontWeight="800" color={`${progressColor(progress)}.600`}>
                                {progress}%
                            </Text>
                        </FormLabel>
                        <Slider value={progress} min={0} max={100} step={5} onChange={setProgress} colorScheme={progressColor(progress)}>
                            <SliderTrack>
                                <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb boxSize={5} />
                        </Slider>
                        <HStack mt={2} spacing={2} wrap="wrap">
                            {QUICK_STEPS.map((step) => (
                                <Button key={step} size="xs" variant={progress === step ? "solid" : "outline"} onClick={() => setProgress(step)}>
                                    {step}%
                                </Button>
                            ))}
                        </HStack>
                    </FormControl>

                    <FormControl isRequired mb={4}>
                        <FormLabel fontSize="sm">What was done</FormLabel>
                        <Textarea
                            bg="white"
                            rows={3}
                            placeholder="e.g. Removed front wheels, replaced brake pads on the left side"
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                        />
                    </FormControl>

                    <MultiPhotoInput photos={photos} onChange={setPhotos} max={10} label="Add photos" />

                    <Flex justify="flex-end" gap={2} mt={4}>
                        <Button size="sm" variant="ghost" onClick={() => setOpen(false)} isDisabled={saving}>
                            Cancel
                        </Button>
                        <Button size="sm" colorScheme="brand" onClick={handlePost} isLoading={saving}>
                            Post update
                        </Button>
                    </Flex>
                </Box>
            )}
        </Box>
    );
}
