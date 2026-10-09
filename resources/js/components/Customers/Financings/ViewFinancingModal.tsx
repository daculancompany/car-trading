import {
    Badge,
    Box,
    Divider,
    Flex,
    Grid,
    HStack,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    VStack,
} from "@chakra-ui/react";

import {
    BanknotesIcon,
    BuildingOffice2Icon,
    CalendarDaysIcon,
    IdentificationIcon,
    InformationCircleIcon,
    MapPinIcon,
    PhoneIcon,
    UserIcon,
} from "@heroicons/react/24/outline";

import type { Financing } from "../../../api/FinancingManagement/financingInfoApi";

interface ViewFinancingModalProps {
    isOpen: boolean;
    onClose: () => void;
    financing: Financing | null;
}

const formatCurrency = (amount?: number | null): string => {
    if (amount === null || amount === undefined) {
        return "₱0.00";
    }

    return `₱${Number(amount).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const formatLoanTerm = (months?: number | null): string => {
    if (!months) {
        return "—";
    }

    return `${months} Months`;
};

const getStatusColor = (status?: string): string => {
    switch (status?.toLowerCase()) {
        case "approved":
            return "green";
        case "pending":
            return "yellow";
        case "rejected":
            return "red";
        case "completed":
            return "purple";
        default:
            return "blue";
    }
};

const formatStatus = (status?: string): string => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function ViewFinancingModal({
    isOpen,
    onClose,
    financing,
}: ViewFinancingModalProps) {
    if (!financing) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            isCentered
            size={{ base: "full", md: "2xl" }}
        >
            <ModalOverlay />

            <ModalContent
                mx={{ base: 2, md: 4 }}
                borderRadius={{ base: "lg", md: "xl" }}
                overflow="hidden"
            >
                <ModalHeader
                    bg="gray.50"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    py={{ base: 3, md: 4 }}
                    pr={12}
                >
                    <HStack spacing={3}>
                        <Flex
                            w="40px"
                            h="40px"
                            align="center"
                            justify="center"
                            borderRadius="lg"
                            bg="blue.50"
                            flexShrink={0}
                        >
                            <Icon
                                as={BanknotesIcon}
                                boxSize={5}
                                color="blue.500"
                            />
                        </Flex>

                        <Box>
                            <Text
                                fontSize={{ base: "md", md: "lg" }}
                                fontWeight="700"
                            >
                                Financing Information
                            </Text>

                            <Text
                                fontSize="xs"
                                color="gray.500"
                                fontWeight="400"
                            >
                                Financing and company details
                            </Text>
                        </Box>
                    </HStack>
                </ModalHeader>

                <ModalCloseButton top={3} right={3} />

                <ModalBody
                    p={{ base: 4, md: 5 }}
                    maxH={{ base: "calc(100vh - 100px)", md: "75vh" }}
                    overflowY="auto"
                >
                    <VStack align="stretch" spacing={5}>
                        {/* Financing Status */}
                        <Flex
                            justify="space-between"
                            align={{ base: "flex-start", sm: "center" }}
                            direction={{ base: "column", sm: "row" }}
                            gap={2}
                        >
                            <HStack spacing={2}>
                                <Icon
                                    as={InformationCircleIcon}
                                    boxSize={5}
                                    color="gray.500"
                                />

                                <Text fontSize="sm" fontWeight="600">
                                    Financing Status
                                </Text>
                            </HStack>

                            <Badge
                                colorScheme={getStatusColor(
                                    financing.financing_status
                                )}
                                borderRadius="full"
                                px={3}
                                py={1}
                            >
                                {formatStatus(financing.financing_status)}
                            </Badge>
                        </Flex>

                        <Divider />

                        {/* Financing Information */}
                        <Box>
                            <HStack spacing={2} mb={4}>
                                <Icon
                                    as={BanknotesIcon}
                                    boxSize={5}
                                    color="blue.500"
                                />

                                <Text fontSize="md" fontWeight="700">
                                    Financing Information
                                </Text>
                            </HStack>

                            <Grid
                                templateColumns={{
                                    base: "1fr",
                                    sm: "repeat(2, 1fr)",
                                }}
                                gap={4}
                            >
                                <InfoItem
                                    label="Financed Amount"
                                    value={formatCurrency(
                                        financing.financed_amount
                                    )}
                                    icon={BanknotesIcon}
                                />

                                <InfoItem
                                    label="Monthly Payment"
                                    value={formatCurrency(
                                        financing.monthly_payment
                                    )}
                                    icon={BanknotesIcon}
                                />

                                <InfoItem
                                    label="Loan Term"
                                    value={formatLoanTerm(
                                        financing.loan_term_months
                                    )}
                                    icon={CalendarDaysIcon}
                                />

                                <InfoItem
                                    label="Financing Reference"
                                    value={
                                        financing.financing_reference_no || "—"
                                    }
                                    icon={IdentificationIcon}
                                />
                            </Grid>
                        </Box>

                        <Divider />

                        {/* Financing Company */}
                        <Box>
                            <HStack spacing={2} mb={4}>
                                <Icon
                                    as={BuildingOffice2Icon}
                                    boxSize={5}
                                    color="blue.500"
                                />

                                <Text fontSize="md" fontWeight="700">
                                    Financing Company
                                </Text>
                            </HStack>

                            <VStack align="stretch" spacing={3}>
                                <InfoItem
                                    label="Company Name"
                                    value={financing.company_name || "—"}
                                    icon={BuildingOffice2Icon}
                                />

                                <InfoItem
                                    label="Contact Person"
                                    value={financing.contact_person || "—"}
                                    icon={UserIcon}
                                />

                                <InfoItem
                                    label="Contact Number"
                                    value={financing.contact_number || "—"}
                                    icon={PhoneIcon}
                                />

                                <InfoItem
                                    label="Email"
                                    value={financing.email || "—"}
                                    icon={InformationCircleIcon}
                                />

                                <InfoItem
                                    label="Address"
                                    value={financing.address || "—"}
                                    icon={MapPinIcon}
                                />
                            </VStack>
                        </Box>

                        <Divider />

                        {/* Remarks */}
                        {financing.remarks && (
                            <>
                                <Divider />

                                <Box>
                                    <Text
                                        fontSize="sm"
                                        fontWeight="700"
                                        mb={2}
                                    >
                                        Remarks
                                    </Text>

                                    <Box
                                        p={3}
                                        bg="gray.50"
                                        borderRadius="md"
                                        border="1px solid"
                                        borderColor="gray.200"
                                    >
                                        <Text
                                            fontSize="sm"
                                            color="gray.700"
                                            whiteSpace="pre-wrap"
                                        >
                                            {financing.remarks}
                                        </Text>
                                    </Box>
                                </Box>
                            </>
                        )}
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

interface InfoItemProps {
    label: string;
    value: string;
    icon: React.ElementType;
}

function InfoItem({
    label,
    value,
    icon,
}: InfoItemProps) {
    return (
        <HStack
            align="flex-start"
            spacing={3}
        >
            <Icon
                as={icon}
                boxSize={4}
                color="gray.500"
                mt={0.5}
                flexShrink={0}
            />

            <Box minW={0}>
                <Text
                    fontSize="xs"
                    color="gray.500"
                    mb={0.5}
                >
                    {label}
                </Text>

                <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="gray.800"
                    wordBreak="break-word"
                >
                    {value}
                </Text>
            </Box>
        </HStack>
    );
}
