import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import type { ComponentType, SVGProps } from "react";

interface StatTileProps {
    label: string;
    value: string | number;
    color: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    active?: boolean;
    onClick?: () => void;
}

export default function StatTile({ label, value, color, icon, active = false, onClick }: StatTileProps) {
    return (
        <Flex
            as={onClick ? "button" : "div"}
            align="center"
            gap={3}
            p={3.5}
            bg="white"
            border="1px"
            borderColor={active ? `${color}.400` : "gray.200"}
            boxShadow={active ? `0 0 0 1px var(--chakra-colors-${color}-400)` : undefined}
            borderRadius="xl"
            textAlign="left"
            transition="all 0.15s"
            _hover={onClick ? { borderColor: `${color}.300`, transform: "translateY(-1px)" } : undefined}
            onClick={onClick}
        >
            <Flex boxSize="40px" borderRadius="lg" bg={`${color}.50`} color={`${color}.500`} align="center" justify="center" flexShrink={0}>
                <Icon as={icon} boxSize={5} />
            </Flex>
            <Box minW={0}>
                <Text fontSize="xl" fontWeight="800" color="gray.800" lineHeight="1.1">
                    {value}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                    {label}
                </Text>
            </Box>
        </Flex>
    );
}
