import {
    Box,
    Button,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    useDisclosure,
} from "@chakra-ui/react";

import {
    MagnifyingGlassIcon,
    PlusIcon,
} from "@heroicons/react/24/solid";

import AddJobOrderModal from "./AddJobOrderModal";

// PROPS

interface JobOrderToolbarProps {
    search: string;
    status: string;
    workType: string;
    source?: string;
    onSourceChange?: (value: string) => void;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onWorkTypeChange: (value: string) => void;
    onReload: () => void;
}

// COMPONENT

export default function AdminJobOrderToolbar({
    search,
    status,
    workType,
    source = "",
    onSourceChange,
    onSearchChange,
    onStatusChange,
    onWorkTypeChange,
    onReload,
}: JobOrderToolbarProps) {
    const jobOrderModal = useDisclosure();

    return (
        <>
            <Box
                layerStyle="panel"
                px={{ base: 4, md: 5 }}
                py={4}
            >
                <Flex
                    direction={{ base: "column", lg: "row" }}
                    justify="space-between"
                    align={{ base: "stretch", lg: "center" }}
                    gap={4}
                >
                    {/* SEARCH + FILTERS */}

                    <Flex
                        direction={{ base: "column", md: "row" }}
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
                                    width={17}
                                    height={17}
                                    style={{
                                        color: "#A0AEC0",
                                    }}
                                />
                            </InputLeftElement>

                            <Input
                                size="sm"
                                placeholder="Search job orders..."
                                value={search}
                                onChange={(e) =>
                                    onSearchChange(
                                        e.target.value
                                    )
                                }
                                bg="white"
                                borderColor="gray.300"
                                rounded="md"
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

                        {/* STATUS */}

                        <Select
                            size="sm"
                            value={status}
                            onChange={(e) =>
                                onStatusChange(
                                    e.target.value
                                )
                            }
                            w={{
                                base: "100%",
                                md: "180px",
                            }}
                            bg="white"
                            borderColor="gray.300"
                            rounded="md"
                            _focus={{
                                borderColor: "brand.500",
                                boxShadow:
                                    "0 0 0 1px var(--chakra-colors-brand-500)",
                            }}
                        >
                            <option value="">
                                All Status
                            </option>

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

                        {/* SOURCE */}

                        {onSourceChange && (
                            <Select
                                size="sm"
                                value={source}
                                onChange={(e) => onSourceChange(e.target.value)}
                                w={{ base: "100%", md: "190px" }}
                                bg="white"
                                borderColor="gray.300"
                                rounded="md"
                            >
                                <option value="">All Sources</option>
                                <option value="customer">Customer Requests</option>
                                <option value="internal">Shop Jobs</option>
                            </Select>
                        )}

                        {/* WORK TYPE */}

                        <Select
                            size="sm"
                            value={workType}
                            onChange={(e) =>
                                onWorkTypeChange(
                                    e.target.value
                                )
                            }
                            w={{
                                base: "100%",
                                md: "180px",
                            }}
                            bg="white"
                            borderColor="gray.300"
                            rounded="md"
                            _focus={{
                                borderColor: "brand.500",
                                boxShadow:
                                    "0 0 0 1px var(--chakra-colors-brand-500)",
                            }}
                        >
                            <option value="">
                                All Work Types
                            </option>

                            <option value="repair">
                                Repair
                            </option>

                            <option value="maintenance">
                                Maintenance
                            </option>

                            <option value="inspection">
                                Inspection
                            </option>

                            <option value="washing">
                                Washing
                            </option>

                            <option value="detailing">
                                Detailing
                            </option>

                            <option value="other">
                                Other
                            </option>
                        </Select>
                    </Flex>

                    {/* ACTION BUTTONS */}

                    <Flex
                        direction={{
                            base: "column",
                            sm: "row",
                        }}
                        gap={2}
                        w={{
                            base: "100%",
                            lg: "auto",
                        }}
                    >

                        {/* ADD JOB ORDER */}

                        <Button
                            size="sm"
                            colorScheme="brand"
                            leftIcon={
                                <PlusIcon
                                    width={16}
                                    height={16}
                                />
                            }
                            onClick={jobOrderModal.onOpen}
                            w={{
                                base: "100%",
                                lg: "auto",
                            }}
                            px={4}
                        >
                            Add Job Order
                        </Button>
                    </Flex>
                </Flex>
            </Box>

            {/* ADD JOB ORDER MODAL */}

            <AddJobOrderModal
                isOpen={jobOrderModal.isOpen}
                onClose={jobOrderModal.onClose}
                onSuccess={onReload}
            />

        </>
    );
}

