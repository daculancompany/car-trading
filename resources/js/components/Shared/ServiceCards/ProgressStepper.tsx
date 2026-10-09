import { Box, Flex, Icon, Text, Tooltip } from "@chakra-ui/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export type StepState = "done" | "current" | "upcoming" | "failed";

export interface Step {
    key: string;
    label: string;
    state: StepState;
    at?: string | null;
    icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

const formatDate = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

const STYLE: Record<StepState, { bg: string; border: string; color: string }> = {
    done: { bg: "green.500", border: "green.500", color: "white" },
    current: { bg: "brand.500", border: "brand.500", color: "white" },
    failed: { bg: "red.500", border: "red.500", color: "white" },
    upcoming: { bg: "white", border: "gray.300", color: "gray.400" },
};

export default function ProgressStepper({ steps }: { steps: Step[] }) {
    const doneCount = steps.filter((step) => step.state === "done").length;
    const fill = steps.length > 1 ? Math.min(doneCount - 1, steps.length - 1) / (steps.length - 1) : 0;

    return (
        <Box position="relative">
            <Box position="absolute" top="13px" left={`${50 / steps.length}%`} right={`${50 / steps.length}%`} h="2px" bg="gray.200" />
            <Box
                position="absolute"
                top="13px"
                left={`${50 / steps.length}%`}
                w={`calc(${fill * 100}% - ${(fill * 100) / steps.length}%)`}
                h="2px"
                bg="green.400"
                transition="width 0.3s"
            />
            <Flex justify="space-between" position="relative">
                {steps.map((step) => {
                    const style = STYLE[step.state];
                    return (
                        <Tooltip key={step.key} label={step.at ? `${step.label} · ${formatDate(step.at)}` : step.label} hasArrow>
                            <Flex direction="column" align="center" flex="1" minW={0}>
                                <Flex
                                    boxSize="28px"
                                    borderRadius="full"
                                    align="center"
                                    justify="center"
                                    bg={style.bg}
                                    border="2px solid"
                                    borderColor={style.border}
                                    color={style.color}
                                    boxShadow={step.state === "current" ? "0 0 0 4px var(--chakra-colors-brand-100)" : undefined}
                                >
                                    {step.state === "done" ? (
                                        <CheckIcon width={14} strokeWidth={3} />
                                    ) : step.state === "failed" ? (
                                        <XMarkIcon width={14} strokeWidth={3} />
                                    ) : step.icon ? (
                                        <Icon as={step.icon} boxSize={3.5} />
                                    ) : (
                                        <Box boxSize="8px" borderRadius="full" bg={step.state === "current" ? "white" : "gray.300"} />
                                    )}
                                </Flex>
                                <Text
                                    fontSize="2xs"
                                    mt={1.5}
                                    color={step.state === "upcoming" ? "gray.400" : step.state === "failed" ? "red.600" : "gray.700"}
                                    fontWeight={step.state === "current" ? "800" : "600"}
                                    textAlign="center"
                                    noOfLines={1}
                                >
                                    {step.label}
                                </Text>
                            </Flex>
                        </Tooltip>
                    );
                })}
            </Flex>
        </Box>
    );
}
