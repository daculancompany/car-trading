import { Badge, Box, Button, ButtonGroup, Flex, Grid, HStack, IconButton, Image, Input, Select, Text, Tooltip } from "@chakra-ui/react";
import { CameraIcon, CursorArrowRaysIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState, type MouseEvent } from "react";

import type { DamageMark, DamageView } from "../../../api/JobOrderManagement/jobOrderApi";
import { DAMAGE_TYPES, DAMAGE_VIEWS, RATING_META, damageLabel, damageTypeLabel } from "./inspectionTemplate";

interface Props {
    marks: DamageMark[];
    onChange?: (marks: DamageMark[]) => void;
    onPhoto?: (label: string) => void;
    photoCounts?: Record<string, number>;
}

const ASPECT: Record<DamageView, string> = {
    left: "400 / 160",
    right: "400 / 160",
    top: "400 / 180",
    front: "240 / 170",
    rear: "240 / 170",
};

export default function CarDiagram({ marks, onChange, onPhoto, photoCounts = {} }: Props) {
    const editable = Boolean(onChange);
    const [selected, setSelected] = useState<number | null>(null);

    const addMark = (view: DamageView, event: MouseEvent<HTMLDivElement>) => {
        if (!onChange) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = Math.round(((event.clientX - rect.left) / rect.width) * 1000) / 10;
        const y = Math.round(((event.clientY - rect.top) / rect.height) * 1000) / 10;
        const no = marks.reduce((max, mark) => Math.max(max, mark.no), 0) + 1;
        onChange([...marks, { no, view, x, y, type: "scratch", severity: "attention", note: "" }]);
        setSelected(no);
    };

    const update = (no: number, patch: Partial<DamageMark>) =>
        onChange?.(marks.map((mark) => (mark.no === no ? { ...mark, ...patch } : mark)));

    const remove = (no: number) => {
        onChange?.(marks.filter((mark) => mark.no !== no));
        if (selected === no) setSelected(null);
    };

    const renderView = (view: DamageView, label: string) => (
        <Box key={view} minW={0}>
            <Box
                position="relative"
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                overflow="hidden"
                cursor={editable ? "crosshair" : "default"}
                _hover={editable ? { borderColor: "brand.300", bg: "white" } : undefined}
                transition="all 0.15s"
            >
                <Text position="absolute" top={1.5} left={2} fontSize="2xs" fontWeight="800" color="gray.500" letterSpacing="0.06em" zIndex={1}>
                    {label.toUpperCase()}
                </Text>
                <Box position="relative" sx={{ aspectRatio: ASPECT[view] }} onClick={(event) => addMark(view, event)}>
                    <Image src={`/images/inspection/car-${view}.svg`} alt={`${label} view`} w="100%" h="100%" draggable={false} userSelect="none" />
                    {marks
                        .filter((mark) => mark.view === view)
                        .map((mark) => {
                            const meta = RATING_META[mark.severity];
                            return (
                                <Tooltip key={mark.no} label={`#${mark.no} ${damageTypeLabel(mark.type)}${mark.note ? ` · ${mark.note}` : ""}`} hasArrow>
                                    <Flex
                                        position="absolute"
                                        left={`${mark.x}%`}
                                        top={`${mark.y}%`}
                                        transform="translate(-50%, -50%)"
                                        boxSize="22px"
                                        borderRadius="full"
                                        bg={meta.hex}
                                        color="white"
                                        fontSize="2xs"
                                        fontWeight="800"
                                        align="center"
                                        justify="center"
                                        border="2px solid white"
                                        boxShadow={selected === mark.no ? `0 0 0 3px ${meta.hex}66` : "md"}
                                        cursor="pointer"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setSelected(mark.no);
                                        }}
                                    >
                                        {mark.no}
                                    </Flex>
                                </Tooltip>
                            );
                        })}
                </Box>
            </Box>
        </Box>
    );

    const views = Object.fromEntries(DAMAGE_VIEWS.map((view) => [view.key, view.label])) as Record<DamageView, string>;

    return (
        <Box>
            {editable && (
                <HStack spacing={2} mb={2} color="gray.500">
                    <CursorArrowRaysIcon width={16} />
                    <Text fontSize="xs">Click on the car where you see damage to drop a numbered marker.</Text>
                </HStack>
            )}
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={2}>
                {renderView("left", views.left)}
                {renderView("top", views.top)}
                {renderView("right", views.right)}
            </Grid>
            <Grid templateColumns={{ base: "1fr 1fr", md: "minmax(0, 170px) minmax(0, 170px) 1fr" }} gap={2} mt={2}>
                {renderView("front", views.front)}
                {renderView("rear", views.rear)}
                <Box gridColumn={{ base: "1 / -1", md: "auto" }} minW={0}>
                    {marks.length === 0 ? (
                        <Flex h="full" minH="70px" align="center" justify="center" border="1px dashed" borderColor="gray.200" borderRadius="lg" px={3}>
                            <Text fontSize="sm" color="gray.400" textAlign="center">
                                No body damage marked.
                            </Text>
                        </Flex>
                    ) : (
                        <Box border="1px solid" borderColor="gray.200" borderRadius="lg" maxH="220px" overflowY="auto">
                            {marks.map((mark, index) => {
                                const meta = RATING_META[mark.severity];
                                const photoCount = photoCounts[damageLabel(mark)] ?? 0;
                                return (
                                    <Box
                                        key={mark.no}
                                        px={2.5}
                                        py={2}
                                        borderTop={index ? "1px solid" : undefined}
                                        borderColor="gray.100"
                                        bg={selected === mark.no ? "brand.50" : "white"}
                                        onClick={() => setSelected(mark.no)}
                                    >
                                        <Flex align="center" gap={2} wrap="wrap">
                                            <Flex boxSize="20px" borderRadius="full" bg={meta.hex} color="white" fontSize="2xs" fontWeight="800" align="center" justify="center" flexShrink={0}>
                                                {mark.no}
                                            </Flex>
                                            {editable ? (
                                                <>
                                                    <Select size="xs" w="auto" value={mark.type} onChange={(event) => update(mark.no, { type: event.target.value })}>
                                                        {DAMAGE_TYPES.map((type) => (
                                                            <option key={type.key} value={type.key}>
                                                                {type.label}
                                                            </option>
                                                        ))}
                                                    </Select>
                                                    <ButtonGroup size="xs" isAttached>
                                                        {(["attention", "urgent"] as const).map((severity) => (
                                                            <Button
                                                                key={severity}
                                                                colorScheme={RATING_META[severity].color}
                                                                variant={mark.severity === severity ? "solid" : "outline"}
                                                                onClick={() => update(mark.no, { severity })}
                                                            >
                                                                {severity === "attention" ? "Minor" : "Major"}
                                                            </Button>
                                                        ))}
                                                    </ButtonGroup>
                                                    <Box flex="1" />
                                                    {onPhoto && (
                                                        <IconButton
                                                            aria-label={`Add photo for damage ${mark.no}`}
                                                            size="xs"
                                                            variant="ghost"
                                                            icon={<CameraIcon width={15} />}
                                                            onClick={() => onPhoto(damageLabel(mark))}
                                                        />
                                                    )}
                                                    <IconButton aria-label={`Remove damage ${mark.no}`} size="xs" variant="ghost" colorScheme="red" icon={<TrashIcon width={15} />} onClick={() => remove(mark.no)} />
                                                </>
                                            ) : (
                                                <>
                                                    <Text fontSize="sm" fontWeight="700">
                                                        {damageTypeLabel(mark.type)}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {views[mark.view]}
                                                    </Text>
                                                    <Badge colorScheme={meta.color} fontSize="2xs">
                                                        {mark.severity === "attention" ? "Minor" : "Major"}
                                                    </Badge>
                                                </>
                                            )}
                                            {photoCount > 0 && (
                                                <Badge variant="subtle" fontSize="2xs" display="flex" alignItems="center" gap={1}>
                                                    <CameraIcon width={10} />
                                                    {photoCount}
                                                </Badge>
                                            )}
                                        </Flex>
                                        {editable ? (
                                            <Input
                                                mt={1.5}
                                                size="xs"
                                                placeholder="Where / what (e.g. driver door, 5 cm scratch)"
                                                value={mark.note ?? ""}
                                                onChange={(event) => update(mark.no, { note: event.target.value })}
                                            />
                                        ) : (
                                            mark.note && (
                                                <Text fontSize="xs" color="gray.600" mt={1} pl={7}>
                                                    {mark.note}
                                                </Text>
                                            )
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </Box>
            </Grid>
        </Box>
    );
}
