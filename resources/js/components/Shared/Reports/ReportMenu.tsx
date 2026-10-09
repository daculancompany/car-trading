import { Box, Flex, Icon, Select, Text, VStack } from "@chakra-ui/react";
import type { ReportPath } from "../../../api/Reports/reportApi";
import { REPORT_GROUPS, REPORTS } from "./reportDefinitions";

interface ReportMenuProps {
    active: ReportPath;
    onSelect: (key: ReportPath) => void;
}

export default function ReportMenu({ active, onSelect }: ReportMenuProps) {
    return (
        <>

            <Box display={{ base: "block", lg: "none" }} layerStyle="panel" px={4} py={3}>
                <Text fontSize="xs" fontWeight="700" color="gray.500" mb={1}>
                    REPORT
                </Text>
                <Select size="sm" value={active} onChange={(e) => onSelect(e.target.value as ReportPath)}>
                    {REPORT_GROUPS.map((group) => (
                        <optgroup key={group} label={group}>
                            {REPORTS.filter((report) => report.group === group).map((report) => (
                                <option key={report.key} value={report.key}>
                                    {report.label}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </Select>
            </Box>

            <Box
                display={{ base: "none", lg: "block" }}
                layerStyle="panel"
                py={3}
                position="sticky"
                top={4}
            >
                {REPORT_GROUPS.map((group) => (
                    <Box key={group} mb={2}>
                        <Text px={4} pt={2} pb={1} fontSize="2xs" fontWeight="700" color="gray.400" letterSpacing="wider">
                            {group.toUpperCase()}
                        </Text>

                        <VStack align="stretch" spacing={0.5} px={2}>
                            {REPORTS.filter((report) => report.group === group).map((report) => {
                                const isActive = report.key === active;

                                return (
                                    <Flex
                                        key={report.key}
                                        as="button"
                                        type="button"
                                        align="center"
                                        gap={2.5}
                                        px={3}
                                        py={2}
                                        borderRadius="md"
                                        textAlign="left"
                                        fontSize="sm"
                                        fontWeight={isActive ? "700" : "500"}
                                        color={isActive ? "brand.700" : "gray.600"}
                                        bg={isActive ? "brand.50" : "transparent"}
                                        _hover={{ bg: isActive ? "brand.50" : "gray.50" }}
                                        onClick={() => onSelect(report.key)}
                                    >
                                        <Icon as={report.icon} boxSize={4} flexShrink={0} />
                                        {report.label}
                                    </Flex>
                                );
                            })}
                        </VStack>
                    </Box>
                ))}
            </Box>
        </>
    );
}
