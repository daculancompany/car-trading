import type { ReactNode } from "react";
import { Box, Button, Flex, Heading, HStack, Text } from "@chakra-ui/react";
import { ArrowPathIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}

// The title bar at the top of every portal page.
export default function PageHeader({
  title,
  subtitle,
  action,
  onRefresh,
  refreshing = false,
}: PageHeaderProps) {
  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Flex
      layerStyle="panel"
      justify="space-between"
      align={{ base: "start", md: "center" }}
      direction={{ base: "column", md: "row" }}
      gap={4}
      px={{ base: 4, md: 6 }}
      py={4}
    >
      <Box minW={0}>
        <Heading size="sm" fontWeight="800" color="dark.900" letterSpacing="-0.01em">
          {title}
        </Heading>
        {subtitle && (
          <Text mt={1} fontSize="sm" color="gray.500" lineHeight="1.5">
            {subtitle}
          </Text>
        )}
      </Box>

      <HStack spacing={3} flexWrap="wrap" flexShrink={0}>
        <HStack spacing={2} color="gray.600" bg="gray.50" px={3} h="32px" borderRadius="md" display={{ base: "none", md: "flex" }}>
          <CalendarDaysIcon width={16} height={16} />
          <Text fontSize="xs" fontWeight="500" whiteSpace="nowrap">
            {today}
          </Text>
        </HStack>

        {onRefresh && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<ArrowPathIcon width={14} height={14} />}
            onClick={onRefresh}
            isLoading={refreshing}
            borderColor="gray.300"
            color="gray.700"
            _hover={{ bg: "brand.50", color: "brand.600", borderColor: "brand.300" }}
          >
            Refresh
          </Button>
        )}

        {action}
      </HStack>
    </Flex>
  );
}
