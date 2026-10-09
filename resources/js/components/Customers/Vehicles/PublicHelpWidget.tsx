import { useState, type ReactNode } from "react";

import {
    BanknotesIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    TruckIcon,
} from "@heroicons/react/24/outline";

import {
    Box,
    Button,
    Flex,
    IconButton,
    Text,
    VStack,
} from "@chakra-ui/react";

import {
    ChatIcon,
    ChevronRightIcon,
    CloseIcon,
    ArrowBackIcon,
} from "@chakra-ui/icons";

type HelpSection =
    | "main"
    | "vehicle"
    | "reservation"
    | "payment"
    | "requirements";

export default function PublicHelpWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [section, setSection] =
        useState<HelpSection>("main");

    const handleClose = () => {
        setIsOpen(false);
        setSection("main");
    };

    const handleBack = () => {
        setSection("main");
    };

    return (
        <>
            {/* HELP WINDOW */}

            {isOpen && (
                <Box
                    position="fixed"
                    right={{ base: "16px", sm: "24px" }}
                    bottom={{ base: "85px", sm: "95px" }}
                    w={{
                        base: "calc(100vw - 32px)",
                        sm: "360px",
                    }}
                    maxW="360px"
                    bg="white"
                    borderRadius="2xl"
                    boxShadow="0 12px 40px rgba(0, 0, 0, 0.18)"
                    border="1px solid"
                    borderColor="gray.200"
                    overflow="hidden"
                    zIndex={2000}
                >
                    {/* HEADER */}

                    <Flex
                        align="center"
                        justify="space-between"
                        px={5}
                        py={4}
                        bg="blue.600"
                        color="white"
                    >
                        <Flex align="center" gap={3}>
                            {section !== "main" && (
                                <IconButton
                                    aria-label="Back"
                                    icon={<ArrowBackIcon />}
                                    size="sm"
                                    variant="ghost"
                                    color="white"
                                    _hover={{
                                        bg: "whiteAlpha.200",
                                    }}
                                    onClick={handleBack}
                                />
                            )}

                            <Box>
                                <Text
                                    fontSize="md"
                                    fontWeight="700"
                                >
                                    {section === "main"
                                        ? "Help & FAQs"
                                        : "Help Center"}
                                </Text>

                                <Text
                                    fontSize="xs"
                                    opacity={0.85}
                                >
                                    CDO Car Trading
                                </Text>
                            </Box>
                        </Flex>

                        <IconButton
                            aria-label="Close help"
                            icon={<CloseIcon />}
                            size="sm"
                            variant="ghost"
                            color="white"
                            _hover={{
                                bg: "whiteAlpha.200",
                            }}
                            onClick={handleClose}
                        />
                    </Flex>

                    {/* MAIN MENU */}

                    {section === "main" && (
                        <VStack
                            align="stretch"
                            spacing={0}
                            p={3}
                        >
                            <Box px={2} py={3}>
                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                >
                                    How can we help you?
                                </Text>

                                <Text
                                    fontSize="xs"
                                    color="gray.500"
                                    mt={1}
                                >
                                    Find answers to common questions.
                                </Text>
                            </Box>

                            {/* Vehicle */}

                            <HelpMenuItem
                                icon={<TruckIcon width={20} color="#B51218" />}
                                title="Vehicle Information"
                                description="Vehicle details and availability"
                                onClick={() =>
                                    setSection("vehicle")
                                }
                            />

                            {/* Reservation */}

                            <HelpMenuItem
                                icon={<ClipboardDocumentListIcon width={20} color="#B51218" />}
                                title="How to Reserve"
                                description="Learn how vehicle reservation works"
                                onClick={() =>
                                    setSection("reservation")
                                }
                            />

                            {/* Payment */}

                            <HelpMenuItem
                                icon={<BanknotesIcon width={20} color="#B51218" />}
                                title="Payment & Reservation Fee"
                                description="Payment and reservation information"
                                onClick={() =>
                                    setSection("payment")
                                }
                            />

                            {/* Requirements */}

                            <HelpMenuItem
                                icon={<DocumentTextIcon width={20} color="#B51218" />}
                                title="Requirements"
                                description="Documents and account requirements"
                                onClick={() =>
                                    setSection("requirements")
                                }
                            />

                            {/* Divider */}

                            <Box
                                borderTop="1px solid"
                                borderColor="gray.200"
                                my={3}
                            />

                            {/* Contact */}

                            <Box
                                p={4}
                                bg="blue.50"
                                borderRadius="xl"
                            >
                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                >
                                    Need more assistance?
                                </Text>

                                <Text
                                    fontSize="xs"
                                    color="gray.600"
                                    mt={1}
                                    mb={3}
                                >
                                    Contact our Admin or Secretary
                                    directly.
                                </Text>

                                <Button
                                    w="100%"
                                    size="sm"
                                    colorScheme="blue"
                                    borderRadius="lg"
                                    onClick={() => {
                                        // Later:
                                        // navigate("/login");
                                    }}
                                >
                                    Login to Contact Us
                                </Button>

                                <Text
                                    fontSize="10px"
                                    color="gray.500"
                                    textAlign="center"
                                    mt={2}
                                >
                                    Don't have an account?
                                </Text>

                                <Button
                                    w="100%"
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                    mt={1}
                                    onClick={() => {
                                        // Later:
                                        // navigate("/register");
                                    }}
                                >
                                    Create an Account
                                </Button>
                            </Box>
                        </VStack>
                    )}

                    {/* VEHICLE INFORMATION */}

                    {section === "vehicle" && (
                        <FaqContent
                            title="Vehicle Information"
                            items={[
                                {
                                    question:
                                        "What information is shown?",
                                    answer:
                                        "Each vehicle listing provides information such as brand, model, variant, year, color, specifications, features, selling price, and reservation fee.",
                                },
                                {
                                    question:
                                        "Are the displayed vehicles available?",
                                    answer:
                                        "The public vehicle browser displays vehicles that are currently marked as available.",
                                },
                                {
                                    question:
                                        "Can I view more vehicle photos?",
                                    answer:
                                        "Yes. Click the vehicle image to open the vehicle gallery and view its available photos.",
                                },
                            ]}
                        />
                    )}

                    {/* RESERVATION */}

                    {section === "reservation" && (
                        <FaqContent
                            title="How to Reserve"
                            items={[
                                {
                                    question:
                                        "How can I reserve a vehicle?",
                                    answer:
                                        "You need to sign in or create a customer account before making a vehicle reservation.",
                                },
                                {
                                    question:
                                        "Can I reserve without an account?",
                                    answer:
                                        "No. A customer account is required so the reservation can be associated with your customer information.",
                                },
                                {
                                    question:
                                        "Can I reserve more than one vehicle?",
                                    answer:
                                        "Reservation rules can depend on the dealership's current policies. Please contact our staff for assistance.",
                                },
                            ]}
                        />
                    )}

                    {/* PAYMENT */}

                    {section === "payment" && (
                        <FaqContent
                            title="Payment & Reservation Fee"
                            items={[
                                {
                                    question:
                                        "What is the reservation fee?",
                                    answer:
                                        "The reservation fee is the amount displayed on the vehicle listing for reserving that vehicle.",
                                },
                                {
                                    question:
                                        "Where can I see the vehicle price?",
                                    answer:
                                        "The selling price and reservation fee are displayed on each available vehicle listing.",
                                },
                                {
                                    question:
                                        "How can I make a payment?",
                                    answer:
                                        "After signing in and making a reservation, payment information can be managed through your customer account.",
                                },
                            ]}
                        />
                    )}

                    {/* REQUIREMENTS */}

                    {section === "requirements" && (
                        <FaqContent
                            title="Requirements"
                            items={[
                                {
                                    question:
                                        "Do I need an account?",
                                    answer:
                                        "Yes. An account is required for reservations and formal communication with our Admin or Secretary.",
                                },
                                {
                                    question:
                                        "Why do I need to register?",
                                    answer:
                                        "Registration allows your reservations, payments, and conversations to be associated with your customer account.",
                                },
                                {
                                    question:
                                        "How can I contact the staff?",
                                    answer:
                                        "Please login or register first. After authentication, you can use the customer messaging feature to contact our Admin or Secretary.",
                                },
                            ]}
                        />
                    )}
                </Box>
            )}

            {/* FLOATING HELP BUTTON */}

            <Box
                position="fixed"
                right={{ base: "16px", sm: "24px" }}
                bottom={{ base: "16px", sm: "24px" }}
                zIndex={1999}
            >
                <Box position="relative">
                    <IconButton
                        aria-label={
                            isOpen
                                ? "Close help"
                                : "Open help"
                        }
                        icon={
                            isOpen ? (
                                <CloseIcon />
                            ) : (
                                <ChatIcon />
                            )
                        }
                        colorScheme="blue"
                        borderRadius="full"
                        w="58px"
                        h="58px"
                        fontSize="22px"
                        boxShadow="0 8px 25px rgba(0, 0, 0, 0.20)"
                        onClick={() => {
                            if (isOpen) {
                                handleClose();
                            } else {
                                setIsOpen(true);
                            }
                        }}
                    />

                    {/* Small label */}

                    {!isOpen && (
                        <Box
                            position="absolute"
                            right="68px"
                            top="50%"
                            transform="translateY(-50%)"
                            bg="gray.800"
                            color="white"
                            px={3}
                            py={1.5}
                            borderRadius="md"
                            whiteSpace="nowrap"
                            fontSize="xs"
                            fontWeight="600"
                            display={{
                                base: "none",
                                sm: "block",
                            }}
                        >
                            Need Help?
                        </Box>
                    )}
                </Box>
            </Box>
        </>
    );
}

