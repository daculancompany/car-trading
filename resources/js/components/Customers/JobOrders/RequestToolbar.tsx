import {
    Box,
    Button,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
} from "@chakra-ui/react";
import {
    MagnifyingGlassIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";

interface RequestServiceToolbarProps {
    search: string;
    status: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onReload: () => void;
    onAddRequest: () => void;
}

export default function CustomerRequestServiceToolbar({
    search,
    status,
    onSearchChange,
    onStatusChange,
    onAddRequest,
}: RequestServiceToolbarProps) {
    return (
        <Box
            layerStyle="panel"
            px={{ base: 4, md: 5 }}
            py={4}
            mb={0}
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
                {/* SEARCH */}
                <InputGroup
                    flex="1"
                    minW={{
                        base: "100%",
                        md: "300px",
                    }}
                >
                    <InputLeftElement
                        pointerEvents="none"
                        h="40px"
                    >
                        <MagnifyingGlassIcon
                            width={18}
                            height={18}
                        />
                    </InputLeftElement>

                    <Input
                        placeholder="Search by vehicle or service request..."
                        bg="white"
                        h="40px"
                        value={search}
                        onChange={(e) =>
                            onSearchChange(e.target.value)
                        }
                        borderColor="gray.300"
                        borderRadius="lg"
                        fontSize="sm"
                        pl="40px"
                        _hover={{
                            borderColor: "brand.400",
                        }}
                        _focus={{
                            borderColor: "brand.500",
                            boxShadow:
                                "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                    />
                </InputGroup>

                {/* STATUS FILTER */}
                <Flex
                    align="center"
                    gap={2}
                    w={{
                        base: "100%",
                        md: "220px",
                    }}
                >
                    <Select
                        bg="white"
                        h="40px"
                        w="full"
                        value={status}
                        onChange={(e) =>
                            onStatusChange(e.target.value)
                        }
                        borderColor="gray.300"
                        borderRadius="lg"
                        fontSize="sm"
                        _hover={{
                            borderColor: "brand.400",
                        }}
                        _focus={{
                            borderColor: "brand.500",
                            boxShadow:
                                "0 0 0 1px var(--chakra-colors-brand-500)",
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">
                            In Progress
                        </option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </Select>
                </Flex>

                {/* REQUEST SERVICE BUTTON */}

                <Button
                    h="40px"
                    leftIcon={<PlusIcon width={18} height={18} />}
                    color="white"
                    bg="brand.500"
                    borderRadius="lg"
                    _hover={{
                        bg: "brand.600",
                    }}
                    onClick={onAddRequest}
                    w={{
                        base: "100%",
                        lg: "auto",
                    }}
                >
                    Request Service
                </Button>
            </Flex>
        </Box>
    );
}
