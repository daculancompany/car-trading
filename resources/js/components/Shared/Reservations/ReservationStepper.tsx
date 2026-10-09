import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { CheckIcon } from "@heroicons/react/24/solid";

import type { Reservation } from "../../../api/ReservationManagement/reservationApi";
import { getReservationSteps, type ReservationStepState } from "./reservationFlow";

const STYLE: Record<ReservationStepState, { bg: string; border: string; color: string; line: string; text: string }> = {
    done: { bg: "green.500", border: "green.500", color: "white", line: "green.400", text: "gray.800" },
    current: { bg: "white", border: "brand.500", color: "brand.500", line: "gray.200", text: "brand.600" },
    upcoming: { bg: "white", border: "gray.300", color: "gray.400", line: "gray.200", text: "gray.400" },
    stopped: { bg: "red.500", border: "red.500", color: "white", line: "gray.200", text: "red.600" },
};

const formatDate = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? null
        : date.toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

interface Props {
    reservation: Reservation;
    customerView?: boolean;
}

export default function ReservationStepper({ reservation, customerView = false }: Props) {
    const steps = getReservationSteps(reservation);

    return (
        <Box overflowX="auto" pb={1}>
            <Flex minW={`${steps.length * 130}px`}>
                {steps.map((step, index) => {
                    const style = STYLE[step.state];
                    const next = steps[index + 1];
                    const date = formatDate(step.at);
                    const by = step.by && (customerView ? (step.by === "System" ? "Automatic" : null) : step.by);

                    return (
                        <Flex key={step.key} direction="column" align="center" flex="1" position="relative" minW="120px">
                            {next && (
                                <Box
                                    position="absolute"
                                    top="17px"
                                    left="calc(50% + 22px)"
                                    right="calc(-50% + 22px)"
                                    h="3px"
                                    borderRadius="full"
                                    bg={step.state === "done" && next.state !== "upcoming" ? (next.state === "stopped" ? "red.300" : "green.400") : "gray.200"}
                                />
                            )}
                            <Flex
                                boxSize="36px"
                                borderRadius="full"
                                align="center"
                                justify="center"
                                bg={style.bg}
                                border="2px solid"
                                borderColor={style.border}
                                color={style.color}
                                boxShadow={step.state === "current" ? "0 0 0 5px var(--chakra-colors-brand-50)" : undefined}
                                zIndex={1}
                            >
                                <Icon as={step.state === "done" ? CheckIcon : step.icon} boxSize={step.state === "done" ? 4 : 4.5} />
                            </Flex>
                            <Text mt={2} fontSize="xs" fontWeight={step.state === "current" ? "800" : "700"} color={style.text} textAlign="center" px={1} noOfLines={2}>
                                {step.label}
                            </Text>
                            {step.state === "current" ? (
                                <Text fontSize="2xs" color="brand.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.04em">
                                    Current step
                                </Text>
                            ) : date ? (
                                <Text fontSize="2xs" color="gray.500" textAlign="center">
                                    {date}
                                </Text>
                            ) : null}
                            {by && step.state !== "current" && (
                                <Text fontSize="2xs" color="gray.400" textAlign="center" noOfLines={1}>
                                    by {by}
                                </Text>
                            )}
                        </Flex>
                    );
                })}
            </Flex>
        </Box>
    );
}
