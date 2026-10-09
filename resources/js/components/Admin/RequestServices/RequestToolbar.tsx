
import {
    Box,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
} from "@chakra-ui/react";

import {
    MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

interface RequestServiceToolbarProps {
    search: string;
    status: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onReload: () => void;
}

export default function RequestServiceToolbar({
    search,
    status,
    onSearchChange,
    onStatusChange,
}: RequestServiceToolbarProps) {
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
                            placeholder="Search customer, vehicle, or request..."
                            value={search}
                            onChange={(e) =>
                                onSearchChange(
                                    e.target.value
                                )
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
                        value={status}
                        onChange={(e) =>
                            onStatusChange(
                                e.target.value
                            )
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
                        <option value="pending">
                            Pending
                        </option>

                        <option value="assigned">
                            Assigned
                        </option>

                        <option value="in_progress">
                            In Progress
                        </option>

                        <option value="completed">
                            Completed
                        </option>

                        <option value="cancelled">
                            Cancelled
                        </option>
                    </Select>
                </Flex>
            </Flex>
        </Box>
    );
}
