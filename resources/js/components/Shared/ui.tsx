// Shared building blocks so every page uses the same headings, cards and states.
import type { ComponentType, ReactNode } from "react";
import {
  Box,
  type BoxProps,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  type SimpleGridProps,
  Spinner,
  Text,
} from "@chakra-ui/react";

// White card with the app's border, radius and shadow.
export function Panel({ children, ...rest }: BoxProps) {
  return (
    <Box layerStyle="panel" {...rest}>
      {children}
    </Box>
  );
}

type SectionHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
};

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "flex-start", sm: "center" }}
      direction={{ base: "column", sm: "row" }}
      gap={3}
    >
      <Box minW={0}>
        <Heading size="sm" color="dark.800">
          {title}
        </Heading>
        {subtitle && (
          <Text fontSize="sm" color="gray.500" mt={0.5}>
            {subtitle}
          </Text>
        )}
      </Box>
      {action && <Box flexShrink={0}>{action}</Box>}
    </Flex>
  );
}

// A panel with a header row; use `flush` when the body has its own padding (tables).
export function Section({
  title,
  subtitle,
  action,
  flush = false,
  children,
  ...rest
}: SectionHeaderProps & { flush?: boolean } & Omit<BoxProps, "title">) {
  return (
    <Panel overflow="hidden" {...rest}>
      <Box px={{ base: 4, md: 5 }} pt={4} pb={flush ? 4 : 0} borderBottom={flush ? "1px solid" : undefined} borderColor="gray.100">
        <SectionHeader title={title} subtitle={subtitle} action={action} />
      </Box>
      <Box px={flush ? 0 : { base: 4, md: 5 }} py={flush ? 0 : 4}>
        {children}
      </Box>
    </Panel>
  );
}

// Small label above a value, for detail lists.
export function InfoItem({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <Box minW={0}>
      <Text fontSize="xs" color="gray.500">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="600" color="dark.800" noOfLines={2}>
        {value ?? "—"}
      </Text>
    </Box>
  );
}

export function InfoGrid({ children, ...rest }: SimpleGridProps) {
  return (
    <SimpleGrid columns={{ base: 2, md: 2 }} spacingX={4} spacingY={3} {...rest}>
      {children}
    </SimpleGrid>
  );
}

// Big number with a caption, for summaries.
export function StatTile({
  label,
  value,
  note,
  tone = "dark.900",
  icon,
}: {
  label: ReactNode;
  value: ReactNode;
  note?: ReactNode;
  tone?: string;
  icon?: ComponentType;
}) {
  return (
    <Panel px={4} py={3}>
      <Flex justify="space-between" align="start" gap={2}>
        <Text fontSize="xs" color="gray.500">
          {label}
        </Text>
        {icon && <Icon as={icon} boxSize={5} color="gray.400" />}
      </Flex>
      <Text fontSize="2xl" fontWeight="800" color={tone} letterSpacing="-0.02em" mt={0.5}>
        {value}
      </Text>
      {note && (
        <Text fontSize="xs" color="gray.500" mt={0.5}>
          {note}
        </Text>
      )}
    </Panel>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: ComponentType;
  title: ReactNode;
  message?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Flex direction="column" align="center" textAlign="center" py={{ base: 10, md: 14 }} px={4}>
      {icon && (
        <Flex w="48px" h="48px" align="center" justify="center" borderRadius="full" bg="gray.100" mb={3}>
          <Icon as={icon} boxSize={6} color="gray.500" />
        </Flex>
      )}
      <Text fontWeight="700" color="dark.800">
        {title}
      </Text>
      {message && (
        <Text fontSize="sm" color="gray.500" mt={1} maxW="sm">
          {message}
        </Text>
      )}
      {action && <Box mt={4}>{action}</Box>}
    </Flex>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <Flex direction="column" align="center" py={14} gap={3}>
      <Spinner color="brand.500" size="lg" thickness="3px" />
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
    </Flex>
  );
}
