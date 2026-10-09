import { Box, Button, Flex, IconButton, Image, Input, Select, SimpleGrid, Text, useToast } from "@chakra-ui/react";
import { CameraIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

export interface PendingPhoto {
    file: File;
    caption: string;
    item: string | null;
}

export interface MultiPhotoInputHandle {
    pick: (item?: string | null) => void;
}

interface MultiPhotoInputProps {
    photos: PendingPhoto[];
    onChange: (photos: PendingPhoto[]) => void;
    itemOptions?: string[];
    max?: number;
    label?: string;
    showButton?: boolean;
    showCaption?: boolean;
}

const MAX_SIZE = 5 * 1024 * 1024;

const MultiPhotoInput = forwardRef<MultiPhotoInputHandle, MultiPhotoInputProps>(function MultiPhotoInput(
    { photos, onChange, itemOptions, max = 10, label = "Add photos", showButton = true, showCaption = true },
    ref
) {
    const toast = useToast();
    const input = useRef<HTMLInputElement>(null);
    const [pendingItem, setPendingItem] = useState<string | null>(null);

    const urls = useMemo(() => photos.map((photo) => URL.createObjectURL(photo.file)), [photos]);

    useEffect(() => () => urls.forEach((url) => URL.revokeObjectURL(url)), [urls]);

    const pick = (item: string | null = null) => {
        setPendingItem(item);
        input.current?.click();
    };

    useImperativeHandle(ref, () => ({ pick }));

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        const valid = Array.from(files).filter((file) => file.size <= MAX_SIZE);

        if (valid.length < files.length) {
            toast({ title: "Some photos are over 5MB and were skipped.", status: "warning", duration: 3000 });
        }

        const room = max - photos.length;

        if (valid.length > room) {
            toast({ title: `You can add up to ${max} photos.`, status: "warning", duration: 3000 });
        }

        onChange([...photos, ...valid.slice(0, Math.max(room, 0)).map((file) => ({ file, caption: "", item: pendingItem }))]);

        if (input.current) input.current.value = "";
    };

    const update = (index: number, patch: Partial<PendingPhoto>) =>
        onChange(photos.map((photo, photoIndex) => (photoIndex === index ? { ...photo, ...patch } : photo)));

    return (
        <Box>
            {showButton && (
                <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<CameraIcon width={16} />}
                    onClick={() => pick(null)}
                    isDisabled={photos.length >= max}
                >
                    {label}
                </Button>
            )}

            <input
                ref={input}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={(event) => handleFiles(event.target.files)}
            />

            {photos.length > 0 && (
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={3} mt={3}>
                    {photos.map((photo, index) => (
                        <Flex key={urls[index]} gap={2} p={2} border="1px" borderColor="gray.200" borderRadius="md" bg="white">
                            <Image src={urls[index]} alt="New photo" boxSize="64px" objectFit="cover" borderRadius="md" flexShrink={0} />
                            <Box flex="1" minW={0}>
                                {itemOptions && itemOptions.length > 0 && (
                                    <Select
                                        size="xs"
                                        mb={1}
                                        value={photo.item ?? ""}
                                        onChange={(event) => update(index, { item: event.target.value || null })}
                                    >
                                        <option value="">General</option>
                                        {itemOptions.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </Select>
                                )}
                                {showCaption && (
                                    <Input
                                        size="xs"
                                        placeholder="Caption (optional)"
                                        value={photo.caption}
                                        onChange={(event) => update(index, { caption: event.target.value })}
                                    />
                                )}
                                <Text fontSize="2xs" color="gray.400" mt={1} noOfLines={1}>
                                    {photo.file.name}
                                </Text>
                            </Box>
                            <IconButton
                                aria-label="Remove photo"
                                size="xs"
                                variant="ghost"
                                icon={<XMarkIcon width={14} />}
                                onClick={() => onChange(photos.filter((_, photoIndex) => photoIndex !== index))}
                            />
                        </Flex>
                    ))}
                </SimpleGrid>
            )}
        </Box>
    );
});

export default MultiPhotoInput;
