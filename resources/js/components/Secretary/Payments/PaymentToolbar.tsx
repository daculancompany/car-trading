import {
    Box,
    Button,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    HStack,
    useDisclosure,
} from "@chakra-ui/react";

import {
    MagnifyingGlassIcon,
    PlusIcon,
    BuildingLibraryIcon,
} from "@heroicons/react/24/solid";

import AddPaymentModal from "../Payments/AddPaymentModal";
import AddPaymentAccountModal from "../Payments/AddPaymentAccountModal";

interface PaymentToolbarProps {
    search: string;
    statusFilter: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onPaymentAdded: () => void;
    onPaymentAccountAdded: () => void;
}

export default function AdminPaymentToolbar({
    search,
    statusFilter,
    onSearchChange,
    onStatusChange,
    onPaymentAdded,
    onPaymentAccountAdded,
}: PaymentToolbarProps) {
    const paymentModal = useDisclosure();
    const paymentAccountModal = useDisclosure();

    return (
        <>
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
                    {/* SEARCH + FILTER */}

                    <Flex
                        direction={{
                            base: "column",
                            md: "row",
                        }}
                        flex="1"
                        gap={4}
                    >
                        {/* Search */}

                        <InputGroup flex="1">
                            <InputLeftElement
                                pointerEvents="none"
                                h="32px"
                            >
                                <MagnifyingGlassIcon
                                    width={16}
                                    height={16}
                                    color="currentColor"
                                />
                            </InputLeftElement>

                            <Input
                                size="sm"
                                placeholder="Search payment..."
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
                                    borderColor:
                                        "gray.400",
                                }}
                                _focus={{
                                    borderColor:
                                        "brand.500",
                                    boxShadow:
                                        "0 0 0 1px var(--chakra-colors-brand-500)",
                                }}
                            />
                        </InputGroup>

                        {/* Status Filter */}

                        <Select
                            size="sm"
                            placeholder="All Status"
                            value={statusFilter}
                            onChange={(e) =>
                                onStatusChange(
                                    e.target.value
                                )
                            }
                            w={{
                                base: "100%",
                                md: "200px",
                            }}
                            bg="white"
                            borderColor="gray.300"
                            rounded="md"
                            _hover={{
                                borderColor:
                                    "gray.400",
                            }}
                            _focus={{
                                borderColor:
                                    "brand.500",
                                boxShadow:
                                    "0 0 0 1px var(--chakra-colors-brand-500)",
                            }}
                        >
                            <option value="Pending">
                                Pending
                            </option>

                            <option value="Verified">
                                Verified
                            </option>

                            <option value="Rejected">
                                Rejected
                            </option>
                        </Select>
                    </Flex>

                    {/* ACTION BUTTONS */}

                    <HStack
                        spacing={2}
                        flexWrap="wrap"
                        justify={{
                            base: "flex-start",
                            lg: "flex-end",
                        }}
                    >
                        {/* Add Payment Account */}

                        <Button
                            size="sm"
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.700"
                            leftIcon={
                                <BuildingLibraryIcon
                                    width={16}
                                    height={16}
                                />
                            }
                            onClick={
                                paymentAccountModal.onOpen
                            }
                            _hover={{
                                bg: "gray.50",
                                borderColor:
                                    "gray.400",
                            }}
                        >
                            Add Bank Account
                        </Button>

                        {/* Add Payment */}

                        <Button
                            size="sm"
                            colorScheme="brand"
                            leftIcon={
                                <PlusIcon
                                    width={16}
                                    height={16}
                                />
                            }
                            onClick={
                                paymentModal.onOpen
                            }
                        >
                            Add Payment
                        </Button>
                    </HStack>
                </Flex>
            </Box>

            {/* ADD PAYMENT ACCOUNT MODAL */}

            <AddPaymentAccountModal
                isOpen={
                    paymentAccountModal.isOpen
                }
                onClose={
                    paymentAccountModal.onClose
                }
                onSuccess={
                    onPaymentAccountAdded
                }
            />

            {/* ADD PAYMENT MODAL */}

            <AddPaymentModal
                isOpen={paymentModal.isOpen}
                onClose={paymentModal.onClose}
                onSuccess={onPaymentAdded}
            />
        </>
    );
}
