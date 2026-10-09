import { Avatar, Button, Flex, Text, useToast } from "@chakra-ui/react";
import { useEffect, useMemo, useRef } from "react";

interface PhotoPickerProps {
    currentUrl?: string | null;
    name?: string;
    value: File | null;
    onChange: (file: File | null) => void;
    onRemoveCurrent?: () => void;
    isLoading?: boolean;
    size?: "lg" | "xl" | "2xl";
}

const MAX_SIZE = 5 * 1024 * 1024;

export default function PhotoPicker({
    currentUrl,
    name,
    value,
    onChange,
    onRemoveCurrent,
    isLoading = false,
    size = "xl",
}: PhotoPickerProps) {
    const toast = useToast();
    const fileInput = useRef<HTMLInputElement>(null);
    const preview = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleFile = (file?: File) => {
        if (fileInput.current) fileInput.current.value = "";
        if (!file) return;

        if (file.size > MAX_SIZE) {
            toast({ title: "Photo must be 5MB or smaller.", status: "warning", duration: 3000 });
            return;
        }

        onChange(file);
    };

    const shown = preview ?? currentUrl ?? undefined;

    return (
        <Flex align="center" gap={4}>
            <Avatar
                size={size}
                name={name || undefined}
                src={shown}
                bg="brand.500"
                color="white"
                cursor="pointer"
                onClick={() => fileInput.current?.click()}
            />

            <Flex direction="column" gap={2} align="flex-start">
                <Flex gap={2} wrap="wrap">
                    <Button size="sm" variant="outline" isLoading={isLoading} onClick={() => fileInput.current?.click()}>
                        {shown ? "Change Photo" : "Upload Photo"}
                    </Button>

                    {value && (
                        <Button size="sm" variant="ghost" onClick={() => onChange(null)} isDisabled={isLoading}>
                            Cancel
                        </Button>
                    )}

                    {!value && currentUrl && onRemoveCurrent && (
                        <Button size="sm" variant="ghost" colorScheme="red" onClick={onRemoveCurrent} isDisabled={isLoading}>
                            Remove
                        </Button>
                    )}
                </Flex>

                <Text fontSize="xs" color="gray.500">
                    JPG, PNG or WEBP, up to 5MB.
                </Text>
            </Flex>

            <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
            />
        </Flex>
    );
}
