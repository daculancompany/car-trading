import {
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Box,
} from "@chakra-ui/react";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import {
    RESERVATION_STATUSES,
} from "../../../api/ReservationManagement/reservationApi";

interface ReservationToolbarProps {
    search: string;
    statusFilter: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
}

export default function AdminReservationToolbar({
    search,
    statusFilter,
    onSearchChange,
    onStatusChange,
}: ReservationToolbarProps) {
    return (
        <Box
            layerStyle="panel"
            px={{ base: 4, md: 5 }}
            py={4}
        >
            <Flex
                direction={{
                    base: "column",
                    lg: "row",
                }}
                justify="space-between"
                align={{
                    base: "stretch",
                    lg: "center",
                }}
                gap={4}
            >
                {/* SEARCH + STATUS */}

                <Flex
                    direction={{
                        base: "column",
                        md: "row",
                    }}
                    flex="1"
                    gap={3}
                >
                    {/* SEARCH */}

                    <InputGroup flex="1">
                        <InputLeftElement
                            pointerEvents="none"
                            h="100%"
                        >
                            <MagnifyingGlassIcon
                                width={16}
                                height={16}
                                color="currentColor"
                            />
                        </InputLeftElement>

                        <Input
                            size="sm"
                            placeholder="Search customer, vehicle, stock no..."
                            value={search}
                            onChange={(e) =>
                                onSearchChange(e.target.value)
                            }
                            bg="white"
                            rounded="md"
                            borderColor="gray.300"
                            _hover={{
                                borderColor: "gray.400",
                            }}
                            _focus={{
                                borderColor: "brand.500",
                                boxShadow:
                                    "0 0 0 1px var(--chakra-colors-brand-500)",
                            }}
                        />
                    </InputGroup>

                    {/* STATUS FILTER */}

                    <Select
                        size="sm"
                        placeholder="All Status"
                        value={statusFilter}
                        onChange={(e) =>
                            onStatusChange(e.target.value)
                        }
                        w={{
                            base: "100%",
                            md: "220px",
                        }}
                        bg="white"
                        rounded="md"
                        borderColor="gray.300"
                        _hover={{
                            borderColor: "gray.400",
                        }}
                        _focus={{
                            borderColor: "brand.500",
                            boxShadow:
                                "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                    >
                        {RESERVATION_STATUSES.map(
                            (status) => (
                                <option
                                    key={status.value}
                                    value={status.value}
                                >
                                    {status.label}
                                </option>
                            )
                        )}
                    </Select>
                </Flex>
            </Flex>
        </Box>
    );
}

