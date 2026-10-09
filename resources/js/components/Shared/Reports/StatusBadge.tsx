import { Badge } from "@chakra-ui/react";
import { labelize, statusColor } from "./reportFormat";

export default function StatusBadge({ status, label }: { status: string; label?: string }) {
    return (
        <Badge colorScheme={statusColor(status)} borderRadius="full" px={2.5} py={0.5} fontSize="2xs" whiteSpace="nowrap">
            {label ?? labelize(status)}
        </Badge>
    );
}