// HELP MENU ITEM

interface HelpMenuItemProps {
    icon: ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

function HelpMenuItem({
    icon,
    title,
    description,
    onClick,
}: HelpMenuItemProps) {
    return (
        <Flex
            align="center"
            gap={3}
            p={3}
            borderRadius="lg"
            cursor="pointer"
            transition="0.2s"
            _hover={{
                bg: "gray.50",
            }}
            onClick={onClick}
        >
            <Flex
                w="40px"
                h="40px"
                align="center"
                justify="center"
                bg="brand.50"
                borderRadius="lg"
                flexShrink={0}
            >
                {icon}
            </Flex>

            <Box flex="1">
                <Text
                    fontSize="sm"
                    fontWeight="600"
                >
                    {title}
                </Text>

                <Text
                    fontSize="xs"
                    color="gray.500"
                    mt={0.5}
                >
                    {description}
                </Text>
            </Box>

            <ChevronRightIcon color="gray.400" />
        </Flex>
    );
}

// FAQ CONTENT

interface FaqItem {
    question: string;
    answer: string;
}

interface FaqContentProps {
    title: string;
    items: FaqItem[];
}

function FaqContent({
    title,
    items,
}: FaqContentProps) {
    const [openIndex, setOpenIndex] =
        useState<number | null>(null);

    return (
        <VStack
            align="stretch"
            spacing={2}
            p={3}
        >
            <Text
                fontSize="sm"
                fontWeight="700"
                px={2}
                py={2}
            >
                {title}
            </Text>

            {items.map((item, index) => {
                const isOpen =
                    openIndex === index;

                return (
                    <Box
                        key={item.question}
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        overflow="hidden"
                    >
                        <Flex
                            align="center"
                            justify="space-between"
                            p={3}
                            cursor="pointer"
                            bg={
                                isOpen
                                    ? "blue.50"
                                    : "white"
                            }
                            onClick={() =>
                                setOpenIndex(
                                    isOpen ? null : index,
                                )
                            }
                        >
                            <Text
                                fontSize="sm"
                                fontWeight="600"
                                pr={3}
                            >
                                {item.question}
                            </Text>

                            <ChevronRightIcon
                                transform={
                                    isOpen
                                        ? "rotate(90deg)"
                                        : "none"
                                }
                                transition="0.2s"
                                flexShrink={0}
                            />
                        </Flex>

                        {isOpen && (
                            <Box
                                px={3}
                                pb={3}
                            >
                                <Text
                                    fontSize="xs"
                                    color="gray.600"
                                    lineHeight="1.7"
                                >
                                    {item.answer}
                                </Text>
                            </Box>
                        )}
                    </Box>
                );
            })}

            <Box
                mt={3}
                p={3}
                bg="gray.50"
                borderRadius="lg"
            >
                <Text
                    fontSize="xs"
                    color="gray.600"
                    textAlign="center"
                >
                    Still need help?
                </Text>

                <Button
                    mt={2}
                    w="100%"
                    size="sm"
                    colorScheme="blue"
                    borderRadius="lg"
                >
                    Login to Contact Us
                </Button>
            </Box>
        </VStack>
    );
}