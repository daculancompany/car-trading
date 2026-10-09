import { Box, Button, HStack, Tooltip } from "@chakra-ui/react";

import type { InspectionRating } from "../../../api/JobOrderManagement/jobOrderApi";
import { RATING_META } from "./inspectionTemplate";

interface Props {
    value: InspectionRating | null;
    onChange?: (value: InspectionRating) => void;
    allowNa?: boolean;
    size?: number;
    label?: string;
}

const DOTS: InspectionRating[] = ["good", "attention", "urgent"];

export default function StatusDots({ value, onChange, allowNa = true, size = 22, label = "" }: Props) {
    const readOnly = !onChange;

    return (
        <HStack spacing={1.5} role={readOnly ? undefined : "radiogroup"} aria-label={label}>
            {DOTS.map((rating) => {
                const meta = RATING_META[rating];
                const active = value === rating;
                return (
                    <Tooltip key={rating} label={meta.label} hasArrow openDelay={300}>
                        <Box
                            {...(readOnly ? { as: "span" as const } : { as: "button" as const, type: "button" })}
                            role={readOnly ? undefined : "radio"}
                            aria-checked={readOnly ? undefined : active}
                            aria-label={`${label} ${meta.label}`}
                            boxSize={`${size}px`}
                            borderRadius="full"
                            border="2.5px solid"
                            borderColor={meta.hex}
                            bg={active ? meta.hex : "white"}
                            boxShadow={active ? `0 0 0 3px ${meta.hex}33` : undefined}
                            transition="all 0.15s"
                            cursor={readOnly ? "default" : "pointer"}
                            opacity={readOnly && !active ? 0.35 : 1}
                            _hover={readOnly ? undefined : { transform: "scale(1.12)" }}
                            onClick={readOnly ? undefined : () => onChange?.(rating)}
                            flexShrink={0}
                        />
                    </Tooltip>
                );
            })}
            {allowNa && (
                <Button
                    size="xs"
                    h={`${size}px`}
                    minW="34px"
                    px={1.5}
                    variant={value === "na" ? "solid" : "outline"}
                    colorScheme="gray"
                    borderRadius="full"
                    fontSize="2xs"
                    onClick={readOnly ? undefined : () => onChange?.("na")}
                    isDisabled={readOnly && value !== "na"}
                    pointerEvents={readOnly ? "none" : undefined}
                >
                    N/A
                </Button>
            )}
        </HStack>
    );
}
